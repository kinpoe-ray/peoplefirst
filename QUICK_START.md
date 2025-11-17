# PathFinder 快速启动指南

## ✅ 问题已修复！

**问题**: seed.sql中的单引号转义错误
**位置**: 第28行 `'高级'`
**修复**: 已将 `'高级'` 改为 `''高级''` (SQL中单引号需要双写)

---

## 🚀 现在可以执行SQL了！

### Step 1: 执行数据库Schema（必须）

1. **访问Supabase SQL Editor**
   ```
   https://supabase.com/dashboard/project/oqxlevxjbcjcfgiuicux/sql
   ```

2. **创建新查询**
   - 点击 "+ New query"

3. **执行Schema迁移**
   - 打开文件: `supabase/migrations/001_pathfinder_schema.sql`
   - 复制全部内容（172行）
   - 粘贴到SQL Editor
   - 点击 "Run" 按钮
   - 等待显示: "Success. No rows returned"

4. **验证表创建**
   - 点击左侧 "Table Editor"
   - 应该看到7个新表

---

### Step 2: 插入测试数据（推荐）

1. **在SQL Editor创建新查询**

2. **执行Seed数据（已修复）**
   - 打开文件: `supabase/seed.sql`
   - 复制全部内容（70行）
   - 粘贴到SQL Editor
   - 点击 "Run" 按钮
   - 等待显示: "Success. Rows affected: X"

3. **测试数据包含**:
   - ✅ 1个测试用户 (demo@pathfinder.com)
   - ✅ 2个职业内容（产品经理、UI设计师）
   - ✅ 2个技能任务
   - ✅ 1个用户故事

---

## 🎯 验证配置成功

### 方法1: 访问页面

开发服务器已在运行: http://localhost:5173

访问以下页面，应该能看到数据：

1. **内容列表**: http://localhost:5173/contents
   - 应该显示2个职业内容卡片
   - 产品经理的真实一天
   - UI设计师的日常工作

2. **任务列表**: http://localhost:5173/tasks
   - 应该显示2个任务
   - 体验产品经理：设计一个To-Do应用
   - 体验UI设计师：设计登录页面

3. **故事墙**: http://localhost:5173/stories
   - 应该显示1个故事
   - 从运营转产品的120天

### 方法2: 在Supabase Dashboard验证

1. **查看数据**:
   - 访问 Table Editor
   - 点击 `contents` 表，应该看到2行数据
   - 点击 `tasks` 表，应该看到2行数据
   - 点击 `stories` 表，应该看到1行数据

---

## 📊 SQL转义规则说明

**为什么出错**:
```sql
-- ❌ 错误: 单引号内的单引号会提前结束字符串
'说不够'高级''

-- ✅ 正确: SQL中单引号需要双写来转义
'说不够''高级'''
```

**规则**:
- SQL字符串用单引号 `'...'` 包裹
- 字符串内的单引号需要双写 `''` 来表示一个单引号
- JSONB字符串也遵循这个规则

**例子**:
```sql
-- 原文本: 不够'高级'
-- SQL写法: '不够''高级'''
--          ^外层  ^转义  ^转义^外层
```

---

## 🔧 其他可能的问题

### 问题1: "relation does not exist"
**原因**: Schema未执行
**解决**: 先执行 `001_pathfinder_schema.sql`

### 问题2: "duplicate key value"
**原因**: 数据已存在，重复插入
**解决**:
```sql
-- 清空数据重新插入
TRUNCATE users, contents, tasks, stories, favorites, comments RESTART IDENTITY CASCADE;
-- 然后重新执行seed.sql
```

### 问题3: "foreign key violation"
**原因**: 外键约束问题
**解决**: 按顺序插入（seed.sql已按正确顺序）

---

## ✨ 配置完成后

数据库配置完成后，您可以：

1. **浏览内容**
   - 查看2个职业去魅化内容
   - 看时间轴、雷达图等展示

2. **尝试任务**
   - 体验产品经理或设计师任务
   - 5步渐进式引导

3. **阅读故事**
   - 看一个真实的转行故事
   - 三段式叙事展示

4. **开始开发**
   - 添加更多数据
   - 修改页面
   - 实现新功能

---

## 📝 配置检查清单

- [ ] 访问 https://supabase.com/dashboard/project/oqxlevxjbcjcfgiuicux
- [ ] 执行 `001_pathfinder_schema.sql`（172行）
- [ ] Table Editor显示7个表
- [ ] 执行 `seed.sql`（70行）
- [ ] Table Editor显示数据
- [ ] http://localhost:5173/contents 显示2个内容
- [ ] http://localhost:5173/tasks 显示2个任务
- [ ] http://localhost:5173/stories 显示1个故事
- [ ] 浏览器控制台无错误

---

## 🎉 完成！

配置完成后，PathFinder平台就可以正常使用了！

**当前配置**:
- ✅ .env文件已配置
- ✅ 开发服务器运行中
- ✅ seed.sql已修复
- 🔴 待执行: SQL迁移和seed数据

**下一步**: 在Supabase Dashboard执行SQL（2步骤，5分钟）

---

**需要帮助?** 查看完整文档:
- `SUPABASE_SETUP_CHECKLIST.md` - 详细步骤
- `docs/DATABASE_SETUP.md` - 完整指南
