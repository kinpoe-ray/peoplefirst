# Evolv Platform - 项目结构说明

## 项目概述
这是一个基于 React + TypeScript + Vite + Tailwind CSS 的现代化学习平台项目。

## 技术栈
- **React 18.3.1** - 前端框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Router Dom 6** - 路由管理
- **Supabase** - 后端服务
- **Radix UI** - 组件库

## 项目结构

```
evolv-platform/
├── public/                     # 静态资源
├── src/
│   ├── components/            # 组件目录
│   │   ├── AuthNavigation.tsx # 认证导航组件
│   │   ├── AuthStatus.tsx     # 认证状态组件
│   │   ├── ErrorBoundary.tsx  # 错误边界
│   │   └── Layout.tsx         # 布局组件
│   ├── contexts/              # Context目录
│   │   └── AuthContext.tsx    # 认证上下文
│   ├── hooks/                 # 自定义Hooks
│   │   └── use-mobile.tsx     # 移动端检测Hook
│   ├── lib/                   # 工具库
│   │   ├── supabase.ts        # Supabase配置
│   │   └── utils.ts           # 通用工具
│   ├── pages/                 # 页面组件
│   │   ├── AICareerAdvisor.tsx   # AI职业顾问
│   │   ├── Alumni.tsx            # 校友圈
│   │   ├── Dashboard.tsx         # 仪表板
│   │   ├── Guilds.tsx            # 社团
│   │   ├── Login.tsx             # 登录页
│   │   ├── Profile.tsx           # 个人资料
│   │   ├── Register.tsx          # 注册页
│   │   ├── SkillGym.tsx          # 技能健身房
│   │   └── SocialHub.tsx         # 社交中心
│   ├── types/                 # TypeScript类型定义
│   │   └── index.ts           # 基础类型
│   ├── utils/                 # 工具函数
│   │   ├── api.ts             # API客户端
│   │   └── cn.ts              # className工具
│   ├── App.tsx                # 主应用组件
│   ├── main.tsx               # 应用入口
│   ├── index.css              # 全局样式
│   └── vite-env.d.ts          # Vite类型声明
├── package.json               # 项目配置
├── tailwind.config.js         # Tailwind配置
├── tsconfig.json              # TypeScript配置
├── vite.config.ts             # Vite配置
└── postcss.config.js          # PostCSS配置
```

## 已配置功能

### 1. 认证系统
- 使用 Supabase Auth 进行用户认证
- 支持登录/注册/登出
- 基于角色的权限控制
- 认证状态管理

### 2. 路由系统
- React Router DOM 6 配置
- 私有路由保护
- 自动重定向功能
- 嵌套路由布局

### 3. 组件库
- Radix UI 基础组件
- 自定义布局组件
- 认证相关组件
- 错误边界处理

### 4. 样式系统
- Tailwind CSS 完整配置
- 自定义主题色彩
- 深色模式支持
- 响应式设计

### 5. 工具函数
- API 客户端封装
- 通用工具函数
- 类型定义
- className 合并工具

## 路由结构

```
/login          - 登录页
/register       - 注册页
/               - 仪表板（需要认证）
/ai-advisor     - AI职业顾问
/skill-gym      - 技能健身房
/social         - 社交中心
/profile        - 个人资料
/guilds         - 社团
/alumni         - 校友圈
```

## 可用脚本

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 安装依赖
npm run install-deps

# 清理依赖
npm run clean
```

## 开发注意事项

1. **环境变量**: 需要配置 Supabase 相关环境变量
2. **类型安全**: 所有组件都已配置 TypeScript 类型
3. **认证保护**: 主要页面都需要用户登录后才能访问
4. **响应式设计**: 支持移动端和桌面端
5. **代码分割**: 项目已配置代码分割以优化性能

## 部署准备

项目已配置好生产构建脚本：
- TypeScript 编译检查
- Vite 优化构建
- 静态资源优化
- 代码压缩

构建产物位于 `dist/` 目录中，可以部署到任何静态托管服务。

---

项目创建完成！所有基础配置和结构都已就绪。