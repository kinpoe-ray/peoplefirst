// 基础类型定义
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 课程相关类型
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  price: number;
  rating: number;
  students_count: number;
  created_at: string;
}

// 技能相关类型
export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  level_required?: number;
  market_demand?: number;
  prerequisites?: string[];
  difficulty_level?: number;
  learning_resources?: string[];
  estimated_learning_time?: number;
  created_at?: string;
  icon?: string;
}

// 技能图谱节点类型
export interface SkillNode {
  id: string;
  skill_id: string;
  skill: Skill;
  level: number;
  score: number;
  x?: number;
  y?: number;
  status: 'unlocked' | 'locked' | 'in_progress' | 'completed' | 'expert';
  position: { x: number; y: number };
}

// 技能图谱边类型
export interface SkillEdge {
  id: string;
  source: string;
  target: string;
  type: 'prerequisite' | 'progression' | 'related';
  weight: number;
}

// 技能图谱类型
export interface SkillGraph {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  nodes: SkillNode[];
  edges: SkillEdge[];
  total_skills: number;
  completed_skills: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}

// AI技能评估类型
export interface SkillAssessmentRequest {
  skill_name: string;
  user_background?: {
    education_level: string;
    major?: string;
    experience_years: number;
    previous_skills?: string[];
  };
  assessment_type: 'knowledge' | 'practical' | 'comprehensive';
}

export interface SkillAssessmentResult {
  skill_name: string;
  level: number;
  score: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  next_steps: string[];
  estimated_learning_time?: string;
}

// 技能学习路径类型
export interface LearningPath {
  id: string;
  skill_graph_id: string;
  user_id: string;
  title: string;
  description: string;
  steps: LearningStep[];
  total_duration: number;
  difficulty_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningStep {
  id: string;
  skill_id: string;
  order: number;
  title: string;
  description: string;
  estimated_time: number;
  resources: string[];
  prerequisites: string[];
  is_completed: boolean;
  completed_at?: string;
}

// 技能统计类型
export interface SkillStats {
  total_skills: number;
  completed_skills: number;
  in_progress_skills: number;
  locked_skills: number;
  average_score: number;
  category_distribution: { [category: string]: number };
  recent_achievements: SkillAchievement[];
  skill_trends: SkillTrend[];
}

export interface SkillAchievement {
  skill_id: string;
  skill_name: string;
  level_achieved: number;
  score: number;
  achieved_at: string;
  badge_earned?: string;
}

export interface SkillTrend {
  skill_name: string;
  score_change: number;
  level_change: number;
  period: 'week' | 'month' | 'quarter';
}

// 学习路径相关类型
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty_level: number;
  skills: string[];
  courses: string[];
}

// 徽章相关类型
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'learning' | 'social' | 'achievement' | 'skill' | 'milestone';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  skill_id?: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  requirement_score: number;
  requirement_type: 'score' | 'course_complete' | 'skill_mastery' | 'streak' | 'social' | 'milestone';
  requirement_value: number;
  points: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface BadgeProgress {
  badge_id: string;
  current_value: number;
  required_value: number;
  percentage: number;
  is_earned: boolean;
}

export interface BadgeStats {
  total_badges: number;
  earned_badges: number;
  total_points: number;
  rarity_distribution: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  category_distribution: {
    learning: number;
    social: number;
    achievement: number;
    skill: number;
    milestone: number;
  };
}

// 成绩管理相关类型
export interface Grade {
  id: string;
  user_id: string;
  course_id?: string;
  assessment_id?: string;
  skill_id?: string;
  grade_type: 'quiz' | 'assignment' | 'project' | 'final_exam' | 'participation' | 'peer_evaluation';
  title: string;
  max_score: number;
  score?: number;
  letter_grade?: string;
  percentage?: number;
  is_passed?: boolean;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GradeSummary {
  total_courses: number;
  total_credits: number;
  earned_credits: number;
  cumulative_gpa: number;
  semester_gpa?: number;
  grade_distribution: { [grade: string]: number };
  trend_data: GradeTrend[];
}

export interface GradeTrend {
  semester: string;
  gpa: number;
  credits: number;
  courses_count: number;
}

export interface GradeImportData {
  course_name: string;
  course_code: string;
  credits: number;
  semester: string;
  grade_type: string;
  score: number;
  max_score: number;
  letter_grade?: string;
}

// 公会聊天相关类型
export interface GuildMessage {
  id: string;
  guild_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  reply_to?: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar?: string;
  is_edited: boolean;
}

export interface GuildActivity {
  id: string;
  guild_id: string;
  user_id: string;
  activity_type: 'joined' | 'left' | 'message' | 'achievement' | 'level_up';
  content: string;
  metadata?: any;
  created_at: string;
  user_name: string;
  user_avatar?: string;
}

export interface GuildChatRoom {
  id: string;
  guild_id: string;
  name: string;
  type: 'general' | 'announcements' | 'resources' | 'projects';
  description?: string;
  is_private: boolean;
  member_count: number;
  last_message?: GuildMessage;
  created_at: string;
}

// 公会信息类型
export interface Guild {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  max_members: number;
  guild_level: number;
  created_at: string;
  creator_name?: string;
  is_member?: boolean;
  role?: 'leader' | 'moderator' | 'member';
  profiles?: {
    full_name: string;
  };
}