# PathFinder 数据库设置指南

## 概述

本指南将帮助你在Supabase上设置PathFinder平台的数据库。PathFinder使用PostgreSQL数据库（通过Supabase托管），包含7个核心表来支持职业探索功能。

## 数据库架构

### 核心表结构

1. **users** - 用户信息表
   - 存储用户基本信息、职业状态和兴趣偏好
   - 包含职业困惑度评分（1-10）

2. **contents** - 职业去魅化内容表
   - 存储职业真实体验内容
   - 包含每日时间线、高光/崩溃时刻、技能雷达图

3. **tasks** - 技能试验任务表
   - 存储各类职业体验任务
   - 包含难度级别、步骤说明和技能维度

4. **user_task_attempts** - 用户任务尝试记录表
   - 追踪用户的任务完成情况
   - 存储AI反馈和技能评分

5. **stories** - 迷茫者故事表
   - 用户分享的职业探索故事
   - 包含尝试、失败和发现三个部分

6. **favorites** - 收藏表
   - 支持收藏内容、任务和故事

7. **comments** - 评论表
   - 支持对内容、任务和故事进行评论
   - 支持评论回复（parent_id）

## 设置步骤

### 1. 创建Supabase项目

1. 访问 [supabase.com](https://supabase.com) 并登录/注册
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - Name: `pathfinder` （或你喜欢的名称）
   - Database Password: 设置一个强密码（请妥善保存）
   - Region: 选择离你最近的区域（建议中国用户选择新加坡）
   - Pricing Plan: 可选择Free tier进行开发

### 2. 执行数据库迁移

在Supabase Dashboard中执行SQL脚本：

1. 进入 Supabase Dashboard
2. 点击左侧菜单 "SQL Editor"
3. 点击 "New Query" 创建新查询
4. 复制并执行 `supabase/migrations/001_pathfinder_schema.sql` 的内容
5. 点击 "Run" 执行脚本

**重要提示**：
- 脚本会创建所有必需的表、索引和RLS策略
- 执行成功后，你应该看到 "Success. No rows returned"
- 如果遇到错误，请检查是否有语法问题或权限问题

### 3. 插入示例数据（可选）

如果你想测试系统功能，可以插入示例数据：

1. 在SQL Editor中创建新查询
2. 复制并执行 `supabase/seed.sql` 的内容
3. 点击 "Run" 执行

示例数据包括：
- 1个测试用户
- 2个职业去魅化内容（产品经理、UI设计师）
- 2个技能试验任务
- 1个用户故事

### 4. 配置环境变量

1. 在Supabase Dashboard中，点击左侧 "Settings" > "API"
2. 复制以下信息：
   - **Project URL**: 形如 `https://xxxxx.supabase.co`
   - **anon public** key: 一个长字符串，以 `eyJ` 开头

3. 在项目根目录创建 `.env` 文件（如果不存在）：
   ```bash
   cp .env.example .env
   ```

4. 编辑 `.env` 文件，填入你的配置：
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
   ```

### 5. 启用认证

PathFinder支持多种认证方式：

#### Email认证（默认）
1. 进入 Dashboard > Authentication > Providers
2. 确保 "Email" provider 已启用
3. 配置邮件模板（可选）

#### OAuth认证（可选）
支持第三方登录：

**Google OAuth**:
1. 在 [Google Cloud Console](https://console.cloud.google.com/) 创建OAuth客户端
2. 在Supabase Dashboard > Authentication > Providers > Google 中启用
3. 填入 Client ID 和 Client Secret

**GitHub OAuth**:
1. 在 [GitHub Settings](https://github.com/settings/developers) 创建OAuth App
2. 在Supabase Dashboard > Authentication > Providers > GitHub 中启用
3. 填入 Client ID 和 Client Secret

### 6. 配置行级安全性（RLS）

数据库迁移脚本已自动配置RLS策略，包括：

- **公开访问**: contents、tasks、public stories可被所有人查看
- **用户隔离**: 用户只能访问和修改自己的数据
- **保护隐私**: 非公开的stories只对创建者可见

你可以在 Dashboard > Authentication > Policies 中查看和修改策略。

### 7. 测试连接

启动项目并测试数据库连接：

```bash
npm run dev
```

在浏览器控制台检查：
1. 打开开发者工具（F12）
2. 查看 Console 标签
3. 应该没有Supabase连接错误
4. 可以尝试注册/登录功能

## 数据库管理

### 查看表数据

1. 在Supabase Dashboard中，点击 "Table Editor"
2. 选择要查看的表
3. 可以直接在界面中查看、编辑、删除数据

### 备份数据库

Supabase Free tier提供自动备份功能：
- Dashboard > Database > Backups
- 可以手动创建备份或恢复到之前的时间点

### 监控性能

1. Dashboard > Database > Query Performance
2. 查看慢查询
3. 根据需要添加索引

## 常见问题

### Q: 迁移脚本执行失败怎么办？

A: 检查以下几点：
1. 确保你有数据库的完整权限
2. 检查是否有语法错误
3. 如果是重复执行，某些 `CREATE TABLE IF NOT EXISTS` 语句可能会被跳过
4. 查看错误信息，通常会指出具体问题

### Q: RLS策略阻止了我的操作

A: 检查：
1. 用户是否已正确登录（auth.uid() 应该有值）
2. 操作是否符合策略规则
3. 可以临时禁用RLS进行测试（不推荐在生产环境）

### Q: 如何重置数据库？

A: 有两种方式：
1. **保留结构，清空数据**: 在SQL Editor中执行 `TRUNCATE` 命令
2. **完全重置**: 删除所有表，重新执行迁移脚本

### Q: 如何迁移到生产环境？

A: 建议步骤：
1. 创建新的Supabase项目（生产环境）
2. 执行相同的迁移脚本
3. 不要执行seed.sql（除非需要）
4. 更新生产环境的 `.env` 配置
5. 测试所有功能

## 性能优化建议

1. **索引优化**: 迁移脚本已包含常用索引，如需添加新索引：
   ```sql
   CREATE INDEX idx_name ON table_name(column_name);
   ```

2. **查询优化**:
   - 使用 `EXPLAIN ANALYZE` 分析慢查询
   - 避免 `SELECT *`，只查询需要的字段
   - 合理使用分页（LIMIT/OFFSET）

3. **连接池**:
   - Supabase已自动配置连接池
   - 注意避免频繁建立新连接

## 更新数据库架构

如果需要修改数据库结构：

1. 创建新的迁移文件：`002_your_migration_name.sql`
2. 使用 `ALTER TABLE` 语句而不是 `CREATE TABLE`
3. 在Supabase SQL Editor中执行
4. 更新相应的TypeScript类型定义

示例：
```sql
-- 002_add_user_preferences.sql
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
```

## 相关资源

- [Supabase官方文档](https://supabase.com/docs)
- [PostgreSQL文档](https://www.postgresql.org/docs/)
- [Row Level Security指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth指南](https://supabase.com/docs/guides/auth)

## 获取帮助

如果遇到问题：
1. 查看Supabase Dashboard的日志
2. 检查浏览器控制台错误
3. 参考本项目的其他文档
4. 访问Supabase社区获取帮助
