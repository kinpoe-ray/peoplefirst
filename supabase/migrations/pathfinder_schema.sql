-- PathFinder Platform Database Schema
-- 创建时间: 2025-11-13

-- ============= 用户表 =============
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  current_career VARCHAR(100),
  career_confusion_level INT CHECK (career_confusion_level >= 1 AND career_confusion_level <= 10),
  interested_categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============= 职业内容表 =============
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('运营', '产品', '设计', '开发', '市场')),
  truth_sentence TEXT NOT NULL,
  daily_timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlight_moments JSONB NOT NULL DEFAULT '[]'::jsonb,
  collapse_moments JSONB NOT NULL DEFAULT '[]'::jsonb,
  skill_radar JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  view_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 内容表索引
CREATE INDEX IF NOT EXISTS idx_contents_category ON contents(category);
CREATE INDEX IF NOT EXISTS idx_contents_author ON contents(author_id);
CREATE INDEX IF NOT EXISTS idx_contents_created ON contents(created_at DESC);

-- ============= 任务表 =============
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('运营', '产品', '设计', '开发', '市场')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration_minutes INT NOT NULL,
  description TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  skill_dimensions TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  attempt_count INT DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务表索引
CREATE INDEX IF NOT EXISTS idx_tasks_difficulty ON tasks(difficulty);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

-- ============= 用户任务尝试表 =============
CREATE TABLE IF NOT EXISTS user_task_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_step INT DEFAULT 1,
  submission_content JSONB,
  ai_feedback TEXT,
  skill_scores JSONB,
  time_spent_minutes INT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, task_id, started_at)
);

-- 任务尝试表索引
CREATE INDEX IF NOT EXISTS idx_attempts_user ON user_task_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_task ON user_task_attempts(task_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON user_task_attempts(status);

-- ============= 故事表 =============
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('运营', '产品', '设计', '开发', '市场')),
  attempts TEXT NOT NULL,
  failures TEXT NOT NULL,
  discoveries TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  like_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 故事表索引
CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_public ON stories(is_public);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at DESC);

-- ============= 收藏表 =============
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('content', 'task', 'story')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- 收藏表索引
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_target ON favorites(target_type, target_id);

-- ============= 评论表 =============
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('content', 'task', 'story')),
  target_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  like_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 评论表索引
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- ============= 触发器函数 =============

-- 更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表创建触发器
CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 浏览计数增加函数
CREATE OR REPLACE FUNCTION increment_content_views(content_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE contents SET view_count = view_count + 1 WHERE id = content_id;
END;
$$ LANGUAGE plpgsql;

-- ============= Row Level Security (RLS) =============

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users表策略
CREATE POLICY "Users can read all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Contents表策略
CREATE POLICY "Anyone can read contents" ON contents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create contents" ON contents FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own contents" ON contents FOR UPDATE USING (auth.uid() = author_id);

-- Tasks表策略
CREATE POLICY "Anyone can read tasks" ON tasks FOR SELECT USING (true);

-- User Task Attempts表策略
CREATE POLICY "Users can read own attempts" ON user_task_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own attempts" ON user_task_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON user_task_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Stories表策略
CREATE POLICY "Anyone can read public stories" ON stories FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Authenticated users can create stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories" ON stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

-- Favorites表策略
CREATE POLICY "Users can read own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Comments表策略
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ============= 示例数据 =============

-- 插入示例职业内容 (可选)
INSERT INTO contents (title, category, truth_sentence, daily_timeline, highlight_moments, collapse_moments, skill_radar, tags)
VALUES
(
  '产品经理的真实一天',
  '产品',
  '不是画原型图那么简单,80%时间在开会和协调资源',
  '[
    {"time": "09:00", "activity": "晨会,同步昨日进度", "mood": "neutral"},
    {"time": "10:00", "activity": "需求评审会议", "mood": "positive"},
    {"time": "12:00", "activity": "午餐,与设计师讨论交互方案", "mood": "positive"},
    {"time": "14:00", "activity": "处理紧急Bug,协调开发排期", "mood": "negative"},
    {"time": "16:00", "activity": "用户访谈,收集反馈", "mood": "positive"},
    {"time": "18:00", "activity": "整理需求文档", "mood": "neutral"},
    {"time": "20:00", "activity": "加班完成PRD", "mood": "negative"}
  ]'::jsonb,
  '[
    {"title": "用户夸奖产品好用", "description": "收到用户正面反馈时的成就感无可比拟"},
    {"title": "功能成功上线", "description": "看着自己规划的功能被千万用户使用"}
  ]'::jsonb,
  '[
    {"title": "需求被技术否决", "description": "辛苦设计的方案因技术难度被全盘推翻"},
    {"title": "KPI压力巨大", "description": "DAU不增长时的焦虑和无力感"}
  ]'::jsonb,
  '{"creativity": 8, "logic": 9, "communication": 9, "stress_resistance": 7, "learning": 8}'::jsonb,
  ARRAY['互联网', '需求分析', '跨部门协作']
);

-- 插入示例任务 (可选)
INSERT INTO tasks (title, category, difficulty, duration_minutes, description, steps, skill_dimensions, tags)
VALUES
(
  '设计一个外卖App的核心功能',
  '产品',
  'medium',
  45,
  '通过设计外卖App的核心功能,了解产品设计的基本流程和思维方式',
  '[
    {"step_number": 1, "title": "理解场景", "content": "想象你是一个饥饿的用户,你需要什么功能?", "type": "text"},
    {"step_number": 2, "title": "功能清单", "content": "列出外卖App的核心功能(至少5个)", "type": "form"},
    {"step_number": 3, "title": "优先级排序", "content": "对功能进行优先级排序,说明理由", "type": "form"},
    {"step_number": 4, "title": "绘制流程图", "content": "画出点餐到送达的完整流程", "type": "form"},
    {"step_number": 5, "title": "AI评估", "content": "提交后获得AI评估和改进建议", "type": "result"}
  ]'::jsonb,
  ARRAY['逻辑思维', '用户洞察', '产品规划'],
  ARRAY['产品设计', '用户体验', '流程设计']
);

COMMENT ON TABLE users IS 'PathFinder用户表';
COMMENT ON TABLE contents IS '职业内容去魅化表';
COMMENT ON TABLE tasks IS '技能试验任务表';
COMMENT ON TABLE user_task_attempts IS '用户任务尝试记录表';
COMMENT ON TABLE stories IS '迷茫者故事表';
COMMENT ON TABLE favorites IS '收藏表';
COMMENT ON TABLE comments IS '评论表';
