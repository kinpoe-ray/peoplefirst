# Supabase 配置策略指南

## 问题背景

您有两个Git分支：
- `main` - 原有的Evolv Platform（已配置Supabase）
- `redesign/linear-style` - 新的PathFinder平台（需要配置Supabase）

## Supabase项目管理策略

Supabase本身**没有Git式的分支管理**，但有以下几种推荐的配置策略：

---

## 方案对比

### 方案1: 共享同一个Supabase项目（推荐用于测试）

#### 适用场景
- 开发/测试阶段
- 两个分支数据结构完全不同
- 想要节省成本

#### 优点
- ✅ 只需一个Supabase项目
- ✅ 节省费用（免费版只有2个项目额度）
- ✅ 数据库架构完全不同，不会冲突

#### 缺点
- ❌ 两个应用共享同一个数据库
- ❌ 无法独立管理数据
- ❌ 迁移可能麻烦

#### 实施步骤

1. **使用原有Supabase项目**
   - 继续使用main分支的Supabase URL和Key

2. **在同一数据库中执行PathFinder的迁移**
   ```sql
   -- 在Supabase Dashboard的SQL Editor执行
   -- supabase/migrations/001_pathfinder_schema.sql
   ```

3. **配置.env文件**
   ```bash
   # 复制main分支的Supabase配置
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **表名策略**
   - PathFinder的表名和main分支不冲突
   - PathFinder: users, contents, tasks, stories...
   - 原Evolv: (检查main分支的表名，确保不冲突)

---

### 方案2: 创建新的Supabase项目（推荐用于生产）

#### 适用场景
- PathFinder将独立运营
- 需要独立的数据和管理
- 准备正式上线

#### 优点
- ✅ 数据完全隔离
- ✅ 独立管理和备份
- ✅ 独立的API配额
- ✅ 更安全和专业

#### 缺点
- ❌ 需要新的Supabase项目（消耗免费额度）
- ❌ 多项目管理稍复杂

#### 实施步骤

1. **创建新的Supabase项目**
   - 访问 https://supabase.com/dashboard
   - 点击 "New Project"
   - 项目名: `pathfinder-platform`
   - Database Password: 设置一个强密码
   - Region: 选择离用户最近的区域（如Singapore）

2. **获取新项目的配置**
   - 进入项目Settings > API
   - 复制 `Project URL` 和 `anon public key`

3. **配置.env文件**
   ```bash
   cp .env.example .env
   # 编辑.env，填入新项目的配置
   VITE_SUPABASE_URL=https://your-new-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-new-anon-key
   ```

4. **执行数据库迁移**
   - 在新项目的SQL Editor中执行：
     - `supabase/migrations/001_pathfinder_schema.sql`
     - `supabase/seed.sql` (可选，测试数据)

5. **配置认证**
   - 进入 Authentication > Providers
   - 启用 Email provider
   - (可选) 配置 OAuth providers (Google/GitHub)

---

### 方案3: Supabase Branching（新功能，推荐了解）

#### 介绍
Supabase在2023年推出了 **Branching** 功能（类似Git分支），但目前：
- 仅限 **Pro Plan** 及以上（$25/月）
- 支持创建预览分支，用于测试
- 可以独立开发，最后合并到主分支

#### 如何使用
```bash
# 安装Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 创建分支
supabase branches create redesign-pathfinder

# 推送迁移
supabase db push
```

#### 适用场景
- 企业级项目
- 需要严格的分支管理
- 有预算购买Pro Plan

---

## 推荐方案

### 如果您是个人开发者/初创团队
**推荐：方案2 - 创建新的Supabase项目**

理由：
1. PathFinder和原Evolv Platform是**完全不同的产品**
2. 数据结构不同（PathFinder有contents/tasks/stories，Evolv可能完全不同）
3. 后续独立运营和迭代更方便
4. Supabase免费版提供2个项目，足够使用

### 如果只是测试/实验
**推荐：方案1 - 共享同一个Supabase项目**

理由：
1. 节省资源
2. 快速测试
3. 表名不冲突即可

---

## 实际操作：创建新Supabase项目（推荐方案）

### Step 1: 创建项目
1. 访问 https://supabase.com/dashboard
2. 点击右上角 "+ New project"
3. 填写信息：
   ```
   Name: pathfinder-platform
   Database Password: (生成一个强密码，保存好！)
   Region: Southeast Asia (Singapore) - 如果用户在亚洲
   Pricing Plan: Free
   ```
4. 点击 "Create new project"，等待1-2分钟

### Step 2: 获取API配置
1. 进入新项目
2. 点击左侧 Settings > API
3. 复制以下信息：
   - **Project URL**: `https://xxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: 配置本地环境
```bash
# 在 redesign/linear-style 分支
cd /Users/ray/GitHub/peoplefirst/evolv-platform

# 创建.env文件
cp .env.example .env

# 编辑.env，填入新项目配置
nano .env
```

填入内容：
```env
# PathFinder Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# MiniMax AI API（如果需要AI功能）
VITE_MINIMAX_API_KEY=your_minimax_api_key_here

# 应用配置
VITE_APP_TITLE=PathFinder
VITE_APP_DESCRIPTION=职业探索平台
```

### Step 4: 执行数据库迁移
1. 在Supabase Dashboard，点击左侧 "SQL Editor"
2. 点击 "+ New query"
3. 复制 `supabase/migrations/001_pathfinder_schema.sql` 的全部内容
4. 粘贴到编辑器，点击 "Run"
5. 看到 "Success. No rows returned" 即成功

### Step 5: 插入测试数据（可选）
1. 同样在SQL Editor
2. 复制 `supabase/seed.sql` 的内容
3. 粘贴并运行
4. 会插入示例用户、内容、任务、故事

### Step 6: 配置认证
1. 点击左侧 "Authentication" > "Providers"
2. 启用 "Email"
3. 配置邮件模板（可选）：
   - Confirm signup
   - Reset password
   - Magic Link

4. (可选) 启用OAuth:
   - Google OAuth
   - GitHub OAuth
   - 需要在对应平台创建OAuth应用

### Step 7: 验证配置
```bash
# 启动开发服务器
pnpm run dev

# 打开浏览器控制台，检查是否有Supabase连接错误
# 应该能看到正常的页面，无数据库连接错误
```

### Step 8: 测试数据库连接
在浏览器控制台执行：
```javascript
// 检查Supabase客户端
console.log(window.location.origin)

// 测试查询（如果seed.sql已执行）
// 打开 /contents 页面，应该能看到2个示例内容
```

---

## 环境变量管理最佳实践

### .gitignore 配置
确保 `.env` 文件已被忽略：
```bash
# 检查.gitignore
cat .gitignore | grep .env

# 应该包含
.env
.env.local
.env.*.local
```

### 多环境配置
如果需要开发/生产环境分离：

**开发环境** (`.env.development`):
```env
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
```

**生产环境** (`.env.production`):
```env
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
```

### 团队协作
1. 每个开发者使用自己的 `.env` 文件
2. `.env.example` 作为模板提交到Git
3. 生产环境配置通过CI/CD环境变量注入

---

## 常见问题

### Q1: main分支和redesign分支能用同一个Supabase吗？
**A**: 可以，但不推荐。因为：
- PathFinder和原Evolv是完全不同的产品
- 表结构不同，管理会混乱
- 后续独立运营困难

**建议**: 为PathFinder创建新项目

### Q2: Supabase免费版有什么限制？
**A**: 免费版限制：
- 2个项目
- 500MB数据库存储
- 1GB文件存储
- 50,000 MAU (月活用户)
- 50,000 认证用户

对于MVP阶段完全够用！

### Q3: 如何迁移数据？
**A**: 如果后续需要从旧项目迁移数据：
```bash
# 导出旧项目数据
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql

# 导入新项目
psql -h db.yyy.supabase.co -U postgres -d postgres < backup.sql
```

### Q4: 本地开发需要网络吗？
**A**: 是的，Supabase是云服务。如果需要离线开发：
```bash
# 安装Supabase CLI
npm install -g supabase

# 启动本地Supabase
supabase init
supabase start
```

### Q5: 如何保护API Key？
**A**:
1. **anon key** 可以暴露在前端（有RLS保护）
2. **service_role key** 绝对不能暴露！只在后端使用
3. 使用环境变量，不要硬编码
4. 配置RLS策略保护数据

---

## 数据库管理建议

### 版本控制
将所有SQL迁移文件提交到Git：
```
supabase/
├── migrations/
│   ├── 001_pathfinder_schema.sql
│   ├── 002_add_notifications.sql  # 未来的迁移
│   └── 003_add_analytics.sql
└── seed.sql
```

### 备份策略
Supabase自动备份，但建议：
1. 定期手动导出重要数据
2. 使用Supabase Dashboard > Database > Backups
3. 重要数据存储到云存储（S3/OSS）

### 监控
1. 使用Supabase Dashboard查看：
   - Database size
   - API requests
   - Active users
2. 设置告警（Pro Plan功能）

---

## 总结

**推荐配置方案**:

✅ **为PathFinder创建新的Supabase项目**

**理由**:
1. 产品独立，数据隔离
2. 管理简单，不混乱
3. 免费版有2个项目额度
4. 后续独立运营方便

**快速开始**:
1. 创建新项目 (2分钟)
2. 获取API配置 (1分钟)
3. 配置.env文件 (1分钟)
4. 执行SQL迁移 (5分钟)
5. 启动开发 `pnpm run dev`

**总耗时**: 约10分钟即可完成配置！

如有任何问题，参考 `docs/DATABASE_SETUP.md` 获取更详细的步骤说明。
