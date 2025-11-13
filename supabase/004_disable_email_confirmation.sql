-- ============================================
-- PathFinder Platform - 禁用邮箱验证（开发环境）
-- ============================================
-- 此文件用于关闭 Supabase 的邮箱验证要求
-- 注意：仅用于开发环境，生产环境应启用邮箱验证

-- 方案1: 通过 SQL 更新已注册用户的邮箱验证状态
-- 查看当前所有用户的验证状态
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 为所有未验证的用户设置邮箱已验证
-- 注意：这会更新所有用户，请确认这是你想要的
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 验证更新结果
SELECT
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;
