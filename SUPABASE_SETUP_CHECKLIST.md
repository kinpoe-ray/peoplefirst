# PathFinder Supabase 配置检查清单

## ✅ 已完成的步骤

- [x] 创建Supabase项目：`pathfinder-platform`
- [x] 获取Project URL: `https://oqxlevxjbcjcfgiuicux.supabase.co`
- [x] 获取anon public key
- [x] 保存数据库密码: `KeQjN54iDUpa5CZR`
- [x] 更新 `.env` 文件

---

## 📋 待完成步骤

### Step 1: 执行数据库迁移（必须）

#### 方式1: 通过Supabase Dashboard（推荐）

1. **访问SQL Editor**
   - 打开 https://supabase.com/dashboard/project/oqxlevxjbcjcfgiuicux
   - 点击左侧菜单 "SQL Editor"
   - 点击 "+ New query"

2. **执行Schema迁移**
   - 打开本地文件：`supabase/migrations/001_pathfinder_schema.sql`
   - 复制全部内容（172行）
   - 粘贴到SQL Editor
   - 点击右下角 "Run" 按钮
   - 等待执行完成，应该看到 "Success. No rows returned"

3. **验证表创建**
   - 点击左侧 "Table Editor"
   - 应该能看到7个新建的表：
     - users
     - contents
     - tasks
     - user_task_attempts
     - stories
     - favorites
     - comments

4. **插入测试数据（可选但推荐）**
   - 在SQL Editor创建新查询
   - 打开本地文件：`supabase/seed.sql`
   - 复制全部内容（69行）
   - 粘贴并执行
   - 会插入：
     - 1个测试用户 (demo@pathfinder.com)
     - 2个职业内容（产品经理、UI设计师）
     - 2个技能任务
     - 1个用户故事

#### 方式2: 使用Supabase CLI（高级）

```bash
# 安装CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref oqxlevxjbcjcfgiuicux

# 推送迁移
supabase db push

# 执行seed（可选）
psql -h db.oqxlevxjbcjcfgiuicux.supabase.co -U postgres -d postgres -f supabase/seed.sql
# 密码: KeQjN54iDUpa5CZR
```

---

### Step 2: 配置认证（推荐）

1. **启用Email认证**
   - 访问 https://supabase.com/dashboard/project/oqxlevxjbcjcfgiuicux/auth/providers
   - 找到 "Email" provider
   - 确保已启用（默认应该是启用的）

2. **配置邮件模板（可选）**
   - 点击左侧 "Authentication" > "Email Templates"
   - 可自定义以下模板：
     - Confirm signup（确认注册）
     - Invite user（邀请用户）
     - Magic Link（魔法链接登录）
     - Change Email Address（更改邮箱）
     - Reset Password（重置密码）

3. **配置网站URL**
   - 进入 Settings > Authentication
   - 设置 "Site URL": `http://localhost:5173` (开发环境)
   - 添加 "Redirect URLs":
     - `http://localhost:5173/**`
     - 部署后添加生产环境URL

4. **（可选）启用OAuth登录**
   - Google OAuth:
     - 需要在Google Cloud Console创建OAuth应用
     - 获取Client ID和Secret
     - 在Supabase填入配置
   - GitHub OAuth:
     - 在GitHub Settings > Developer settings创建OAuth App
     - 获取Client ID和Secret
     - 在Supabase填入配置

---

### Step 3: 配置RLS策略（已包含在迁移中）

迁移文件已包含完整的Row Level Security策略，无需额外配置。

已配置的策略：
- ✅ 公开读取：contents, tasks, public stories
- ✅ 用户数据保护：用户只能管理自己的数据
- ✅ 任务尝试：用户只能查看和修改自己的尝试
- ✅ 收藏/评论：用户只能管理自己的收藏和评论

验证RLS是否启用：
1. 点击左侧 "Authentication" > "Policies"
2. 应该能看到所有表的RLS策略

---

### Step 4: 启动开发服务器

```bash
# 确保在正确的分支
git branch
# 应该显示 * redesign/linear-style

# 启动开发服务器
pnpm run dev

# 打开浏览器
# http://localhost:5173
```

---

### Step 5: 测试数据库连接

#### 测试方法1: 访问页面

1. **首页**: http://localhost:5173
   - 应该能正常显示

2. **内容列表**: http://localhost:5173/contents
   - 如果执行了seed.sql，应该能看到2个职业内容
   - 如果没有，显示空状态

3. **任务列表**: http://localhost:5173/tasks
   - 如果执行了seed.sql，应该能看到2个任务
   - 如果没有，显示空状态

4. **故事墙**: http://localhost:5173/stories
   - 如果执行了seed.sql，应该能看到1个故事
   - 如果没有，显示空状态

#### 测试方法2: 浏览器控制台

打开浏览器控制台（F12），执行：

```javascript
// 测试Supabase连接
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)

// 查询contents表
const { data, error } = await supabase.from('contents').select('*')
console.log('Contents:', data, error)
```

应该能看到数据或空数组，无错误。

---

## 🐛 常见问题排查

### 问题1: "relation does not exist" 错误
**原因**: 数据库迁移未执行
**解决**: 重新执行 Step 1 的SQL迁移

### 问题2: "Invalid API key" 错误
**原因**: .env配置错误或未生效
**解决**:
```bash
# 确认.env文件内容
cat .env

# 重启开发服务器
# Ctrl+C 停止，然后重新运行
pnpm run dev
```

### 问题3: "User not found" 错误
**原因**: 未配置认证或用户未登录
**解决**:
- 确认Authentication已启用
- 实现登录功能或使用测试用户

### 问题4: "Permission denied" 错误
**原因**: RLS策略限制
**解决**:
- 检查RLS策略是否正确
- 确认用户已登录（需要auth.uid()）

### 问题5: 页面空白或加载失败
**原因**:
1. Supabase配置错误
2. 数据库迁移未执行
3. 网络问题

**解决**:
```bash
# 1. 检查浏览器控制台错误
# F12 > Console

# 2. 检查.env配置
cat .env

# 3. 测试Supabase连接
curl https://oqxlevxjbcjcfgiuicux.supabase.co/rest/v1/
```

---

## 📊 配置验证清单

完成以下检查，确认配置成功：

- [ ] Supabase Dashboard能正常访问
- [ ] SQL Editor能正常使用
- [ ] Table Editor显示7个表
- [ ] .env文件配置正确
- [ ] 开发服务器启动成功
- [ ] http://localhost:5173 能正常访问
- [ ] 浏览器控制台无Supabase错误
- [ ] （可选）能看到测试数据

---

## 🎯 下一步

配置完成后，您可以：

1. **开始开发**
   - 修改页面组件
   - 添加新功能
   - 测试用户流程

2. **添加真实数据**
   - 在Supabase Dashboard手动添加
   - 通过应用UI添加（需要实现创建功能）
   - 编写新的seed.sql

3. **部署到生产环境**
   - Vercel / Netlify / Cloudflare Pages
   - 更新生产环境的VITE_SUPABASE_URL和KEY
   - 配置生产环境的Redirect URLs

---

## 📞 需要帮助？

- **Supabase文档**: https://supabase.com/docs
- **PathFinder文档**:
  - `docs/DATABASE_SETUP.md` - 详细数据库设置指南
  - `docs/SUPABASE_STRATEGY.md` - Supabase配置策略
  - `PATHFINDER_IMPLEMENTATION_REPORT.md` - 完整实现报告

---

**祝开发顺利！** 🚀
