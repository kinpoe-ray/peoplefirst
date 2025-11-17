-- ============================================
-- PathFinder Platform - Contents Table Update Policy
-- ============================================
-- 此文件为 contents 表添加更新权限，以支持收藏计数功能
-- 需要在Supabase Dashboard的SQL Editor中执行

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Anyone can update content stats" ON contents;
DROP POLICY IF EXISTS "Public can update content favorite count" ON contents;

-- 允许所有人更新 contents 表的统计数据（收藏计数、浏览计数等）
-- 注意：这个策略比较宽松，仅用于开发环境
-- 生产环境建议使用 PostgreSQL 函数 + 触发器来自动更新计数
CREATE POLICY "Public can update content stats"
ON contents FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ============================================
-- 验证策略是否创建成功
-- ============================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'contents';
