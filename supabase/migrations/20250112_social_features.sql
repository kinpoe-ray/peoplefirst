-- Migration: Social Features
-- Created: 2025-01-12
-- Description: 添加社交功能相关表（关注、动态、评论、点赞、学习小组）

-- ============================================
-- 1. 用户关注关系
-- ============================================
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 索引
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id, created_at DESC);
CREATE INDEX idx_user_follows_following ON user_follows(following_id, created_at DESC);

-- ============================================
-- 2. 动态发布
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 5000),
  post_type VARCHAR(50) NOT NULL DEFAULT 'status', -- status, achievement, question, resource, milestone
  media_urls TEXT[], -- 图片/视频 URLs
  visibility VARCHAR(20) NOT NULL DEFAULT 'public', -- public, followers, private
  like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  comment_count INTEGER NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  share_count INTEGER NOT NULL DEFAULT 0 CHECK (share_count >= 0),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_posts_author ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_type ON posts(post_type, created_at DESC);
CREATE INDEX idx_posts_visibility ON posts(visibility, created_at DESC);
CREATE INDEX idx_posts_trending ON posts(like_count DESC, comment_count DESC, created_at DESC);

-- 触发器：更新时间戳
CREATE OR REPLACE FUNCTION update_posts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_posts
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_posts_timestamp();

-- ============================================
-- 3. 评论系统
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 2000),
  like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_comments_post ON comments(post_id, created_at ASC);
CREATE INDEX idx_comments_author ON comments(author_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- 触发器：评论时更新动态评论数
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comment_count();

-- ============================================
-- 4. 点赞系统
-- ============================================
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id, created_at DESC);

-- 触发器：点赞动态时更新计数
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;

    -- 奖励作者XP
    UPDATE user_levels
    SET current_xp = current_xp + 2, total_xp = total_xp + 2
    WHERE user_id = (SELECT author_id FROM posts WHERE id = NEW.post_id);

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_like_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_like_count();

-- 触发器：点赞评论时更新计数
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_like_count
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW
EXECUTE FUNCTION update_comment_like_count();

-- ============================================
-- 5. 学习小组
-- ============================================
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  skill_focus VARCHAR(100), -- 主要学习技能
  max_members INTEGER NOT NULL DEFAULT 10 CHECK (max_members > 0 AND max_members <= 100),
  current_members INTEGER NOT NULL DEFAULT 0 CHECK (current_members >= 0),
  creator_id UUID NOT NULL REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_study_groups_creator ON study_groups(creator_id);
CREATE INDEX idx_study_groups_skill ON study_groups(skill_focus);
CREATE INDEX idx_study_groups_active ON study_groups(is_active, is_public, current_members);

CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member', -- admin, moderator, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 索引
CREATE INDEX idx_study_group_members_group ON study_group_members(group_id, joined_at);
CREATE INDEX idx_study_group_members_user ON study_group_members(user_id, joined_at DESC);

-- 触发器：加入/退出小组时更新成员数
CREATE OR REPLACE FUNCTION update_study_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE study_groups SET current_members = current_members + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE study_groups SET current_members = GREATEST(current_members - 1, 0) WHERE id = OLD.group_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_study_group_member_count
AFTER INSERT OR DELETE ON study_group_members
FOR EACH ROW
EXECUTE FUNCTION update_study_group_member_count();

-- 小组消息
CREATE TABLE IF NOT EXISTS study_group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 2000),
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, link, achievement
  metadata JSONB, -- 额外数据（如图片URL、链接等）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_study_group_messages_group ON study_group_messages(group_id, created_at DESC);

-- ============================================
-- 6. 通知系统
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- achievement, follow, like, comment, quest, mention, group_invite
  title VARCHAR(200) NOT NULL,
  message TEXT,
  link VARCHAR(500), -- 跳转链接
  actor_id UUID REFERENCES profiles(id), -- 触发通知的用户
  entity_type VARCHAR(50), -- post, comment, achievement等
  entity_id UUID, -- 关联实体ID
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type, created_at DESC);

-- ============================================
-- 7. 活动日志
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- login, skill_practice, post_create, challenge_complete, achievement_unlock
  entity_type VARCHAR(50), -- skill, post, challenge, achievement
  entity_id UUID,
  metadata JSONB, -- 额外数据
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type, created_at DESC);
CREATE INDEX idx_activity_logs_date ON activity_logs(DATE(created_at), user_id);

-- ============================================
-- 8. 创建视图
-- ============================================

-- 热门动态视图
CREATE OR REPLACE VIEW trending_posts AS
SELECT
  p.*,
  pr.full_name as author_name,
  pr.avatar_url as author_avatar,
  (p.like_count * 2 + p.comment_count * 3 + p.share_count * 5) as trending_score
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE
  p.visibility = 'public'
  AND p.created_at > NOW() - INTERVAL '7 days'
ORDER BY trending_score DESC, p.created_at DESC
LIMIT 100;

-- 用户动态流视图（关注的人 + 自己的动态）
CREATE OR REPLACE FUNCTION get_user_feed(p_user_id UUID, p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  post_id UUID,
  author_id UUID,
  author_name VARCHAR,
  author_avatar TEXT,
  content TEXT,
  post_type VARCHAR,
  media_urls TEXT[],
  like_count INTEGER,
  comment_count INTEGER,
  liked_by_me BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as post_id,
    p.author_id,
    pr.full_name as author_name,
    pr.avatar_url as author_avatar,
    p.content,
    p.post_type,
    p.media_urls,
    p.like_count,
    p.comment_count,
    EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = p_user_id) as liked_by_me,
    p.created_at
  FROM posts p
  JOIN profiles pr ON p.author_id = pr.id
  WHERE
    (p.author_id = p_user_id OR p.author_id IN (
      SELECT following_id FROM user_follows WHERE follower_id = p_user_id
    ))
    AND (p.visibility = 'public' OR (p.visibility = 'followers' AND p.author_id IN (
      SELECT following_id FROM user_follows WHERE follower_id = p_user_id
    )) OR p.author_id = p_user_id)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. RLS (Row Level Security) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- user_follows 策略
CREATE POLICY "用户可以查看所有关注关系" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "用户可以关注他人" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "用户可以取消关注" ON user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- posts 策略
CREATE POLICY "用户可以查看公开动态" ON posts
  FOR SELECT USING (
    visibility = 'public'
    OR author_id = auth.uid()
    OR (visibility = 'followers' AND EXISTS (
      SELECT 1 FROM user_follows WHERE following_id = posts.author_id AND follower_id = auth.uid()
    ))
  );

CREATE POLICY "用户可以创建自己的动态" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "用户可以编辑自己的动态" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "用户可以删除自己的动态" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- comments 策略
CREATE POLICY "用户可以查看评论" ON comments
  FOR SELECT USING (true);

CREATE POLICY "用户可以发表评论" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "用户可以删除自己的评论" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- likes 策略
CREATE POLICY "用户可以查看点赞" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "用户可以点赞" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以取消点赞" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- notifications 策略
CREATE POLICY "用户只能查看自己的通知" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的通知状态" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 10. 触发器：创建通知
-- ============================================

-- 关注时通知对方
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, actor_id, link)
  SELECT
    NEW.following_id,
    'follow',
    '新粉丝',
    pr.full_name || ' 关注了你',
    NEW.follower_id,
    '/profile/' || NEW.follower_id::TEXT
  FROM profiles pr WHERE pr.id = NEW.follower_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_follow
AFTER INSERT ON user_follows
FOR EACH ROW
EXECUTE FUNCTION notify_on_follow();

-- 评论时通知作者
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;

  -- 只在评论他人动态时通知
  IF post_author_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, type, title, message, actor_id, entity_type, entity_id, link)
    SELECT
      post_author_id,
      'comment',
      '新评论',
      pr.full_name || ' 评论了你的动态',
      NEW.author_id,
      'post',
      NEW.post_id,
      '/posts/' || NEW.post_id::TEXT
    FROM profiles pr WHERE pr.id = NEW.author_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_comment
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION notify_on_comment();

-- 点赞时通知作者（限制每人每天最多通知一次）
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  already_notified_today BOOLEAN;
BEGIN
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;

  -- 只在点赞他人动态时通知
  IF post_author_id != NEW.user_id THEN
    -- 检查今天是否已通知过
    SELECT EXISTS(
      SELECT 1 FROM notifications
      WHERE user_id = post_author_id
        AND actor_id = NEW.user_id
        AND type = 'like'
        AND entity_id = NEW.post_id
        AND DATE(created_at) = CURRENT_DATE
    ) INTO already_notified_today;

    IF NOT already_notified_today THEN
      INSERT INTO notifications (user_id, type, title, message, actor_id, entity_type, entity_id, link)
      SELECT
        post_author_id,
        'like',
        '新点赞',
        pr.full_name || ' 赞了你的动态',
        NEW.user_id,
        'post',
        NEW.post_id,
        '/posts/' || NEW.post_id::TEXT
      FROM profiles pr WHERE pr.id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_like
AFTER INSERT ON post_likes
FOR EACH ROW
EXECUTE FUNCTION notify_on_like();

COMMENT ON TABLE user_follows IS '用户关注关系表';
COMMENT ON TABLE posts IS '动态发布表';
COMMENT ON TABLE comments IS '评论表';
COMMENT ON TABLE post_likes IS '动态点赞表';
COMMENT ON TABLE comment_likes IS '评论点赞表';
COMMENT ON TABLE study_groups IS '学习小组表';
COMMENT ON TABLE study_group_members IS '学习小组成员表';
COMMENT ON TABLE study_group_messages IS '小组消息表';
COMMENT ON TABLE notifications IS '通知表';
COMMENT ON TABLE activity_logs IS '活动日志表';
