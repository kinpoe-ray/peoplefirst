-- 修复游客模式数据库问题
-- 创建缺失的guest_profiles表和更新现有表结构

-- 创建guest_profiles表（如果不存在）
CREATE TABLE IF NOT EXISTS guest_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_token TEXT UNIQUE NOT NULL,
  user_type TEXT DEFAULT 'guest' CHECK (user_type IN ('student', 'teacher', 'alumni', 'guest')),
  full_name TEXT,
  avatar_url TEXT,
  school TEXT,
  major TEXT,
  graduation_year INTEGER,
  bio TEXT,
  is_public BOOLEAN DEFAULT true,
  is_guest BOOLEAN DEFAULT true,
  converted_to_user_id UUID,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_guest_profiles_token ON guest_profiles(guest_token);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_converted ON guest_profiles(converted_to_user_id);

-- 确保profiles表有正确的结构
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS guest_token TEXT,
ADD COLUMN IF NOT EXISTS converted_to_user_id UUID,
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;

-- 创建skills表（如果不存在）
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  level_required INTEGER DEFAULT 1,
  market_demand INTEGER DEFAULT 0,
  prerequisites TEXT[] DEFAULT '{}',
  difficulty_level INTEGER DEFAULT 1,
  learning_resources TEXT[] DEFAULT '{}',
  estimated_learning_time INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建user_skills表（如果不存在）
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  skill_id UUID,
  level INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建questions表（如果不存在）
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID,
  question_text TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  is_approved BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建badges表（如果不存在）
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  skill_id UUID,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirement_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建user_badges表（如果不存在）
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  badge_id UUID,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_questions_skill_id ON questions(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- 插入一些基础技能数据（如果表为空）
INSERT INTO skills (name, category, description, level_required, market_demand, difficulty_level) 
SELECT 'JavaScript', '编程语言', 'Web前端开发的核心编程语言', 1, 95, 2
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'JavaScript');

INSERT INTO skills (name, category, description, level_required, market_demand, difficulty_level) 
SELECT 'React', '前端框架', '流行的前端UI库', 2, 90, 3
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'React');

INSERT INTO skills (name, category, description, level_required, market_demand, difficulty_level) 
SELECT 'Python', '编程语言', '通用编程语言', 1, 90, 2
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Python');

INSERT INTO skills (name, category, description, level_required, market_demand, difficulty_level) 
SELECT 'UI设计', '设计', '用户界面设计', 1, 75, 2
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'UI设计');

-- 插入基础测评题目
INSERT INTO questions (skill_id, question_text, options, correct_answer, difficulty, is_approved)
SELECT 
  s.id,
  '关于' || s.name || '的基础知识测试题',
  '{"A": "选项A", "B": "选项B", "C": "选项C", "D": "选项D"}',
  'A',
  1,
  true
FROM skills s
WHERE s.name IN ('JavaScript', 'React', 'Python', 'UI设计')
AND NOT EXISTS (
  SELECT 1 FROM questions q 
  JOIN skills s2 ON q.skill_id = s2.id 
  WHERE s2.name = s.name
);

-- 插入基础徽章
INSERT INTO badges (name, description, rarity, requirement_score) VALUES
('初来乍到', '完成首次登录', 'common', 10),
('勇敢尝试', '完成第一次技能测评', 'common', 20),
('技能达人', '通过任意技能测评', 'rare', 50),
('快速学习者', '在5分钟内完成测评', 'rare', 30)
ON CONFLICT (name) DO NOTHING;