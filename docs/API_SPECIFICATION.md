# Evolv Platform - API 接口规范

## 📋 概述

**版本**: v1.0
**基础URL**: `https://api.evolv-platform.com/v1`
**认证方式**: Bearer Token (Supabase JWT)
**数据格式**: JSON
**字符编码**: UTF-8

---

## 🔐 认证

所有需要认证的接口需要在 Header 中携带：

```
Authorization: Bearer <supabase_jwt_token>
```

---

## 📊 响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2025-01-12T10:00:00Z",
    "request_id": "req_xxxxx"
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "用户输入无效",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-01-12T10:00:00Z",
    "request_id": "req_xxxxx"
  }
}
```

### 分页响应
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

## 🎯 API 端点列表

## 1. 用户认证与资料 (Authentication & Profile)

### 1.1 获取当前用户信息
```
GET /users/me
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "user_type": "student",
    "full_name": "张三",
    "avatar_url": "https://...",
    "school": "清华大学",
    "major": "计算机科学",
    "graduation_year": 2026,
    "level": 5,
    "current_xp": 1250,
    "total_xp": 3500
  }
}
```

### 1.2 更新用户资料
```
PATCH /users/me
```

**请求体:**
```json
{
  "full_name": "张三",
  "bio": "热爱编程的学生",
  "school": "清华大学",
  "avatar_url": "https://..."
}
```

### 1.3 获取其他用户公开资料
```
GET /users/{user_id}
```

---

## 2. 用户成长系统 (User Growth)

### 2.1 获取用户等级信息
```
GET /users/{user_id}/level
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "level": 5,
    "current_xp": 1250,
    "next_level_xp": 1500,
    "total_xp": 3500,
    "progress_percentage": 83.3,
    "rank": "Bronze",
    "next_rank": "Silver"
  }
}
```

### 2.2 增加经验值
```
POST /users/{user_id}/xp
```

**请求体:**
```json
{
  "amount": 50,
  "source": "skill_practice", // skill_practice, challenge_win, social_interaction
  "metadata": {
    "skill_id": "uuid",
    "challenge_id": "uuid"
  }
}
```

### 2.3 获取成就列表
```
GET /achievements
Query: ?category=learning&rarity=rare
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "技能大师",
      "description": "掌握10项技能",
      "icon_url": "https://...",
      "category": "learning",
      "rarity": "epic",
      "points": 100,
      "unlocked": true,
      "unlocked_at": "2025-01-10T08:00:00Z",
      "progress": 10,
      "requirement": 10
    }
  ]
}
```

### 2.4 获取用户成就
```
GET /users/{user_id}/achievements
Query: ?status=unlocked&category=social
```

### 2.5 解锁成就（系统调用）
```
POST /users/{user_id}/achievements
```

**请求体:**
```json
{
  "achievement_id": "uuid"
}
```

### 2.6 获取排行榜
```
GET /leaderboard
Query: ?type=weekly&category=xp&limit=50
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "type": "weekly",
    "period": "2025-W02",
    "rankings": [
      {
        "rank": 1,
        "user_id": "uuid",
        "full_name": "李四",
        "avatar_url": "https://...",
        "score": 2500,
        "change": 2 // 排名变化
      }
    ],
    "current_user_rank": 15
  }
}
```

### 2.7 获取每日任务
```
GET /daily-quests
Query: ?date=2025-01-12
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "完成一项技能练习",
      "description": "在技能训练场完成任意技能的练习",
      "quest_type": "skill_practice",
      "target_count": 1,
      "current_progress": 0,
      "xp_reward": 50,
      "completed": false,
      "expires_at": "2025-01-12T23:59:59Z"
    }
  ]
}
```

### 2.8 更新任务进度
```
POST /daily-quests/{quest_id}/progress
```

**请求体:**
```json
{
  "increment": 1
}
```

---

## 3. 社交功能 (Social Features)

### 3.1 获取动态流
```
GET /feed
Query: ?type=following&page=1&per_page=20
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "post_type": "achievement",
      "author": {
        "id": "uuid",
        "full_name": "张三",
        "avatar_url": "https://...",
        "level": 5
      },
      "content": "刚刚完成了 Python 高级课程！",
      "media_urls": ["https://..."],
      "like_count": 25,
      "comment_count": 3,
      "share_count": 2,
      "liked_by_me": false,
      "created_at": "2025-01-12T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### 3.2 创建动态
```
POST /posts
```

**请求体:**
```json
{
  "content": "今天学到了很多新知识！",
  "post_type": "status", // status, achievement, question, resource
  "media_urls": ["https://..."],
  "visibility": "public" // public, followers, private
}
```

### 3.3 点赞动态
```
POST /posts/{post_id}/like
```

### 3.4 取消点赞
```
DELETE /posts/{post_id}/like
```

### 3.5 获取评论
```
GET /posts/{post_id}/comments
Query: ?page=1&per_page=20
```

### 3.6 发表评论
```
POST /posts/{post_id}/comments
```

**请求体:**
```json
{
  "content": "写得很好！",
  "parent_comment_id": "uuid" // 可选，用于回复评论
}
```

### 3.7 关注用户
```
POST /users/{user_id}/follow
```

### 3.8 取消关注
```
DELETE /users/{user_id}/follow
```

### 3.9 获取关注列表
```
GET /users/{user_id}/following
Query: ?page=1&per_page=20
```

### 3.10 获取粉丝列表
```
GET /users/{user_id}/followers
Query: ?page=1&per_page=20
```

---

## 4. 学习路径 (Learning Paths)

### 4.1 获取推荐学习路径
```
GET /learning-paths/recommendations
Query: ?user_type=student&difficulty=intermediate
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "全栈开发工程师路径",
      "description": "从零基础到全栈工程师",
      "difficulty_level": 3,
      "estimated_hours": 300,
      "target_role": "全栈工程师",
      "skill_count": 15,
      "enrolled_users": 1250,
      "completion_rate": 0.68,
      "match_score": 0.92 // AI 匹配度
    }
  ]
}
```

### 4.2 获取学习路径详情
```
GET /learning-paths/{path_id}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "全栈开发工程师路径",
    "description": "...",
    "steps": [
      {
        "id": "uuid",
        "step_order": 1,
        "title": "HTML/CSS 基础",
        "description": "学习网页结构和样式",
        "skill_id": "uuid",
        "estimated_hours": 20,
        "resources": {
          "videos": ["https://..."],
          "articles": ["https://..."],
          "courses": ["https://..."]
        },
        "completed": false
      }
    ],
    "total_steps": 15,
    "completed_steps": 0
  }
}
```

### 4.3 报名学习路径
```
POST /learning-paths/{path_id}/enroll
```

### 4.4 更新学习进度
```
PUT /learning-paths/{path_id}/progress
```

**请求体:**
```json
{
  "step_id": "uuid",
  "completed": true,
  "time_spent_minutes": 120
}
```

### 4.5 获取我的学习路径
```
GET /users/me/learning-paths
Query: ?status=in_progress
```

---

## 5. 技能系统 (Skills)

### 5.1 获取技能列表
```
GET /skills
Query: ?category=programming&level=intermediate&search=python
```

### 5.2 获取技能详情
```
GET /skills/{skill_id}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Python编程",
    "category": "programming",
    "description": "...",
    "icon": "🐍",
    "difficulty_level": 2,
    "market_demand": 95,
    "learning_resources": ["https://..."],
    "estimated_learning_time": 40,
    "prerequisites": ["uuid1", "uuid2"],
    "user_status": {
      "enrolled": true,
      "level": 3,
      "score": 75,
      "verified": false
    }
  }
}
```

### 5.3 获取用户技能
```
GET /users/{user_id}/skills
Query: ?verified=true
```

### 5.4 更新技能进度
```
PUT /users/me/skills/{skill_id}
```

**请求体:**
```json
{
  "level": 3,
  "score": 75
}
```

### 5.5 申请技能认证
```
POST /skills/{skill_id}/certify
```

**请求体:**
```json
{
  "certification_level": "intermediate",
  "assessment_id": "uuid", // 关联的考核记录
  "project_url": "https://github.com/..." // 可选
}
```

### 5.6 获取认证列表
```
GET /users/{user_id}/certifications
Query: ?skill_id=uuid&level=advanced
```

---

## 6. AI 智能功能 (AI Features)

### 6.1 AI 职业测评
```
POST /ai/career-assessment
```

**请求体:**
```json
{
  "user_type": "student",
  "interests": ["编程", "设计", "数据分析"],
  "current_skills": ["Python", "JavaScript"],
  "career_goals": "成为全栈工程师",
  "education_level": "本科在读",
  "graduation_year": 2026
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "recommended_roles": [
      {
        "role": "全栈开发工程师",
        "match_score": 0.92,
        "reasons": ["技能匹配度高", "市场需求大"],
        "salary_range": "15k-30k",
        "growth_potential": "high"
      }
    ],
    "skill_gaps": [
      {
        "skill": "React框架",
        "importance": "high",
        "learning_time": 40
      }
    ],
    "learning_path_recommendations": ["uuid1", "uuid2"],
    "assessment_id": "uuid"
  }
}
```

### 6.2 AI 技能推荐
```
POST /ai/skill-recommendations
```

**请求体:**
```json
{
  "user_id": "uuid",
  "current_skills": ["uuid1", "uuid2"],
  "target_role": "数据科学家",
  "time_available_hours": 10
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "skill_id": "uuid",
        "skill_name": "机器学习",
        "priority": "high",
        "reason": "目标职位核心技能",
        "estimated_time": 60,
        "difficulty": 4,
        "market_demand": 98
      }
    ]
  }
}
```

### 6.3 生成个性化学习路径
```
POST /ai/learning-path-generator
```

**请求体:**
```json
{
  "user_id": "uuid",
  "target_role": "AI工程师",
  "current_level": "beginner",
  "time_commitment_hours_per_week": 10,
  "preferred_learning_style": "video" // video, article, interactive
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "path_id": "uuid",
    "title": "AI工程师成长路径 - 为张三定制",
    "total_weeks": 24,
    "steps": [...],
    "weekly_plan": {...}
  }
}
```

### 6.4 AI 学习助手对话
```
POST /ai/chat
```

**请求体:**
```json
{
  "message": "我应该如何学习 React？",
  "context": {
    "user_id": "uuid",
    "current_page": "skill-gym",
    "current_skill": "React"
  }
}
```

---

## 7. 学习小组 (Study Groups)

### 7.1 获取学习小组列表
```
GET /study-groups
Query: ?skill_focus=Python&is_public=true&has_vacancy=true
```

### 7.2 创建学习小组
```
POST /study-groups
```

**请求体:**
```json
{
  "name": "Python学习小组",
  "description": "一起学习Python",
  "skill_focus": "Python",
  "max_members": 10,
  "is_public": true
}
```

### 7.3 加入学习小组
```
POST /study-groups/{group_id}/join
```

### 7.4 获取小组成员
```
GET /study-groups/{group_id}/members
```

### 7.5 小组内发消息
```
POST /study-groups/{group_id}/messages
```

---

## 8. 通知系统 (Notifications)

### 8.1 获取通知列表
```
GET /notifications
Query: ?is_read=false&type=achievement&page=1
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "achievement",
      "title": "🎉 恭喜解锁成就",
      "message": "你解锁了「技能新手」成就！",
      "link": "/achievements/uuid",
      "is_read": false,
      "created_at": "2025-01-12T10:00:00Z"
    }
  ],
  "unread_count": 5
}
```

### 8.2 标记通知已读
```
PATCH /notifications/{notification_id}/read
```

### 8.3 全部标记已读
```
POST /notifications/mark-all-read
```

---

## 9. 挑战模式 (Challenges)

### 9.1 获取挑战列表
```
GET /challenges
Query: ?difficulty=medium&skill_id=uuid&status=active
```

### 9.2 参加挑战
```
POST /challenges/{challenge_id}/participate
```

### 9.3 提交挑战答案
```
POST /challenges/{challenge_id}/submit
```

**请求体:**
```json
{
  "answers": {
    "question_1": "答案A",
    "question_2": "42"
  },
  "time_spent_seconds": 300
}
```

### 9.4 获取挑战排行榜
```
GET /challenges/{challenge_id}/leaderboard
```

---

## 10. 分析与报告 (Analytics)

### 10.1 获取学习报告
```
GET /users/{user_id}/analytics/learning-report
Query: ?period=weekly&start_date=2025-01-01&end_date=2025-01-07
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "period": "weekly",
    "total_learning_hours": 15.5,
    "skills_practiced": 5,
    "xp_gained": 850,
    "achievements_unlocked": 2,
    "daily_breakdown": [
      {
        "date": "2025-01-01",
        "hours": 2.5,
        "xp": 150
      }
    ],
    "top_skills": [
      {
        "skill": "Python",
        "hours": 6,
        "progress_gain": 15
      }
    ]
  }
}
```

### 10.2 获取技能进度分析
```
GET /users/{user_id}/analytics/skill-progress
Query: ?skill_id=uuid&timeframe=30d
```

---

## 📝 错误代码

| 错误代码 | HTTP 状态码 | 说明 |
|---------|-----------|------|
| `AUTH_REQUIRED` | 401 | 需要登录 |
| `AUTH_INVALID` | 401 | 认证信息无效 |
| `PERMISSION_DENIED` | 403 | 权限不足 |
| `RESOURCE_NOT_FOUND` | 404 | 资源不存在 |
| `INVALID_INPUT` | 400 | 输入参数无效 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求过于频繁 |
| `SERVER_ERROR` | 500 | 服务器内部错误 |
| `AI_SERVICE_UNAVAILABLE` | 503 | AI服务暂时不可用 |

---

## 🔄 速率限制

| 端点类型 | 限制 |
|---------|------|
| AI 接口 | 10 请求/分钟 |
| 写操作 | 100 请求/分钟 |
| 读操作 | 1000 请求/分钟 |

---

## 🌐 WebSocket 实时接口

### 连接
```
ws://api.evolv-platform.com/v1/ws?token=<jwt>
```

### 订阅通知
```json
{
  "action": "subscribe",
  "channel": "notifications"
}
```

### 订阅学习小组消息
```json
{
  "action": "subscribe",
  "channel": "study_group",
  "group_id": "uuid"
}
```

---

**生成时间**: 2025-01-12
**版本**: v1.0
**维护者**: Evolv Platform API Team
