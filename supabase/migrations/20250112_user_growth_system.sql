-- Migration: User Growth System
-- Created: 2025-01-12
-- Description: 添加用户成长系统相关表（等级、经验值、成就、每日任务）

-- ============================================
-- 1. 用户等级与经验表
-- ============================================
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  current_xp INTEGER NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  next_level_xp INTEGER NOT NULL DEFAULT 100,
  rank VARCHAR(20) DEFAULT 'Bronze', -- Bronze, Silver, Gold, Platinum, Diamond
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 索引
CREATE INDEX idx_user_levels_user ON user_levels(user_id);
CREATE INDEX idx_user_levels_level ON user_levels(level DESC);
CREATE INDEX idx_user_levels_total_xp ON user_levels(total_xp DESC);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_user_levels_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- 自动升级逻辑
  WHILE NEW.current_xp >= NEW.next_level_xp LOOP
    NEW.current_xp := NEW.current_xp - NEW.next_level_xp;
    NEW.level := NEW.level + 1;
    NEW.next_level_xp := FLOOR(100 * POWER(1.5, NEW.level - 1)); -- 指数增长
  END LOOP;

  -- 更新排名
  IF NEW.level >= 50 THEN
    NEW.rank := 'Diamond';
  ELSIF NEW.level >= 35 THEN
    NEW.rank := 'Platinum';
  ELSIF NEW.level >= 20 THEN
    NEW.rank := 'Gold';
  ELSIF NEW.level >= 10 THEN
    NEW.rank := 'Silver';
  ELSE
    NEW.rank := 'Bronze';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_levels
BEFORE UPDATE ON user_levels
FOR EACH ROW
EXECUTE FUNCTION update_user_levels_timestamp();

-- ============================================
-- 2. 成就系统
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  category VARCHAR(50) NOT NULL, -- learning, social, challenge, milestone, special
  rarity VARCHAR(20) NOT NULL DEFAULT 'common', -- common, rare, epic, legendary
  points INTEGER NOT NULL DEFAULT 10 CHECK (points >= 0),
  requirement_type VARCHAR(50) NOT NULL, -- skill_count, login_days, challenge_wins, etc.
  requirement_value INTEGER NOT NULL CHECK (requirement_value > 0),
  is_hidden BOOLEAN DEFAULT FALSE, -- 隐藏成就（解锁前不可见）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

-- 用户成就进度
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0),
  completed BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 索引
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id, completed);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC) WHERE completed = TRUE;

-- 触发器：成就解锁时自动奖励XP
CREATE OR REPLACE FUNCTION reward_achievement_xp()
RETURNS TRIGGER AS $$
DECLARE
  achievement_points INTEGER;
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    -- 获取成就奖励点数
    SELECT points INTO achievement_points FROM achievements WHERE id = NEW.achievement_id;

    -- 增加用户XP
    UPDATE user_levels
    SET
      current_xp = current_xp + achievement_points,
      total_xp = total_xp + achievement_points
    WHERE user_id = NEW.user_id;

    -- 设置解锁时间
    NEW.unlocked_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reward_achievement
BEFORE UPDATE ON user_achievements
FOR EACH ROW
EXECUTE FUNCTION reward_achievement_xp();

-- ============================================
-- 3. 每日任务系统
-- ============================================
CREATE TABLE IF NOT EXISTS daily_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  quest_type VARCHAR(50) NOT NULL, -- skill_practice, social_interaction, challenge, login
  target_count INTEGER NOT NULL DEFAULT 1 CHECK (target_count > 0),
  xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward > 0),
  valid_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_daily_quests_date ON daily_quests(valid_date, is_active);

-- 用户任务进度
CREATE TABLE IF NOT EXISTS user_quest_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES daily_quests(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0 CHECK (current_count >= 0),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- 索引
CREATE INDEX idx_user_quest_progress_user ON user_quest_progress(user_id, completed);

-- 触发器：任务完成时自动奖励XP
CREATE OR REPLACE FUNCTION reward_quest_xp()
RETURNS TRIGGER AS $$
DECLARE
  quest_xp_reward INTEGER;
BEGIN
  IF NEW.completed = TRUE AND (OLD IS NULL OR OLD.completed = FALSE) THEN
    -- 获取任务奖励XP
    SELECT xp_reward INTO quest_xp_reward FROM daily_quests WHERE id = NEW.quest_id;

    -- 增加用户XP
    UPDATE user_levels
    SET
      current_xp = current_xp + quest_xp_reward,
      total_xp = total_xp + quest_xp_reward
    WHERE user_id = NEW.user_id;

    -- 设置完成时间
    NEW.completed_at = NOW();
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reward_quest
BEFORE INSERT OR UPDATE ON user_quest_progress
FOR EACH ROW
EXECUTE FUNCTION reward_quest_xp();

-- ============================================
-- 4. 初始化数据
-- ============================================

-- 插入初始成就
INSERT INTO achievements (name, description, category, rarity, points, requirement_type, requirement_value) VALUES
-- 学习类成就
('初学者', '完成第一个技能学习', 'learning', 'common', 10, 'skill_count', 1),
('技能新手', '掌握5项技能', 'learning', 'common', 50, 'skill_count', 5),
('技能达人', '掌握10项技能', 'learning', 'rare', 100, 'skill_count', 10),
('技能大师', '掌握20项技能', 'learning', 'epic', 200, 'skill_count', 20),
('全能学者', '掌握50项技能', 'learning', 'legendary', 500, 'skill_count', 50),

-- 社交类成就
('社交新星', '获得10个粉丝', 'social', 'common', 20, 'follower_count', 10),
('人气王', '获得50个粉丝', 'social', 'rare', 100, 'follower_count', 50),
('意见领袖', '获得100个粉丝', 'social', 'epic', 200, 'follower_count', 100),
('热心助人', '帮助他人解答10个问题', 'social', 'rare', 80, 'help_count', 10),

-- 挑战类成就
('初战告捷', '完成第一个挑战', 'challenge', 'common', 15, 'challenge_wins', 1),
('挑战者', '完成10个挑战', 'challenge', 'rare', 100, 'challenge_wins', 10),
('战无不胜', '连续赢得5场挑战', 'challenge', 'epic', 150, 'challenge_streak', 5),

-- 里程碑成就
('坚持不懈', '连续登录7天', 'milestone', 'common', 50, 'login_streak', 7),
('长期主义', '连续登录30天', 'milestone', 'rare', 200, 'login_streak', 30),
('百日筑基', '连续登录100天', 'milestone', 'epic', 500, 'login_streak', 100),

-- 特殊成就
('早起的鸟儿', '在早上6点前登录', 'special', 'rare', 30, 'early_login', 1),
('夜猫子', '在凌晨2点后学习', 'special', 'rare', 30, 'night_owl', 1),
('速度之星', '1小时内完成5个练习', 'special', 'epic', 100, 'speed_practice', 5)
ON CONFLICT DO NOTHING;

-- 生成今天的每日任务
INSERT INTO daily_quests (title, description, quest_type, target_count, xp_reward, valid_date) VALUES
('每日学习', '完成1个技能练习', 'skill_practice', 1, 50, CURRENT_DATE),
('社交互动', '发布1条动态或评论', 'social_interaction', 1, 30, CURRENT_DATE),
('迎接挑战', '参加1次技能挑战', 'challenge', 1, 80, CURRENT_DATE),
('持续学习', '学习时间达到30分钟', 'learning_time', 30, 100, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. 创建视图
-- ============================================

-- 用户排行榜视图
CREATE OR REPLACE VIEW leaderboard_weekly AS
SELECT
  ul.user_id,
  p.full_name,
  p.avatar_url,
  ul.level,
  ul.total_xp,
  ul.rank,
  ROW_NUMBER() OVER (ORDER BY ul.total_xp DESC) as ranking
FROM user_levels ul
JOIN profiles p ON ul.user_id = p.id
WHERE p.user_type IN ('student', 'teacher', 'alumni')
ORDER BY ul.total_xp DESC
LIMIT 100;

-- 用户成就统计视图
CREATE OR REPLACE VIEW user_achievement_stats AS
SELECT
  user_id,
  COUNT(*) as total_achievements,
  COUNT(*) FILTER (WHERE completed = TRUE) as completed_achievements,
  COUNT(*) FILTER (WHERE completed = TRUE AND (SELECT rarity FROM achievements WHERE id = achievement_id) = 'legendary') as legendary_count,
  SUM((SELECT points FROM achievements WHERE id = achievement_id)) FILTER (WHERE completed = TRUE) as total_points
FROM user_achievements
GROUP BY user_id;

-- ============================================
-- 6. RLS (Row Level Security) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;

-- user_levels 策略
CREATE POLICY "用户可以查看所有人的等级信息" ON user_levels
  FOR SELECT USING (true);

CREATE POLICY "用户只能更新自己的等级信息" ON user_levels
  FOR UPDATE USING (auth.uid() = user_id);

-- user_achievements 策略
CREATE POLICY "用户可以查看所有人的公开成就" ON user_achievements
  FOR SELECT USING (true);

CREATE POLICY "用户只能更新自己的成就" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- user_quest_progress 策略
CREATE POLICY "用户只能查看自己的任务进度" ON user_quest_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的任务进度" ON user_quest_progress
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 7. 辅助函数
-- ============================================

-- 为新用户初始化等级信息
CREATE OR REPLACE FUNCTION initialize_user_level()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_levels (user_id, level, current_xp, total_xp, next_level_xp, rank)
  VALUES (NEW.id, 1, 0, 0, 100, 'Bronze')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_user_level
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION initialize_user_level();

-- 增加XP的函数（供应用调用）
CREATE OR REPLACE FUNCTION add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
  old_level INTEGER;
  new_level INTEGER;
  leveled_up BOOLEAN := FALSE;
  result JSONB;
BEGIN
  -- 获取当前等级
  SELECT level INTO old_level FROM user_levels WHERE user_id = p_user_id;

  -- 增加XP
  UPDATE user_levels
  SET
    current_xp = current_xp + p_xp_amount,
    total_xp = total_xp + p_xp_amount
  WHERE user_id = p_user_id
  RETURNING level INTO new_level;

  -- 检查是否升级
  IF new_level > old_level THEN
    leveled_up := TRUE;
  END IF;

  -- 构造返回结果
  SELECT jsonb_build_object(
    'success', TRUE,
    'xp_added', p_xp_amount,
    'old_level', old_level,
    'new_level', new_level,
    'leveled_up', leveled_up
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查并更新成就进度
CREATE OR REPLACE FUNCTION check_achievement_progress(
  p_user_id UUID,
  p_requirement_type VARCHAR(50),
  p_current_value INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- 更新匹配的成就进度
  UPDATE user_achievements ua
  SET
    progress = p_current_value,
    completed = CASE
      WHEN p_current_value >= (SELECT requirement_value FROM achievements WHERE id = ua.achievement_id)
      THEN TRUE
      ELSE FALSE
    END
  FROM achievements a
  WHERE
    ua.achievement_id = a.id
    AND ua.user_id = p_user_id
    AND a.requirement_type = p_requirement_type
    AND ua.completed = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE user_levels IS '用户等级与经验值表';
COMMENT ON TABLE achievements IS '成就定义表';
COMMENT ON TABLE user_achievements IS '用户成就进度表';
COMMENT ON TABLE daily_quests IS '每日任务表';
COMMENT ON TABLE user_quest_progress IS '用户任务进度表';
