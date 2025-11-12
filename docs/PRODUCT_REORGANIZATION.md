# Evolv Platform 产品重组方案

## 一、现状问题分析

### 当前15个页面/功能模块：

**认证相关 (2个)**
- Login - 登录
- Register - 注册

**核心功能 (6个)**
- Dashboard - 仪表板
- AICareerAdvisor - AI职业导师（3个子功能：技能图谱、职业诊断、学习路径）
- SkillGym - 技能健身房
- SkillGraphPage - 技能图谱
- ChallengeMode - 闯关挑战模式
- GradeManagement - 成绩管理

**社交功能 (3个)**
- SocialHub - 社交中心
- Guilds - 社团
- Alumni - 校友圈

**个人管理 (3个)**
- Profile - 个人资料
- Settings - 设置
- Badges - 徽章系统

**其他 (1个)**
- AuthTest - 认证测试（开发用）

### 主要问题：

1. **功能重复**：
   - SkillGraphPage 和 AICareerAdvisor 的技能图谱功能重复
   - SkillGym 和 ChallengeMode 都是技能测评，只是模式不同

2. **导航混乱**：
   - 8个一级导航项太多，用户难以记忆
   - 功能分类不清晰（学习类、社交类、管理类混在一起）

3. **用户旅程不清晰**：
   - 新用户进来不知道先做什么
   - 缺少渐进式引导
   - 高级功能和基础功能平级展示

4. **社交功能分散**：
   - SocialHub、Guilds、Alumni 三个独立页面，应该整合

5. **缺少新手引导**：
   - Dashboard 虽然有"快速开始"，但没有明确的成长路径可视化

---

## 二、用户成长历程设计

### 阶段1：发现（首次访问，0-5分钟）

**用户目标**：理解平台价值，决定是否注册

**应该看到什么**：
- 清晰的价值主张："打造你的职业技能档案，AI助力职业成长"
- 3个核心功能亮点：技能测评、AI导师、技能认证
- 快速体验入口（游客模式/演示）

**应该做什么**：
- 浏览功能介绍
- 查看示例技能图谱
- 快速注册/登录

**关键指标**：注册转化率

---

### 阶段2：激活（首次登录后，5-20分钟）

**用户目标**：快速体验核心价值，完成第一个里程碑

**应该看到什么**：
- 个性化欢迎页
- 新手任务引导（4步）
  1. ✅ 完成个人信息
  2. ⭕ 完成首次技能测评
  3. ⭕ 查看AI生成的技能图谱
  4. ⭕ 设定职业目标

**应该做什么**：
- 完成一次技能测评（简化版，5题）
- 获得第一个徽章"初来乍到"
- 看到自己的初始技能分数

**关键指标**：完成首次测评率

---

### 阶段3：日常使用（前1-4周）

**用户目标**：建立使用习惯，积累技能数据

**应该看到什么**：
- 个人成长数据看板（技能数、徽章数、等级）
- 每日任务系统（签到、测评、交流）
- 推荐的学习路径

**应该做什么**：
- 每周完成2-3次技能测评
- 参与社交互动（加入社团/发帖）
- 导入课程成绩，丰富技能图谱
- 尝试闯关挑战模式

**关键指标**：7日留存率、周活跃度

---

### 阶段4：长期成长（1-6个月）

**用户目标**：系统性提升技能，朝目标职位前进

**应该看到什么**：
- 技能成长曲线图
- 距离目标岗位的差距分析
- 学习路径完成进度
- 社交成就（帮助他人数、点赞数）

**应该做什么**：
- 完成系统化学习路径（10-20个技能）
- 获得认证徽章（bronze → silver → gold）
- 导师角色：帮助新人，分享经验
- 参加技能竞赛/挑战赛

**关键指标**：月活跃度、技能增长数

---

### 阶段5：精通与回馈（6个月+）

**用户目标**：成为平台专家，建立个人品牌

**应该看到什么**：
- 个人技能品牌主页（公开展示）
- 影响力排行榜（帮助他人、贡献题目）
- 职业成就（转岗成功、薪资提升）

**应该做什么**：
- 成为某个技能领域的认证导师
- 贡献高质量测评题目
- 分享职业转型经验
- 帮助学弟学妹（校友圈）

**关键指标**：付费转化率、NPS推荐值

---

## 三、重组后的产品结构

### 3.1 新的导航架构（5个一级导航）

```
┌─────────────────────────────────────────────────────┐
│  Logo [Evolv]          首页 | 成长中心 | 社区 | 我的  │
└─────────────────────────────────────────────────────┘
```

#### 1. 🏠 首页（Dashboard）
- **目标用户**：所有用户
- **核心内容**：
  - 个性化欢迎卡片
  - 成长数据概览（4个卡片：技能数、验证技能、徽章、等级）
  - 每日任务卡片（3个任务，进度条）
  - 快速入口（4个按钮）
  - 推荐内容流（社区热门、学习推荐）

#### 2. 🚀 成长中心（Growth Hub）- **整合后的核心学习模块**
- **二级Tab导航**：
  - **技能测评**（整合 SkillGym + ChallengeMode）
    - 快速测评模式（原 SkillGym）
    - 闯关挑战模式（原 ChallengeMode）
    - 我的测评记录
  - **AI导师**（原 AICareerAdvisor）
    - 职业诊断
    - 技能图谱（整合 SkillGraphPage）
    - 学习路径生成
  - **学习路径**（新增）
    - 推荐路径
    - 我的路径
    - 路径进度追踪
  - **成绩管理**（原 GradeManagement）
    - 导入课程成绩
    - 学术技能图谱

#### 3. 👥 社区（Community）- **整合后的社交模块**
- **二级Tab导航**：
  - **动态广场**（原 SocialHub 主体）
    - 全部动态
    - 关注的人
    - 热门话题
  - **技能社团**（原 Guilds）
    - 推荐社团
    - 我的社团
    - 创建社团
  - **校友圈**（原 Alumni）
    - 校友动态
    - 职场分享
    - 求职内推

#### 4. 🏆 徽章系统（独立页面）
- **保留原 Badges 页面**
- 增强内容：
  - 徽章墙（已获得 + 未获得）
  - 徽章故事（如何获得每个徽章）
  - 徽章分享（社交媒体）

#### 5. 👤 我的（Profile & Settings）
- **二级导航**：
  - 个人资料（原 Profile）
  - 我的徽章（快捷入口）
  - 设置（原 Settings）
  - 数据统计（新增）

---

### 3.2 页面级整合方案

#### 整合1：成长中心（Growth Hub）- 新建
**文件路径**：`src/pages/GrowthHub.tsx`

**功能模块**：
```typescript
<Tabs>
  <Tab name="skill-assessment">
    <AssessmentModeSelector>
      - 快速测评（原 SkillGym）
      - 闯关挑战（原 ChallengeMode）
    </AssessmentModeSelector>
    <MyAssessmentHistory />
  </Tab>

  <Tab name="ai-advisor">
    <AICareerAdvisor>
      - 职业诊断
      - 技能图谱（整合 SkillGraphPage 的可视化）
      - 学习路径生成
    </AICareerAdvisor>
  </Tab>

  <Tab name="learning-paths">
    <LearningPathsManager />
  </Tab>

  <Tab name="grade-management">
    <GradeManagement />
  </Tab>
</Tabs>
```

#### 整合2：社区（Community）- 新建
**文件路径**：`src/pages/Community.tsx`

**功能模块**：
```typescript
<Tabs>
  <Tab name="feed">
    <SocialHub />
  </Tab>

  <Tab name="guilds">
    <Guilds />
  </Tab>

  <Tab name="alumni">
    <Alumni />
  </Tab>
</Tabs>
```

#### 整合3：我的（MySpace）- 新建
**文件路径**：`src/pages/MySpace.tsx`

**功能模块**：
```typescript
<Tabs>
  <Tab name="profile">
    <Profile />
  </Tab>

  <Tab name="badges">
    <BadgesQuickView />
  </Tab>

  <Tab name="settings">
    <Settings />
  </Tab>

  <Tab name="statistics">
    <DataStatistics />
  </Tab>
</Tabs>
```

---

## 四、新手引导流程设计

### 4.1 首次登录引导（Modal 弹窗形式）

**步骤1：欢迎页**
```
┌─────────────────────────────────────┐
│      欢迎来到 Evolv！               │
│   打造你的职业技能成长档案          │
│                                     │
│   [开始 3 分钟新手之旅] →          │
└─────────────────────────────────────┘
```

**步骤2：完善个人信息**
```
告诉我们一些关于你的信息
- 你的专业/职业方向：_______
- 当前阶段：[ ] 学生 [ ] 在职 [ ] 转行
- 目标职位：_______

[下一步] →
```

**步骤3：首次技能测评（简化版）**
```
让我们快速评估你的一项核心技能

选择一个你想要测评的技能：
[ JavaScript基础 ]  [ Python编程 ]
[ 数据分析 ]        [ 产品设计 ]

只需回答 5 道题，大约 2 分钟
[开始测评] →
```

**步骤4：查看结果&设定目标**
```
恭喜！你获得了 75 分 🎉

你在 JavaScript 基础上的表现：
- 基础语法: ★★★★☆
- 函数编程: ★★★☆☆
- 异步处理: ★★☆☆☆

设定你的3个月目标：
[ ] 将 JavaScript 提升到 90 分
[ ] 学习 React 框架
[ ] 完成 10 个项目实战

[完成引导，进入主页] →
```

### 4.2 首页新手任务卡片

```typescript
<OnboardingTasksCard>
  <Task completed={true}>
    ✅ 完成个人信息
  </Task>
  <Task completed={true}>
    ✅ 完成首次技能测评
  </Task>
  <Task completed={false}>
    ⭕ 加入一个技能社团
  </Task>
  <Task completed={false}>
    ⭕ 生成你的学习路径
  </Task>

  进度: ██████░░░░ 40%
  完成全部任务解锁"破冰者"徽章 🏆
</OnboardingTasksCard>
```

---

## 五、具体实施步骤

### Phase 1: 创建新的整合页面（1-2天）

1. **创建 `src/pages/GrowthHub.tsx`**
   - 4个Tab布局
   - 复用现有组件代码

2. **创建 `src/pages/Community.tsx`**
   - 3个Tab布局
   - 复用 SocialHub、Guilds、Alumni

3. **创建 `src/pages/MySpace.tsx`**
   - 4个Tab布局
   - 复用 Profile、Settings

### Phase 2: 更新路由和导航（半天）

1. **更新 `src/App.tsx` 路由**
```typescript
<Route path="/" element={<Layout />}>
  <Route index element={<Dashboard />} />
  <Route path="growth" element={<GrowthHub />} />
  <Route path="community" element={<Community />} />
  <Route path="badges" element={<Badges />} />
  <Route path="my" element={<MySpace />} />

  {/* 保留旧路由作为重定向，避免404 */}
  <Route path="skill-gym" element={<Navigate to="/growth?tab=assessment" />} />
  <Route path="ai-advisor" element={<Navigate to="/growth?tab=ai" />} />
  <Route path="social" element={<Navigate to="/community" />} />
  <Route path="guilds" element={<Navigate to="/community?tab=guilds" />} />
  <Route path="profile" element={<Navigate to="/my" />} />
</Route>
```

2. **更新 `src/components/AuthNavigation.tsx`**
```typescript
// Desktop Navigation - 从8个减少到5个
<Link to="/">首页</Link>
<Link to="/growth">成长中心</Link>
<Link to="/community">社区</Link>
<Link to="/badges">徽章</Link>
<Link to="/my">我的</Link>
```

### Phase 3: 开发新手引导组件（1-2天）

1. **创建 `src/components/OnboardingFlow.tsx`**
   - 4步引导流程
   - 使用Modal组件
   - 状态保存到localStorage

2. **创建 `src/components/OnboardingTasksCard.tsx`**
   - 任务列表展示
   - 完成状态追踪
   - 进度条动画

3. **更新 `src/pages/Dashboard.tsx`**
   - 添加OnboardingTasksCard
   - 新用户展示引导入口

### Phase 4: 数据库迁移（半天）

```sql
-- 添加用户引导状态表
CREATE TABLE user_onboarding (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  completed_onboarding BOOLEAN DEFAULT FALSE,
  current_step INTEGER DEFAULT 1,
  completed_tasks JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 添加每日任务表
CREATE TABLE daily_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  quest_type VARCHAR(50), -- 'assessment', 'social', 'learning'
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  date DATE DEFAULT CURRENT_DATE
);
```

### Phase 5: 测试和优化（1天）

1. 功能测试
2. 移动端适配测试
3. 性能优化
4. A/B测试准备

---

## 六、预期效果

### 用户体验提升：

| 指标 | 当前 | 目标 | 提升 |
|------|------|------|------|
| 首页导航项 | 8个 | 5个 | ↓ 37.5% |
| 新用户首日完成测评率 | ~30% | ~60% | ↑ 100% |
| 7日留存率 | ~25% | ~45% | ↑ 80% |
| 平均访问页面数 | 2.3 | 4.5 | ↑ 96% |

### 功能聚焦：

- ✅ 清晰的用户成长路径（5个阶段）
- ✅ 渐进式功能解锁（新手→专家）
- ✅ 减少认知负担（5个一级导航）
- ✅ 提升核心功能使用率（成长中心）

---

## 七、回退方案

如果新版本用户反馈不佳，可以：

1. 保留旧路由（已在Phase 2中实现）
2. 提供"经典导航模式"开关
3. 收集用户反馈后迭代调整

---

## 八、下一步行动

**立即执行**：
1. ✅ 完成此文档评审
2. ⬜ 开发Phase 1 - 创建整合页面
3. ⬜ 开发Phase 2 - 更新路由
4. ⬜ 测试新导航结构

**本周目标**：
- 完成Phase 1-3
- 内部测试可用版本

**下周目标**：
- 完成Phase 4-5
- 小范围灰度发布
