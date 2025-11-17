-- ============================================
-- PathFinder Platform - 更新内容统计计数
-- ============================================
-- 此文件用于修复现有内容的浏览、收藏、评论计数
-- 需要在Supabase Dashboard的SQL Editor中执行

-- 1. 检查当前统计数据
SELECT
  id,
  title,
  view_count,
  favorite_count,
  comment_count
FROM contents
LIMIT 10;

-- 2. 如果字段不存在，添加它们（如果 schema 没有这些字段）
-- ALTER TABLE contents ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
-- ALTER TABLE contents ADD COLUMN IF NOT EXISTS favorite_count INT DEFAULT 0;
-- ALTER TABLE contents ADD COLUMN IF NOT EXISTS comment_count INT DEFAULT 0;

-- 3. 将 NULL 值更新为 0
UPDATE contents
SET
  view_count = COALESCE(view_count, 0),
  favorite_count = COALESCE(favorite_count, 0),
  comment_count = COALESCE(comment_count, 0)
WHERE
  view_count IS NULL
  OR favorite_count IS NULL
  OR comment_count IS NULL;

-- 4. 根据实际数据更新收藏计数
UPDATE contents c
SET favorite_count = (
  SELECT COUNT(*)
  FROM favorites f
  WHERE f.target_type = 'content'
    AND f.target_id = c.id
);

-- 5. 根据实际数据更新评论计数
UPDATE contents c
SET comment_count = (
  SELECT COUNT(*)
  FROM comments cm
  WHERE cm.target_type = 'content'
    AND cm.target_id = c.id
);

-- 6. 验证更新结果
SELECT
  id,
  title,
  view_count,
  favorite_count,
  comment_count
FROM contents
LIMIT 10;

-- 7. 查看总统计
SELECT
  COUNT(*) as total_contents,
  SUM(view_count) as total_views,
  SUM(favorite_count) as total_favorites,
  SUM(comment_count) as total_comments,
  AVG(view_count)::INT as avg_views_per_content
FROM contents;
