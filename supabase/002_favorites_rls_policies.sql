-- ============================================
-- PathFinder Platform - Favorites RLS Policies
-- ============================================
-- 此文件包含收藏功能所需的所有Row Level Security策略
-- 需要在Supabase Dashboard的SQL Editor中执行

-- 1. 启用 favorites 表的 RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 2. 删除已存在的策略（如果有）
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Test user can view favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
DROP POLICY IF EXISTS "Test user can add favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
DROP POLICY IF EXISTS "Test user can delete favorites" ON favorites;
DROP POLICY IF EXISTS "Users can update own favorites" ON favorites;
DROP POLICY IF EXISTS "Test user can update favorites" ON favorites;

-- 3. 允许所有人查看收藏（用于公开数据）
CREATE POLICY "Public can view favorites"
ON favorites FOR SELECT
TO public
USING (true);

-- 4. 允许用户查看自己的收藏
CREATE POLICY "Users can view own favorites"
ON favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. 允许测试用户查看收藏（开发环境）
CREATE POLICY "Test user can view favorites"
ON favorites FOR SELECT
TO anon
USING (user_id = '11111111-1111-1111-1111-111111111111');

-- 5. 允许用户添加收藏
CREATE POLICY "Users can add favorites"
ON favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. 允许测试用户添加收藏（开发环境）
CREATE POLICY "Test user can add favorites"
ON favorites FOR INSERT
TO anon
WITH CHECK (user_id = '11111111-1111-1111-1111-111111111111');

-- 7. 允许用户删除自己的收藏
CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 8. 允许测试用户删除收藏（开发环境）
CREATE POLICY "Test user can delete favorites"
ON favorites FOR DELETE
TO anon
USING (user_id = '11111111-1111-1111-1111-111111111111');

-- 9. 允许用户更新自己的收藏（如果需要）
CREATE POLICY "Users can update own favorites"
ON favorites FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 10. 允许测试用户更新收藏（开发环境）
CREATE POLICY "Test user can update favorites"
ON favorites FOR UPDATE
TO anon
USING (user_id = '11111111-1111-1111-1111-111111111111')
WITH CHECK (user_id = '11111111-1111-1111-1111-111111111111');

-- ============================================
-- 验证策略是否创建成功
-- ============================================
-- 运行以下查询检查策略：
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'favorites';
