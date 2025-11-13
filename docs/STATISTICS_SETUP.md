# 统计数据显示修复指南

## 问题描述

内容详情页面的浏览次数、收藏次数和评论次数都显示为 0 或不显示。

## 原因分析

1. **数据库函数缺失**: `increment_content_views` 函数不存在
2. **自动计数未配置**: 收藏和评论的计数没有自动更新机制
3. **现有数据计数为 0**: 种子数据插入时这些字段为默认值 0

## 解决方案

### 第1步：创建数据库函数和触发器

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/006_create_functions.sql`

**这个 SQL 会创建**:

1. ✅ `increment_content_views(content_id)` - 浏览计数函数
2. ✅ `update_content_favorite_count()` - 收藏计数触发器函数
3. ✅ `update_content_comment_count()` - 评论计数触发器函数
4. ✅ 收藏表触发器 - 自动更新收藏计数
5. ✅ 评论表触发器 - 自动更新评论计数

**工作原理**:
- 当用户浏览内容时，调用 `increment_content_views()` 增加计数
- 当用户添加/删除收藏时，触发器自动更新 `contents.favorite_count`
- 当用户添加/删除评论时，触发器自动更新 `contents.comment_count`

### 第2步：更新现有数据的计数

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/005_update_content_counts.sql`

**这个 SQL 会**:

1. 检查当前统计数据
2. 将 NULL 值更新为 0
3. 根据 favorites 表实际数据更新收藏计数
4. 根据 comments 表实际数据更新评论计数
5. 显示更新后的统计结果

### 第3步：验证修复

1. **刷新浏览器页面**
2. **访问内容详情页**
3. **检查统计显示**:
   - 浏览次数应该从 0 开始
   - 收藏次数应该显示实际收藏数
   - 评论次数应该显示实际评论数

4. **测试自动更新**:
   - 点击收藏按钮 → 收藏计数应该 +1
   - 再次点击取消收藏 → 收藏计数应该 -1
   - 发表评论 → 评论计数应该 +1
   - 刷新页面多次 → 浏览计数应该递增

## 技术实现

### 浏览计数

**前端代码** (`src/pages/ContentDetail.tsx:48`):
```typescript
useEffect(() => {
  if (id) {
    fetchContentById(id);
    incrementViewCount(id);  // 每次访问增加浏览计数
  }
}, [id]);
```

**API 函数** (`src/api/contents.ts:37-43`):
```typescript
export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_content_views', {
    content_id: id,
  });

  if (error) throw error;
}
```

**数据库函数**:
```sql
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
```

### 收藏计数

**触发器自动更新**:
- 插入收藏记录 → `favorite_count + 1`
- 删除收藏记录 → `favorite_count - 1`

**前端代码** (`src/pages/ContentDetail.tsx:80-95`):
```typescript
const handleToggleFavorite = async () => {
  if (!user) {
    alert('请先登录');
    return;
  }

  try {
    const newFavorited = await toggleFavorite(id);
    setIsFavorited(newFavorited);
    setFavoriteCount(prev => newFavorited ? prev + 1 : Math.max(0, prev - 1));
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    alert('操作失败，请重试');
  }
};
```

### 评论计数

**触发器自动更新**:
- 插入评论记录 → `comment_count + 1`
- 删除评论记录 → `comment_count - 1`

**前端代码** (`src/pages/ContentDetail.tsx:97-114`):
```typescript
const handleSubmitComment = async () => {
  if (!user) {
    alert('请先登录');
    return;
  }
  if (!commentText.trim() || !id) return;

  setIsSubmittingComment(true);
  try {
    await addComment(id, commentText);
    setCommentText('');
    await loadComments();  // 重新加载评论列表
  } catch (error) {
    console.error('Failed to submit comment:', error);
  } finally {
    setIsSubmittingComment(false);
  }
};
```

## 数据库 Schema

### contents 表统计字段

```sql
CREATE TABLE contents (
  -- ... 其他字段
  view_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  -- ...
);
```

### favorites 表结构

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('content', 'task', 'story')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);
```

### comments 表结构

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('content', 'task', 'story')),
  target_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  like_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 优化建议

### 1. 浏览计数去重

目前每次刷新页面都会增加浏览计数。建议添加去重逻辑：

```typescript
// 使用 localStorage 记录已浏览的内容
const viewedContents = JSON.parse(localStorage.getItem('viewedContents') || '{}');
const lastViewTime = viewedContents[id];
const now = Date.now();

// 24小时内不重复计数
if (!lastViewTime || now - lastViewTime > 24 * 60 * 60 * 1000) {
  incrementViewCount(id);
  viewedContents[id] = now;
  localStorage.setItem('viewedContents', JSON.stringify(viewedContents));
}
```

### 2. 性能优化

对于高流量内容，可以使用缓存或批量更新：

```sql
-- 创建索引加速计数查询
CREATE INDEX IF NOT EXISTS idx_favorites_target ON favorites(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
```

### 3. 实时同步

使用 Supabase Realtime 订阅数据变更：

```typescript
const subscription = supabase
  .channel('content-stats')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'contents',
    filter: `id=eq.${contentId}`
  }, (payload) => {
    // 更新本地状态
    setViewCount(payload.new.view_count);
    setFavoriteCount(payload.new.favorite_count);
    setCommentCount(payload.new.comment_count);
  })
  .subscribe();
```

## 故障排查

### 问题：浏览计数不增加

**检查1**: 函数是否存在
```sql
SELECT proname FROM pg_proc WHERE proname = 'increment_content_views';
```

**检查2**: 查看错误日志
```typescript
// 在浏览器控制台查看
console.log('Incrementing view count for:', id);
```

### 问题：收藏计数不更新

**检查1**: 触发器是否存在
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_favorite_count';
```

**检查2**: 手动测试触发器
```sql
-- 插入测试收藏
INSERT INTO favorites (user_id, target_type, target_id)
VALUES ('11111111-1111-1111-1111-111111111111', 'content', 'YOUR_CONTENT_ID');

-- 检查计数是否增加
SELECT favorite_count FROM contents WHERE id = 'YOUR_CONTENT_ID';
```

### 问题：评论计数不更新

**检查1**: 触发器是否存在
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_comment_count';
```

**检查2**: 检查 RLS 策略
```sql
SELECT * FROM pg_policies WHERE tablename = 'comments';
```

## 相关文件

- `src/pages/ContentDetail.tsx` - 内容详情页面
- `src/api/contents.ts` - 内容 API
- `src/api/favorites.ts` - 收藏 API
- `supabase/006_create_functions.sql` - 数据库函数和触发器
- `supabase/005_update_content_counts.sql` - 更新现有数据
- `supabase/migrations/001_pathfinder_schema.sql` - 数据库 schema

## 执行清单

完成以下步骤以修复统计显示：

- [ ] 在 Supabase Dashboard 执行 `006_create_functions.sql`
- [ ] 验证函数和触发器创建成功
- [ ] 在 Supabase Dashboard 执行 `005_update_content_counts.sql`
- [ ] 验证现有数据计数已更新
- [ ] 刷新浏览器页面测试浏览计数
- [ ] 点击收藏按钮测试收藏计数
- [ ] 发表评论测试评论计数
- [ ] 所有统计数据正常显示

完成后，所有的浏览、收藏、评论计数都应该能正常显示和更新！
