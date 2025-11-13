# 登录问题修复指南

## 问题现象

注册后无法登录，显示错误：**"Invalid login credentials"**

## 原因分析

Supabase 默认配置要求用户在注册后必须先验证邮箱才能登录。如果没有完成邮箱验证，即使密码正确也会显示 "Invalid login credentials" 错误。

## 解决方案

### 方案 1: 在 Supabase Dashboard 关闭邮箱验证（推荐用于开发环境）

1. 登录 Supabase Dashboard: https://app.supabase.com
2. 选择 PathFinder 项目
3. 点击左侧菜单 "Authentication"
4. 点击 "Email" 标签页
5. 找到 "Enable email confirmations" 设置
6. **关闭** 这个选项
7. 点击 "Save" 保存

### 方案 2: 通过 SQL 手动验证已注册用户

在 Supabase Dashboard 的 SQL Editor 中执行 `004_disable_email_confirmation.sql`：

**步骤**:
1. 打开 Supabase Dashboard → SQL Editor
2. 复制粘贴 `supabase/004_disable_email_confirmation.sql` 的内容
3. 点击 "Run" 执行

**这个 SQL 会**:
- 查看所有用户的验证状态
- 将所有未验证用户的 `email_confirmed_at` 设置为当前时间
- 验证更新结果

### 方案 3: 重新注册

如果上述方案都不生效：

1. 先执行方案 1（关闭邮箱验证）
2. 使用不同的邮箱地址重新注册
3. 注册后应该可以直接登录

## 验证修复是否成功

### 步骤 1: 检查邮箱验证设置

在 SQL Editor 中运行：

```sql
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**预期结果**:
- `email_confirmed_at` 列应该有时间戳（不是 NULL）
- 或者在 Dashboard 中已关闭 "Enable email confirmations"

### 步骤 2: 测试登录

1. 访问 http://localhost:5173/signin
2. 输入注册时使用的邮箱和密码
3. 点击登录
4. 应该成功跳转到首页，Header 显示用户名

## 详细排查步骤

### 1. 检查用户是否存在

在 Supabase Dashboard → SQL Editor 中运行：

```sql
SELECT * FROM auth.users WHERE email = 'kinpoe.ray@gmail.com';
```

**如果没有结果**: 用户注册失败，需要重新注册

**如果有结果**: 检查 `email_confirmed_at` 字段
- 如果是 NULL：需要验证邮箱或关闭邮箱验证
- 如果有时间戳：密码可能不正确

### 2. 检查 users 表是否有对应记录

```sql
SELECT * FROM users WHERE email = 'kinpoe.ray@gmail.com';
```

**如果没有结果**: Profile 创建失败，手动创建：

```sql
INSERT INTO users (id, email, username)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'username', 'User' || substr(id::text, 1, 4))
FROM auth.users
WHERE email = 'kinpoe.ray@gmail.com'
  AND id NOT IN (SELECT id FROM users);
```

### 3. 检查 RLS 策略

确认 `users` 表的 RLS 策略允许注册：

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

应该包含类似这些策略：
- "Allow public user registration" (INSERT)
- "Users can read own profile" (SELECT)

### 4. 查看浏览器控制台

1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 尝试登录
4. 查看是否有更详细的错误信息

## 常见错误及解决方案

### 错误 1: "Email not confirmed"

**原因**: 邮箱未验证

**解决方案**: 执行方案 1 或方案 2

### 错误 2: "Invalid login credentials"

**可能原因**:
1. 邮箱未验证（最常见）
2. 密码错误
3. 用户不存在

**解决方案**:
1. 确认邮箱拼写正确
2. 确认密码正确（区分大小写）
3. 执行方案 1 关闭邮箱验证
4. 如果忘记密码，使用"忘记密码"功能重置

### 错误 3: "User not found"

**原因**: 用户在 `auth.users` 中存在，但 `users` 表中没有对应记录

**解决方案**: 运行上面的手动创建 profile SQL

## Supabase 邮箱验证工作流程

### 启用邮箱验证时的流程

```
用户注册
  ↓
创建 auth.users 记录 (email_confirmed_at = NULL)
  ↓
发送验证邮件
  ↓
用户点击邮件中的链接
  ↓
email_confirmed_at 更新为当前时间
  ↓
用户可以登录
```

### 关闭邮箱验证后的流程

```
用户注册
  ↓
创建 auth.users 记录 (email_confirmed_at = NOW())
  ↓
用户可以直接登录（无需验证邮箱）
```

## 开发环境推荐配置

**Supabase Dashboard 设置**:

1. **Authentication → Providers → Email**
   - ✅ Enable Email provider
   - ❌ Disable "Enable email confirmations" (关闭邮箱验证)
   - ✅ Enable "Secure email change" (可选)

2. **Authentication → URL Configuration**
   - Site URL: `http://localhost:5173`
   - Redirect URLs:
     - `http://localhost:5173/**`
     - `http://localhost:5173/reset-password`

3. **Authentication → Email Templates**
   - 根据需要自定义邮件模板（如果启用邮箱验证）

## 生产环境安全建议

在生产环境中，强烈建议：

1. ✅ **启用邮箱验证**
   - 防止恶意注册
   - 确保邮箱有效性

2. ✅ **配置邮件服务**
   - 使用自定义 SMTP（SendGrid, AWS SES 等）
   - 自定义邮件模板
   - 添加品牌标识

3. ✅ **启用其他安全功能**
   - Rate limiting（防止暴力破解）
   - CAPTCHA（防止机器人注册）
   - 密码强度要求

## 测试清单

修复后，请测试以下场景：

- [ ] 新用户可以成功注册
- [ ] 注册后可以直接登录（无需验证邮箱）
- [ ] 登录后 Header 显示用户名
- [ ] 退出登录功能正常
- [ ] 忘记密码功能正常
- [ ] 重置密码后可以用新密码登录
- [ ] 刷新页面后登录状态保持

## 完成后的验证

执行修复后，运行以下查询确认：

```sql
-- 1. 确认所有用户都已验证
SELECT
  COUNT(*) as total_users,
  COUNT(email_confirmed_at) as confirmed_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unconfirmed_users
FROM auth.users;

-- 2. 查看最近注册的用户
SELECT
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

## 相关文件

- `src/stores/authStore.ts` - 认证状态管理
- `src/pages/Login.tsx` - 登录页面
- `src/pages/SignUp.tsx` - 注册页面
- `supabase/004_disable_email_confirmation.sql` - 邮箱验证修复 SQL
- `docs/AUTH_IMPLEMENTATION.md` - 认证系统文档
