-- ============================================
-- PathFinder Platform - PostgreSQL Functions
-- ============================================
-- 此文件创建数据库函数用于计数更新等操作
-- 需要在Supabase Dashboard的SQL Editor中执行

-- 1. 删除已存在的函数
DROP FUNCTION IF EXISTS increment_content_views(UUID);
DROP FUNCTION IF EXISTS update_content_stats();

-- 2. 创建增加内容浏览计数的函数
CREATE OR REPLACE FUNCTION increment_content_views(content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE contents
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = content_id;
END;
$$;

-- 3. 创建触发器函数：当添加收藏时自动更新计数
CREATE OR REPLACE FUNCTION update_content_favorite_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.target_type = 'content' THEN
    UPDATE contents
    SET favorite_count = COALESCE(favorite_count, 0) + 1
    WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'content' THEN
    UPDATE contents
    SET favorite_count = GREATEST(COALESCE(favorite_count, 0) - 1, 0)
    WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 4. 创建触发器函数：当添加评论时自动更新计数
CREATE OR REPLACE FUNCTION update_content_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.target_type = 'content' THEN
    UPDATE contents
    SET comment_count = COALESCE(comment_count, 0) + 1
    WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'content' THEN
    UPDATE contents
    SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
    WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 5. 删除已存在的触发器
DROP TRIGGER IF EXISTS trigger_update_favorite_count ON favorites;
DROP TRIGGER IF EXISTS trigger_update_comment_count ON comments;

-- 6. 创建收藏触发器
CREATE TRIGGER trigger_update_favorite_count
AFTER INSERT OR DELETE ON favorites
FOR EACH ROW
EXECUTE FUNCTION update_content_favorite_count();

-- 7. 创建评论触发器
CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_content_comment_count();

-- 8. 验证函数和触发器创建成功
SELECT
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname IN ('increment_content_views', 'update_content_favorite_count', 'update_content_comment_count');

SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgname IN ('trigger_update_favorite_count', 'trigger_update_comment_count');
