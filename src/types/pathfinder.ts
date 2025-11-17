// PathFinder 平台类型定义

// ============= 用户相关 =============
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  current_career?: string;
  career_confusion_level?: number; // 1-10
  interested_categories?: string[];
  created_at: string;
  last_active_at: string;
}

// ============= 职业内容去魅化 =============
export type CareerCategory = '运营' | '产品' | '设计' | '开发' | '市场' | '全部';

export interface DailyTimelineItem {
  time: string; // HH:mm format
  activity: string;
  mood: 'positive' | 'neutral' | 'negative'; // 用于渐变色显示
}

export interface MomentItem {
  title: string;
  description: string;
}

export interface SkillRadar {
  creativity: number; // 1-10
  logic: number;
  communication: number;
  stress_resistance: number;
  learning_ability: number;
}

export interface Content {
  id: string;
  title: string;
  category: CareerCategory;
  truth_sentence: string; // 一句话真相
  daily_timeline: DailyTimelineItem[];
  highlight_moments: MomentItem[];
  collapse_moments: MomentItem[];
  skill_radar: SkillRadar;
  tags: string[];
  author_id: string;
  author?: User;
  view_count: number;
  favorite_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

// ============= 技能试验场 =============
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'in_progress' | 'completed' | 'abandoned';
export type StepType = 'text' | 'video' | 'form' | 'result';

export interface TaskStep {
  step_number: number;
  title: string;
  content: string;
  type: StepType;
  media_url?: string; // 图片或视频URL
}

export interface Task {
  id: string;
  title: string;
  category: CareerCategory;
  difficulty: TaskDifficulty;
  duration_minutes: number;
  description: string;
  steps: TaskStep[];
  skill_dimensions: string[]; // 评估维度
  tags: string[];
  attempt_count: number;
  completion_rate: number; // 0-100
  avg_rating: number; // 1-5
  created_at: string;
}

export interface TaskSubmissionContent {
  [stepNumber: string]: {
    text?: string;
    file_url?: string;
    answers?: string[];
    [key: string]: unknown;
  };
}

export interface UserTaskAttempt {
  id: string;
  user_id: string;
  task_id: string;
  task?: Task;
  status: TaskStatus;
  current_step: number;
  submission_content?: TaskSubmissionContent; // 用户提交的内容
  ai_feedback?: string; // AI评价
  skill_scores?: SkillRadar; // AI评分
  time_spent_minutes?: number;
  rating?: number; // 1-5
  started_at: string;
  completed_at?: string;
}

// ============= 迷茫者故事墙 =============
export interface Story {
  id: string;
  user_id: string;
  author?: User;
  title: string;
  category: CareerCategory;
  attempts: string; // Markdown格式
  failures: string; // Markdown格式
  discoveries: string; // Markdown格式
  tags: string[];
  like_count: number;
  favorite_count: number;
  comment_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ============= 通用交互 =============
export type TargetType = 'content' | 'task' | 'story';

export interface Favorite {
  id: string;
  user_id: string;
  target_type: TargetType;
  target_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  author?: User;
  target_type: TargetType;
  target_id: string;
  content: string;
  parent_id?: string; // 支持回复
  like_count: number;
  created_at: string;
}

// ============= API响应类型 =============
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// ============= 表单类型 =============
export interface StoryFormData {
  title: string;
  category: CareerCategory;
  attempts: string;
  failures: string;
  discoveries: string;
  tags: string[];
}

export interface TaskSubmission {
  task_id: string;
  step_number: number;
  content: TaskSubmissionContent;
}

// ============= 统计数据 =============
export interface DashboardStats {
  total_contents: number;
  total_tasks: number;
  total_stories: number;
  active_users: number;
}
