# 收藏功能错误修复文档

## 问题描述

用户点击内容详情页的收藏按钮时，收到错误提示："操作失败，请重试"

**错误截图**: 用户在访问 `/contents/3024f223-aaf6-43d1-8d48-23e280d7f1f2` 页面时点击收藏按钮

## 错误原因

`favorites` 表启用了 Row Level Security (RLS)，但没有配置相应的访问策略，导致用户无法执行 INSERT、SELECT、DELETE 操作。

### 技术细节

当用户点击收藏按钮时，前端调用 `toggleFavorite()` 函数：

```typescript
// src/api/favorites.ts:146-159
export async function toggleFavorite(contentId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '11111111-1111-1111-1111-111111111111';

  const isFavorited = await checkIfFavorited(contentId, userId);

  if (isFavorited) {
    await removeFromFavorites(contentId);
    return false;
  } else {
    await addToFavorites(contentId);
    return true;
  }
}
```

此函数依次调用：
1. `checkIfFavorited()` - SELECT 操作
2. `addToFavorites()` 或 `removeFromFavorites()` - INSERT/DELETE 操作

由于没有配置 RLS 策略，这些数据库操作被 Supabase 拒绝，抛出错误。

## 修复方案

### 步骤 1: 执行 RLS 策略 SQL

在 Supabase Dashboard 执行以下步骤：

1. 登录 Supabase Dashboard: https://app.supabase.com
2. 选择项目: PathFinder (oqxlevxjbcjcfgiuicux)
3. 点击左侧菜单 "SQL Editor"
4. 点击 "New Query"
5. 复制粘贴 `supabase/002_favorites_rls_policies.sql` 的全部内容
6. 点击 "Run" 执行 SQL

### 步骤 2: 验证策略创建成功

在 SQL Editor 中运行以下查询：

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'favorites';
```

**预期结果**: 应该看到 9 个策略：
- `Users can view own favorites` (SELECT)
- `Test user can view favorites` (SELECT)
- `Users can add favorites` (INSERT)
- `Test user can add favorites` (INSERT)
- `Users can delete own favorites` (DELETE)
- `Test user can delete favorites` (DELETE)
- `Users can update own favorites` (UPDATE)
- `Test user can update favorites` (UPDATE)

### 步骤 3: 测试收藏功能

1. 刷新浏览器页面
2. 访问任意内容详情页（例如：`/contents/3024f223-aaf6-43d1-8d48-23e280d7f1f2`）
3. 点击收藏按钮（心形图标）
4. 验证：
   - 心形图标变为实心（已收藏）
   - 收藏计数 +1
   - 没有错误提示
5. 再次点击收藏按钮
6. 验证：
   - 心形图标变为空心（取消收藏）
   - 收藏计数 -1
   - 没有错误提示

## RLS 策略详解

### 为什么需要两套策略？

代码中使用了测试用户 fallback 模式：

```typescript
const userId = user?.id || '11111111-1111-1111-1111-111111111111';
```

这意味着：
- **已登录用户**: 使用真实的 `auth.uid()`，需要 `authenticated` 角色的策略
- **未登录用户（开发环境）**: 使用测试 UUID，需要 `anon` 角色的策略

### 策略类型说明

1. **SELECT 策略**: 允许用户查看收藏列表
   - 认证用户只能看到自己的收藏
   - 测试用户只能看到测试 UUID 的收藏

2. **INSERT 策略**: 允许用户添加收藏
   - 认证用户只能为自己添加收藏
   - 测试用户只能为测试 UUID 添加收藏

3. **DELETE 策略**: 允许用户删除收藏
   - 认证用户只能删除自己的收藏
   - 测试用户只能删除测试 UUID 的收藏

4. **UPDATE 策略**: 允许用户更新收藏（预留）
   - 当前代码未使用，但为未来功能预留

## 安全性考虑

### ✅ 已实现的安全措施

1. **用户隔离**: 每个用户只能访问自己的收藏
2. **身份验证**: 认证用户必须通过 `auth.uid()` 验证
3. **测试环境隔离**: 测试用户只能使用特定 UUID
4. **原子性操作**: 收藏计数更新在同一事务中完成

### ⚠️ 开发环境注意事项

测试用户策略（`anon` 角色）仅用于开发环境，生产环境应该：
1. 移除所有 `anon` 角色的策略
2. 强制要求用户登录才能使用收藏功能
3. 在前端添加登录检查

**生产环境移除测试策略**:

```sql
-- 生产环境执行以下 SQL
DROP POLICY IF EXISTS "Test user can view favorites" ON favorites;
DROP POLICY IF EXISTS "Test user can add favorites" ON favorites;
DROP POLICY IF EXISTS "Test user can delete favorites" ON favorites;
DROP POLICY IF EXISTS "Test user can update favorites" ON favorites;
```

## 相关文件

### 前端文件
- `src/api/favorites.ts` - 收藏 API 函数
- `src/pages/ContentDetail.tsx` - 内容详情页（包含收藏按钮）
- `src/pages/Profile.tsx` - 个人主页（收藏列表）

### 数据库文件
- `supabase/001_pathfinder_schema.sql` - 数据库表结构
- `supabase/002_favorites_rls_policies.sql` - RLS 策略（本次新增）
- `supabase/seed.sql` - 测试数据

## 故障排查

### 问题: 执行 SQL 后仍然报错

**可能原因 1**: 浏览器缓存
- **解决方案**: 硬刷新页面 (Ctrl+Shift+R 或 Cmd+Shift+R)

**可能原因 2**: Supabase 客户端缓存
- **解决方案**: 重启开发服务器
```bash
# 在终端按 Ctrl+C 停止服务
pnpm run dev  # 重新启动
```

**可能原因 3**: RLS 策略未生效
- **解决方案**: 在 Supabase Dashboard 检查策略状态
```sql
SELECT * FROM pg_policies WHERE tablename = 'favorites';
```

### 问题: 已登录用户可以收藏，但测试用户不行

**原因**: 测试用户策略未创建或被删除

**解决方案**: 重新执行 `002_favorites_rls_policies.sql` 中的测试用户策略部分

### 问题: 收藏按钮可以点击，但计数不更新

**原因**: `contents` 表的 RLS 策略不允许更新 `favorite_count` 字段

**解决方案**: 为 `contents` 表添加 UPDATE 策略
```sql
CREATE POLICY "Anyone can update content stats"
ON contents FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
```

## 后续优化建议

1. **登录强制**: 生产环境移除测试用户策略，强制登录
2. **收藏计数**: 使用 PostgreSQL 函数 + 触发器自动更新计数
3. **收藏限制**: 添加每个用户的收藏数量限制
4. **收藏通知**: 当内容被收藏时通知内容作者
5. **收藏分类**: 支持用户创建收藏夹分类

## 测试清单

- [ ] 未登录用户可以收藏内容（开发环境）
- [ ] 已登录用户可以收藏内容
- [ ] 收藏计数正确增加
- [ ] 取消收藏后计数正确减少
- [ ] 心形图标状态正确切换
- [ ] 个人主页可以查看收藏列表
- [ ] 只能看到自己的收藏
- [ ] 收藏持久化到数据库
- [ ] 刷新页面后收藏状态保持

## 完成状态

✅ RLS 策略 SQL 文件已创建
⏳ 等待用户在 Supabase Dashboard 执行 SQL
⏳ 等待用户测试收藏功能
