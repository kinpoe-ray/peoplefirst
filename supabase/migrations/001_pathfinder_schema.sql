-- PathFinder 数据库架构

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
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

-- Contents table (职业去魅化内容)
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('运营', '产品', '设计', '开发', '市场')),
  truth_sentence TEXT NOT NULL,
  daily_timeline JSONB NOT NULL,
  highlight_moments JSONB NOT NULL,
  collapse_moments JSONB NOT NULL,
  skill_radar JSONB NOT NULL,
  tags TEXT[],
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  view_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table (技能试验)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('运营', '产品', '设计', '开发', '市场')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration_minutes INT NOT NULL,
  description TEXT NOT NULL,
  steps JSONB NOT NULL,
  skill_dimensions JSONB NOT NULL,
  tags TEXT[],
  attempt_count INT DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User task attempts table
CREATE TABLE IF NOT EXISTS user_task_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
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

-- Stories table (迷茫者故事)
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('运营', '产品', '设计', '开发', '市场')),
  attempts TEXT NOT NULL,
  failures TEXT NOT NULL,
  discoveries TEXT NOT NULL,
  tags TEXT[],
  like_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('content', 'task', 'story')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('content', 'task', 'story')),
  target_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  like_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contents_category ON contents(category);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_difficulty ON tasks(difficulty);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_target ON favorites(user_id, target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);

-- RPC function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(content_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE contents SET view_count = view_count + 1 WHERE id = content_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Public read access for contents
CREATE POLICY "Public can view contents" ON contents FOR SELECT USING (true);

-- Public read access for tasks
CREATE POLICY "Public can view tasks" ON tasks FOR SELECT USING (true);

-- Stories: public can view public stories
CREATE POLICY "Public can view public stories" ON stories FOR SELECT USING (is_public = true);

-- Users can manage their own data
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

-- Users can manage their own task attempts
CREATE POLICY "Users can view own attempts" ON user_task_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON user_task_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON user_task_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own stories
CREATE POLICY "Users can insert own stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories" ON stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

-- Users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Public can view comments
CREATE POLICY "Public can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
