# PathFinder - 职业探索平台 MVP

> 先试试，再决定 - 为18-30岁职场迷茫者设计的职业探索平台

## 项目概述

PathFinder是一个基于Linear.app风格设计的现代化Web应用，旨在帮助职场迷茫者通过实践和探索找到适合自己的职业方向。

### 核心价值
- **目标用户**: 18-30岁职场迷茫者
- **产品理念**: "少一些规划，多一些尝试"
- **Slogan**: "先试试，再决定"

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS + Linear.app风格设计系统
- **UI组件**: Radix UI (无样式组件库)
- **路由**: React Router v6
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **表单管理**: React Hook Form + Zod
- **图表**: Recharts
- **图标**: Lucide React

### 后端
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **实时功能**: Supabase Realtime (可选)

## 项目结构

```
src/
├── api/                    # API调用层
│   ├── contents.ts        # 职业内容API
│   ├── tasks.ts           # 任务API
│   └── stories.ts         # 故事API
├── components/            # UI组件
│   ├── layout/           # 布局组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── content/          # 内容模块组件
│   ├── task/             # 任务模块组件
│   ├── story/            # 故事模块组件
│   └── ui/               # 基础UI组件
├── pages/                # 页面组件
│   ├── Home.tsx          # 首页
│   ├── ContentList.tsx   # 内容列表
│   ├── TaskList.tsx      # 任务列表
│   └── StoryWall.tsx     # 故事墙
├── stores/               # Zustand状态管理
│   ├── authStore.ts      # 用户认证
│   ├── contentStore.ts   # 内容状态
│   ├── taskStore.ts      # 任务状态
│   └── storyStore.ts     # 故事状态
├── types/                # TypeScript类型定义
│   └── pathfinder.ts     # PathFinder平台类型
├── lib/                  # 工具库
│   ├── supabase.ts       # Supabase客户端
│   └── utils.ts          # 通用工具函数
├── App.tsx               # 根组件
├── main.tsx              # 入口文件
└── index.css             # 全局样式

supabase/
└── migrations/           # 数据库迁移文件
    └── pathfinder_schema.sql  # PathFinder数据库结构
```

## 三大核心功能模块

### 1. 职业去魅化内容库
**功能特点:**
- 职业内容Feed页面，支持分类筛选（运营/产品/设计/开发/市场）
- 内容详情页展示:
  - "一句话真相"高亮区块
  - "真实一天"时间轴可视化（带情绪渐变色）
  - "高光瞬间" vs "崩溃时刻"对比卡片
  - "能力需求雷达图"（5维度）
  - 收藏和评论功能

**相关文件:**
- `/src/pages/ContentList.tsx` - 内容列表页
- `/src/api/contents.ts` - 内容API
- `/src/stores/contentStore.ts` - 内容状态管理

### 2. 技能试验场
**功能特点:**
- 任务列表，支持难度筛选（简单/中等/困难）
- 分步骤任务执行流程:
  - Step 1-3: 情境说明 + 工具介绍
  - Step 4: 实操提交区
  - Step 5: AI反馈 + 能力雷达图评分
- 我的任务记录页面

**相关文件:**
- `/src/pages/TaskList.tsx` - 任务列表页
- `/src/api/tasks.ts` - 任务API
- `/src/stores/taskStore.ts` - 任务状态管理

### 3. 迷茫者故事墙
**功能特点:**
- 瀑布流布局故事展示
- 三段式故事叙事:
  - 我试了什么（蓝色主题）
  - 我失败了什么（橙色主题）
  - 我发现了什么（绿色主题）
- 支持Markdown编辑和渲染
- 点赞、收藏和评论功能

**相关文件:**
- `/src/pages/StoryWall.tsx` - 故事墙页面
- `/src/api/stories.ts` - 故事API
- `/src/stores/storyStore.ts` - 故事状态管理

## 设计系统 (Linear.app风格)

### 色彩系统
```css
/* 品牌色 */
pathBlue: #4A90E2 (主品牌色)
warmOrange: #FF9F43 (辅助色)
successGreen: #2ECC71 (成功色)
warningRed: #E74C3C (警告色)

/* 深色主题 */
dark-bg: #050505 (背景色)
dark-surface: #0D0D0D (表面色)
dark-border: #1A1A1A (边框色)
dark-text-primary: #FFFFFF (主文本)
dark-text-secondary: #9CA3AF (次要文本)
dark-text-tertiary: #6B7280 (三级文本)
```

### 字体系统
- Display: 28px / line-height 1.2 / font-weight 500
- H1: 20px / line-height 1.4 / font-weight 600
- Body: 16px / line-height 1.6 / font-weight 400
- Caption: 14px / line-height 1.5 / font-weight 400
- Small: 12px / line-height 1.5 / font-weight 400

### 间距系统
8px grid: 4, 8, 12, 16, 24, 32, 48, 64px

### 圆角规范
- 按钮: 8px
- 卡片: 12px
- 头像: 50%

## 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置环境变量
创建 `.env` 文件:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 初始化数据库
在Supabase Dashboard中执行 `/supabase/migrations/pathfinder_schema.sql` 文件内容

### 4. 启动开发服务器
```bash
pnpm run dev
```

访问 `http://localhost:5173`

## 数据库表结构

### users (用户表)
- id, email, username, avatar_url
- bio, current_career, career_confusion_level
- interested_categories, created_at, last_active_at

### contents (职业内容表)
- id, title, category, truth_sentence
- daily_timeline (JSONB), highlight_moments (JSONB)
- collapse_moments (JSONB), skill_radar (JSONB)
- tags, author_id, view_count, favorite_count, comment_count

### tasks (任务表)
- id, title, category, difficulty, duration_minutes
- description, steps (JSONB), skill_dimensions
- tags, attempt_count, completion_rate, avg_rating

### user_task_attempts (用户任务尝试表)
- id, user_id, task_id, status, current_step
- submission_content (JSONB), ai_feedback
- skill_scores (JSONB), time_spent_minutes, rating

### stories (故事表)
- id, user_id, title, category
- attempts (Markdown), failures (Markdown), discoveries (Markdown)
- tags, like_count, favorite_count, comment_count, is_public

### favorites (收藏表)
- id, user_id, target_type, target_id

### comments (评论表)
- id, user_id, target_type, target_id
- content, parent_id, like_count

## 开发指南

### 添加新页面
1. 在 `/src/pages/` 创建页面组件
2. 在 `/src/App.tsx` 添加路由
3. 在 `/src/components/layout/Header.tsx` 添加导航链接（如需要）

### 添加新API
1. 在 `/src/api/` 创建API文件
2. 定义API函数
3. 在对应的Store中调用

### 添加新状态
1. 在 `/src/stores/` 创建Store文件
2. 使用Zustand定义状态和Actions
3. 在组件中使用 `useStore()` hook

## 待完成功能 (后续迭代)

- [ ] 内容详情页 (ContentDetail.tsx)
- [ ] 任务执行页 (TaskExecution.tsx)
- [ ] 故事详情页 (StoryDetail.tsx)
- [ ] 故事创建页 (StoryCreate.tsx)
- [ ] 个人中心页 (Profile.tsx)
- [ ] 用户登录/注册页面
- [ ] AI评估功能集成
- [ ] 实时评论功能
- [ ] 图片上传功能
- [ ] 移动端适配优化

## 性能优化建议

1. **代码分割**: 使用 React.lazy 对大页面进行懒加载
2. **图片优化**: 使用 WebP 格式 + 懒加载
3. **虚拟滚动**: 对长列表使用虚拟滚动组件
4. **防抖节流**: 对搜索、滚动等高频操作进行优化
5. **缓存策略**: 使用 Supabase 的缓存机制

## 部署

### Vercel部署
```bash
pnpm run build
# 然后在Vercel中导入项目
```

### 环境变量配置
在Vercel中配置:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## 贡献指南

欢迎提交Issue和Pull Request！

## License

MIT

---

**PathFinder** - 让每个迷茫者都能找到属于自己的路径 🚀
