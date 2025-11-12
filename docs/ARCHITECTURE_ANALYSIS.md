# Evolv Platform - 架构分析与优化方案

## 🎯 当前架构概览

### 现有页面结构（15个核心页面）

**认证层:**
- `/login` - 登录
- `/register` - 注册

**核心功能区:**
- `/` (Dashboard) - 用户主页
- `/ai-advisor` - AI 职业顾问
- `/skill-gym` - 技能训练场
- `/skill-graph` - 技能图谱
- `/challenge` - 挑战模式
- `/social` - 社交中心
- `/profile` - 个人资料
- `/guilds` - 公会系统
- `/alumni` - 校友网络
- `/badges` - 徽章系统
- `/badge-wall` - 徽章墙
- `/grades` - 成绩管理
- `/settings` - 设置

**管理功能:**
- `/teacher-portal` - 教师门户
- `/school-dashboard` - 学校仪表板
- `/skill-folio` - 技能作品集
- `/skill-arena` - 技能竞技场

---

## 🔍 识别的关键缺失环节

### 1. 用户旅程断层

#### ❌ 新用户引导流程缺失
```
当前: Register → Login → Dashboard (直接进入)
问题: 新用户不知道从哪里开始

应该: Register → Welcome → Role Selection → Initial Assessment →
      Personalized Dashboard → First Task (Quick Win)
```

#### ❌ 测评到学习的断层
```
当前: AI Advisor (测评) → ？ → Skill Gym (学习)
问题: 测评结果如何转化为学习路径？

应该: AI Advisor → Generate Learning Path → Skill Gym →
      Practice → Assessment → Certification
```

#### ❌ 学习成果认证缺失
```
当前: Skill Gym → 技能提升 → Badges (简单徽章)
问题: 缺少可信的技能认证系统

应该: 完成学习 → 技能考核 → 获得认证 →
      分享到简历/LinkedIn → 职业机会
```

### 2. 社交激励机制不完整

#### ❌ 社交中心功能单薄
```
现有: /social (SocialHub)
缺失:
- 动态发布系统
- 评论互动
- 点赞/收藏
- 关注/粉丝
- 学习小组
- 问答社区
- 排行榜
```

#### ❌ 游戏化元素不足
```
现有: Badges, Challenge Mode
缺失:
- 每日任务系统
- 连续签到奖励
- 积分/经验值系统
- 等级/排名系统
- 成就系统
- 赛季/活动系统
```

### 3. 数据流转与状态管理

#### ❌ 缺少全局状态管理
```
问题:
- 用户信息散落在各个页面
- 技能数据未统一管理
- 学习进度无法跨页面同步
```

#### ❌ 缺少离线支持
```
问题:
- 网络断开时应用无法使用
- 学习进度可能丢失
- 无法缓存学习内容
```

---

## 🎨 完整页面流程图

\`\`\`mermaid
graph TB
    Start([访问网站]) --> CheckAuth{已登录?}

    %% 未登录流程
    CheckAuth -->|否| Landing[着陆页]
    Landing --> Login[登录页]
    Landing --> Register[注册页]

    %% 注册流程（缺失引导）
    Register --> |提交| RoleSelect{{角色选择}}
    RoleSelect -->|学生| StudentOnboard[学生引导]
    RoleSelect -->|职场人士| ProfOnboard[职场人引导]

    StudentOnboard --> InitAssess[初始测评]
    ProfOnboard --> InitAssess

    InitAssess --> Dashboard[个人主页]

    %% 已登录流程
    CheckAuth -->|是| Dashboard

    %% 核心功能区
    Dashboard --> AIAdvisor[AI职业顾问]
    Dashboard --> SkillGym[技能训练场]
    Dashboard --> Social[社交中心]
    Dashboard --> Challenge[挑战模式]
    Dashboard --> Profile[个人资料]

    %% AI 职业顾问流程
    AIAdvisor --> Assessment[职业测评]
    Assessment -.->|断层| LearningPath{{学习路径}}
    LearningPath -.->|断层| SkillGym

    %% 技能学习流程
    SkillGym --> SkillGraph[技能图谱]
    SkillGym --> Practice[练习模式]
    Practice -.->|缺失| Exam[技能考核]
    Exam -.->|缺失| Cert[技能认证]

    %% 社交功能流程
    Social --> Feed{{动态流}}
    Social --> Guilds[公会系统]
    Social --> Alumni[校友网络]
    Feed -.->|缺失| Post{{发布动态}}
    Feed -.->|缺失| Comment{{评论互动}}

    %% 成就系统
    Dashboard --> Badges[徽章系统]
    Badges --> BadgeWall[徽章墙]
    Challenge --> Badges
    SkillGym --> Badges

    %% 管理功能（教师/学校）
    Dashboard -->|教师角色| TeacherPortal[教师门户]
    Dashboard -->|学校管理| SchoolDash[学校仪表板]
    TeacherPortal --> Grades[成绩管理]

    %% 设置与资料
    Profile --> Settings[设置]
    Profile --> SkillFolio[技能作品集]

    %% 竞技场
    Challenge --> SkillArena[技能竞技场]

    style LearningPath fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px,stroke-dasharray: 5 5
    style Post fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px,stroke-dasharray: 5 5
    style Comment fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px,stroke-dasharray: 5 5
    style Exam fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px,stroke-dasharray: 5 5
    style Cert fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px,stroke-dasharray: 5 5
    style Feed fill:#ffd93d,stroke:#f0b429,stroke-width:2px
    style RoleSelect fill:#ffd93d,stroke:#f0b429,stroke-width:2px
\`\`\`

**图例:**
- 🔴 红色虚线框：缺失的关键功能
- 🟡 黄色框：需要增强的功能
- 实线：已实现的连接

---

## 🗄️ 数据库架构优化

### 现有表结构

\`\`\`sql
-- 已存在
profiles (用户资料)
user_skills (用户技能)
skills (技能库)
badges (徽章)
user_badges (用户徽章)
guilds (公会)
guild_members (公会成员)
\`\`\`

### 新增表设计

#### 1. 用户成长系统

\`\`\`sql
-- 用户等级与经验
CREATE TABLE user_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  next_level_xp INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 成就系统
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  category VARCHAR(50), -- learning, social, challenge, special
  rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
  points INTEGER DEFAULT 10,
  requirement_type VARCHAR(50), -- skill_count, login_days, challenge_wins
  requirement_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, achievement_id)
);

-- 每日任务系统
CREATE TABLE daily_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  quest_type VARCHAR(50), -- skill_practice, social_interaction, challenge
  target_count INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 50,
  valid_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_quest_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES daily_quests(id) ON DELETE CASCADE,
  current_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, quest_id)
);
\`\`\`

#### 2. 社交功能

\`\`\`sql
-- 用户关注关系
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 动态发布
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'status', -- status, achievement, question, resource
  media_urls TEXT[], -- 图片/视频 URLs
  visibility VARCHAR(20) DEFAULT 'public', -- public, followers, private
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 点赞
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- 学习小组
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  skill_focus VARCHAR(100), -- 主要学习技能
  max_members INTEGER DEFAULT 10,
  current_members INTEGER DEFAULT 0,
  creator_id UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- admin, moderator, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
\`\`\`

#### 3. 学习路径系统

\`\`\`sql
-- 学习路径模板
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty_level INTEGER DEFAULT 1, -- 1-5
  estimated_hours INTEGER,
  target_role VARCHAR(100), -- 目标职位
  skill_ids UUID[], -- 关联的技能IDs
  created_by UUID REFERENCES profiles(id),
  is_template BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 学习路径步骤
CREATE TABLE learning_path_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  skill_id UUID REFERENCES skills(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  resources JSONB, -- {videos: [], articles: [], courses: []}
  estimated_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户学习路径
CREATE TABLE user_learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  path_id UUID REFERENCES learning_paths(id),
  current_step INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'in_progress' -- in_progress, completed, paused
);

-- 学习路径步骤进度
CREATE TABLE user_step_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_path_id UUID REFERENCES user_learning_paths(id) ON DELETE CASCADE,
  step_id UUID REFERENCES learning_path_steps(id),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(user_path_id, step_id)
);
\`\`\`

#### 4. 技能认证系统

\`\`\`sql
-- 技能认证
CREATE TABLE skill_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id),
  certification_level VARCHAR(50), -- beginner, intermediate, advanced, expert
  score INTEGER, -- 考核分数
  certificate_url TEXT, -- 证书图片
  verified_by UUID REFERENCES profiles(id), -- 验证者（教师）
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN DEFAULT TRUE
);

-- 技能考核记录
CREATE TABLE skill_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id),
  assessment_type VARCHAR(50), -- quiz, project, peer_review
  score INTEGER,
  max_score INTEGER,
  passed BOOLEAN,
  feedback TEXT,
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### 5. 通知系统

\`\`\`sql
-- 通知
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- achievement, follow, like, comment, quest
  title VARCHAR(200) NOT NULL,
  message TEXT,
  link VARCHAR(500), -- 跳转链接
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
\`\`\`

#### 6. 活动日志与分析

\`\`\`sql
-- 用户活动日志
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- login, skill_practice, post_create, challenge_complete
  entity_type VARCHAR(50), -- skill, post, challenge
  entity_id UUID,
  metadata JSONB, -- 额外数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_time ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type, created_at DESC);
\`\`\`

---

## 📊 数据库 ER 图

\`\`\`mermaid
erDiagram
    profiles ||--o{ user_levels : has
    profiles ||--o{ user_achievements : earns
    profiles ||--o{ user_follows : follows
    profiles ||--o{ posts : creates
    profiles ||--o{ comments : writes
    profiles ||--o{ user_learning_paths : enrolls
    profiles ||--o{ skill_certifications : obtains
    profiles ||--o{ notifications : receives

    achievements ||--o{ user_achievements : awarded_to

    posts ||--o{ comments : has
    posts ||--o{ post_likes : receives
    comments ||--o{ comment_likes : receives

    learning_paths ||--o{ learning_path_steps : contains
    learning_paths ||--o{ user_learning_paths : instantiates

    user_learning_paths ||--o{ user_step_progress : tracks
    learning_path_steps ||--o{ user_step_progress : progresses

    skills ||--o{ skill_certifications : certifies
    skills ||--o{ skill_assessments : assesses
    skills ||--o{ user_skills : develops

    daily_quests ||--o{ user_quest_progress : completed_by

    study_groups ||--o{ study_group_members : includes
\`\`\`

---

## 🔗 核心数据流

### 1. 新用户注册流程
\`\`\`
Register →
  Create profile →
  Create user_levels (level 1, 0 XP) →
  Show onboarding →
  Initial assessment →
  Generate learning_path →
  Create user_learning_paths →
  Redirect to Dashboard
\`\`\`

### 2. 技能学习闭环
\`\`\`
Dashboard →
  View learning_paths →
  Start step →
  Practice in SkillGym →
  Update user_step_progress →
  Complete step →
  Award XP (user_levels) →
  Take assessment →
  Pass → Issue certification →
  Unlock achievement →
  Notify user
\`\`\`

### 3. 社交互动流
\`\`\`
User A creates post →
  Notify followers →
  User B likes →
  Update post.like_count →
  Create post_likes →
  Award XP to User A →
  User C comments →
  Create comment →
  Update post.comment_count →
  Notify User A →
  Award XP to both users
\`\`\`

---

## 🎯 下一步行动

### 优先级 1 (立即执行)
1. ✅ 创建数据库迁移文件
2. ✅ 设计 API 接口规范
3. ✅ 实现用户成长系统后端

### 优先级 2 (本周完成)
4. 实现社交功能后端 API
5. 创建学习路径推荐算法
6. 集成 Grok AI API

### 优先级 3 (下周完成)
7. 前端用户成长UI
8. 社交动态流前端
9. 移动端适配

---

**生成时间**: 2025-01-12
**版本**: v1.0
**作者**: Claude Code Architecture Team
