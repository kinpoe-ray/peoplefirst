-- Migration: Learning Paths & AI Recommendations
-- Created: 2025-01-12
-- Description: 添加学习路径系统和技能认证

-- ============================================
-- 1. 学习路径模板
-- ============================================
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  estimated_hours INTEGER CHECK (estimated_hours > 0),
  target_role VARCHAR(100), -- 目标职位
  skill_ids UUID[], -- 关联的技能IDs
  created_by UUID REFERENCES profiles(id),
  is_template BOOLEAN DEFAULT TRUE, -- 是否为模板（供复用）
  is_public BOOLEAN DEFAULT TRUE,
  enrolled_count INTEGER DEFAULT 0 CHECK (enrolled_count >= 0),
  completion_count INTEGER DEFAULT 0 CHECK (completion_count >= 0),
  avg_rating NUMERIC(3, 2) DEFAULT 0 CHECK (avg_rating >= 0 AND avg_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_learning_paths_difficulty ON learning_paths(difficulty_level);
CREATE INDEX idx_learning_paths_target ON learning_paths(target_role);
CREATE INDEX idx_learning_paths_public ON learning_paths(is_public, is_template);

-- ============================================
-- 2. 学习路径步骤
-- ============================================
CREATE TABLE IF NOT EXISTS learning_path_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL CHECK (step_order > 0),
  skill_id UUID REFERENCES skills(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  resources JSONB, -- {videos: [], articles: [], courses: [], exercises: []}
  estimated_hours INTEGER,
  prerequisites UUID[], -- 前置步骤IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(path_id, step_order)
);

-- 索引
CREATE INDEX idx_learning_path_steps_path ON learning_path_steps(path_id, step_order);

-- ============================================
-- 3. 用户学习路径
-- ============================================
CREATE TABLE IF NOT EXISTS user_learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES learning_paths(id),
  current_step INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress', -- in_progress, completed, paused, abandoned
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  UNIQUE(user_id, path_id)
);

-- 索引
CREATE INDEX idx_user_learning_paths_user ON user_learning_paths(user_id, status);
CREATE INDEX idx_user_learning_paths_path ON user_learning_paths(path_id, status);

-- 触发器：报名时增加计数
CREATE OR REPLACE FUNCTION update_path_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE learning_paths SET enrolled_count = enrolled_count + 1 WHERE id = NEW.path_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE learning_paths
    SET
      completion_count = completion_count + 1,
      avg_rating = CASE
        WHEN NEW.rating IS NOT NULL
        THEN (avg_rating * completion_count + NEW.rating) / (completion_count + 1)
        ELSE avg_rating
      END
    WHERE id = NEW.path_id;

    NEW.completed_at = NOW();

    -- 奖励完成XP
    UPDATE user_levels
    SET current_xp = current_xp + 200, total_xp = total_xp + 200
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_path_enrollment
AFTER INSERT OR UPDATE ON user_learning_paths
FOR EACH ROW
EXECUTE FUNCTION update_path_enrollment();

-- ============================================
-- 4. 学习路径步骤进度
-- ============================================
CREATE TABLE IF NOT EXISTS user_step_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_path_id UUID NOT NULL REFERENCES user_learning_paths(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES learning_path_steps(id),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0 CHECK (time_spent_minutes >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_path_id, step_id)
);

-- 索引
CREATE INDEX idx_user_step_progress_path ON user_step_progress(user_path_id, completed);

-- 触发器：完成步骤时更新路径进度
CREATE OR REPLACE FUNCTION update_path_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_steps INTEGER;
  completed_steps INTEGER;
  new_progress INTEGER;
  path_id_var UUID;
  user_id_var UUID;
BEGIN
  IF NEW.completed = TRUE AND (OLD IS NULL OR OLD.completed = FALSE) THEN
    -- 获取路径ID和用户ID
    SELECT ulp.path_id, ulp.user_id INTO path_id_var, user_id_var
    FROM user_learning_paths ulp
    WHERE ulp.id = NEW.user_path_id;

    -- 计算总步骤数
    SELECT COUNT(*) INTO total_steps
    FROM learning_path_steps
    WHERE path_id = path_id_var;

    -- 计算已完成步骤数
    SELECT COUNT(*) INTO completed_steps
    FROM user_step_progress usp
    WHERE usp.user_path_id = NEW.user_path_id AND usp.completed = TRUE;

    -- 计算进度百分比
    IF total_steps > 0 THEN
      new_progress := (completed_steps * 100 / total_steps);
    ELSE
      new_progress := 0;
    END IF;

    -- 更新路径进度
    UPDATE user_learning_paths
    SET
      progress_percentage = new_progress,
      status = CASE
        WHEN new_progress >= 100 THEN 'completed'
        ELSE status
      END,
      last_accessed_at = NOW()
    WHERE id = NEW.user_path_id;

    -- 奖励XP
    UPDATE user_levels
    SET current_xp = current_xp + 20, total_xp = total_xp + 20
    WHERE user_id = user_id_var;

    NEW.completed_at = NOW();
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_path_progress
BEFORE INSERT OR UPDATE ON user_step_progress
FOR EACH ROW
EXECUTE FUNCTION update_path_progress();

-- ============================================
-- 5. 技能认证系统
-- ============================================
CREATE TABLE IF NOT EXISTS skill_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id),
  certification_level VARCHAR(50) NOT NULL, -- beginner, intermediate, advanced, expert
  score INTEGER CHECK (score >= 0 AND score <= 100),
  certificate_url TEXT, -- 证书图片URL
  certificate_id VARCHAR(100) UNIQUE, -- 证书编号
  verified_by UUID REFERENCES profiles(id), -- 验证者（教师/系统）
  verification_method VARCHAR(50), -- auto, peer_review, expert_review
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- 过期时间（某些证书需要定期更新）
  is_public BOOLEAN DEFAULT TRUE,
  metadata JSONB, -- 额外信息（考核ID、项目链接等）
  UNIQUE(user_id, skill_id, certification_level)
);

-- 索引
CREATE INDEX idx_skill_certifications_user ON skill_certifications(user_id, issued_at DESC);
CREATE INDEX idx_skill_certifications_skill ON skill_certifications(skill_id, certification_level);
CREATE INDEX idx_skill_certifications_valid ON skill_certifications(expires_at) WHERE expires_at IS NOT NULL;

-- 触发器：颁发证书时生成证书编号
CREATE OR REPLACE FUNCTION generate_certificate_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_id IS NULL THEN
    NEW.certificate_id := 'CERT-' ||
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      UPPER(SUBSTRING(MD5(NEW.user_id::TEXT || NEW.skill_id::TEXT || NOW()::TEXT) FROM 1 FOR 8));
  END IF;

  -- 奖励认证XP
  UPDATE user_levels
  SET
    current_xp = current_xp + CASE NEW.certification_level
      WHEN 'beginner' THEN 50
      WHEN 'intermediate' THEN 100
      WHEN 'advanced' THEN 200
      WHEN 'expert' THEN 500
      ELSE 50
    END,
    total_xp = total_xp + CASE NEW.certification_level
      WHEN 'beginner' THEN 50
      WHEN 'intermediate' THEN 100
      WHEN 'advanced' THEN 200
      WHEN 'expert' THEN 500
      ELSE 50
    END
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_certificate_id
BEFORE INSERT ON skill_certifications
FOR EACH ROW
EXECUTE FUNCTION generate_certificate_id();

-- ============================================
-- 6. 技能考核记录
-- ============================================
CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id),
  assessment_type VARCHAR(50) NOT NULL, -- quiz, project, peer_review, challenge
  score INTEGER CHECK (score >= 0 AND score <= 100),
  max_score INTEGER DEFAULT 100,
  passed BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER,
  answers JSONB, -- 答题记录
  feedback TEXT,
  assessed_by UUID REFERENCES profiles(id), -- 评分者
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_skill_assessments_user ON skill_assessments(user_id, assessed_at DESC);
CREATE INDEX idx_skill_assessments_skill ON skill_assessments(skill_id, passed);

-- ============================================
-- 7. AI 推荐记录
-- ============================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50) NOT NULL, -- skill, path, career, resource
  content JSONB NOT NULL, -- 推荐内容
  reason TEXT, -- 推荐理由
  confidence_score NUMERIC(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  user_feedback VARCHAR(20), -- helpful, not_helpful, ignored
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- 索引
CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id, expires_at DESC);
CREATE INDEX idx_ai_recommendations_type ON ai_recommendations(recommendation_type, created_at DESC);

-- ============================================
-- 8. 创建视图
-- ============================================

-- 热门学习路径
CREATE OR REPLACE VIEW popular_learning_paths AS
SELECT
  lp.*,
  pr.full_name as creator_name,
  (lp.enrolled_count * 0.3 + lp.completion_count * 0.5 + lp.avg_rating * 20) as popularity_score
FROM learning_paths lp
LEFT JOIN profiles pr ON lp.created_by = pr.id
WHERE lp.is_public = TRUE AND lp.is_template = TRUE
ORDER BY popularity_score DESC
LIMIT 50;

-- 用户技能进度统计
CREATE OR REPLACE VIEW user_skill_stats AS
SELECT
  us.user_id,
  COUNT(DISTINCT us.skill_id) as total_skills,
  AVG(us.score) as avg_score,
  COUNT(DISTINCT sc.id) as certifications_count,
  COUNT(DISTINCT ulp.id) FILTER (WHERE ulp.status = 'completed') as completed_paths
FROM user_skills us
LEFT JOIN skill_certifications sc ON us.user_id = sc.user_id AND us.skill_id = sc.skill_id
LEFT JOIN user_learning_paths ulp ON us.user_id = ulp.user_id
GROUP BY us.user_id;

-- ============================================
-- 9. RLS 策略
-- ============================================

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;

-- learning_paths 策略
CREATE POLICY "所有人可以查看公开学习路径" ON learning_paths
  FOR SELECT USING (is_public = TRUE OR created_by = auth.uid());

CREATE POLICY "用户可以创建学习路径" ON learning_paths
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "创建者可以编辑自己的路径" ON learning_paths
  FOR UPDATE USING (auth.uid() = created_by);

-- user_learning_paths 策略
CREATE POLICY "用户可以查看自己的学习路径" ON user_learning_paths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以报名学习路径" ON user_learning_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的学习进度" ON user_learning_paths
  FOR UPDATE USING (auth.uid() = user_id);

-- skill_certifications 策略
CREATE POLICY "所有人可以查看公开证书" ON skill_certifications
  FOR SELECT USING (is_public = TRUE OR user_id = auth.uid());

-- ============================================
-- 10. 辅助函数
-- ============================================

-- 推荐学习路径（基于用户技能）
CREATE OR REPLACE FUNCTION recommend_learning_paths(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  path_id UUID,
  title VARCHAR,
  match_score NUMERIC,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_skills_data AS (
    SELECT skill_id, level
    FROM user_skills
    WHERE user_id = p_user_id
  ),
  path_scores AS (
    SELECT
      lp.id,
      lp.title,
      -- 计算匹配度：已有技能 / 总技能数
      COALESCE(
        (SELECT COUNT(*)
         FROM unnest(lp.skill_ids) AS sid
         WHERE sid IN (SELECT skill_id FROM user_skills_data)
        )::NUMERIC / NULLIF(array_length(lp.skill_ids, 1), 0),
        0
      ) as match_score,
      lp.enrolled_count,
      lp.avg_rating
    FROM learning_paths lp
    WHERE
      lp.is_public = TRUE
      AND lp.is_template = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM user_learning_paths ulp
        WHERE ulp.user_id = p_user_id AND ulp.path_id = lp.id
      )
  )
  SELECT
    ps.id,
    ps.title,
    ps.match_score,
    CASE
      WHEN ps.match_score >= 0.7 THEN '你已掌握大部分前置技能，可以快速完成！'
      WHEN ps.match_score >= 0.4 THEN '你已具备部分基础，这是提升的好机会。'
      ELSE '这是一个全新领域，挑战自己吧！'
    END as reason
  FROM path_scores ps
  ORDER BY
    (ps.match_score * 0.4 + ps.enrolled_count * 0.0001 + ps.avg_rating * 0.1) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE learning_paths IS '学习路径模板表';
COMMENT ON TABLE learning_path_steps IS '学习路径步骤表';
COMMENT ON TABLE user_learning_paths IS '用户学习路径表';
COMMENT ON TABLE user_step_progress IS '用户步骤进度表';
COMMENT ON TABLE skill_certifications IS '技能认证表';
COMMENT ON TABLE skill_assessments IS '技能考核记录表';
COMMENT ON TABLE ai_recommendations IS 'AI推荐记录表';
