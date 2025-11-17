/**
 * Evolv Platform API Client
 * Type-safe API client for interacting with the Evolv Platform backend
 */

import { supabase } from './supabase';
import { createLogger } from './logger';

const logger = createLogger('APIClient');

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3015/api/v1';

// ==================== Types ====================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: number | undefined;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// User Growth Types
export interface Achievement {
  id: string;
  badge: Badge;
  earned_at: string;
  progress: {
    current: number;
    required: number;
    percentage: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'learning' | 'social' | 'achievement' | 'skill' | 'milestone';
  points: number;
}

export interface UserLevel {
  user_id: string;
  current_level: number;
  total_xp: number;
  xp_to_next_level: number;
  level_progress_percentage: number;
  next_level_rewards: Array<{
    type: string;
    name: string;
  }>;
  rank: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: string;
    level: number;
  };
  score: number;
  change: number;
}

// Social Types
export interface PostUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  user_type: string;
}

export interface PostAttachment {
  type: 'image' | 'video' | 'link' | 'file';
  url: string;
  metadata?: Record<string, unknown>;
}

export interface Post {
  id: string;
  user: PostUser;
  content: string;
  attachments: PostAttachment[];
  visibility: 'public' | 'followers' | 'private';
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user: PostUser;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  is_liked: boolean;
}

// Learning Path Types
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: string;
  skills_covered: string[];
  total_steps: number;
  enrollment_count: number;
  rating: number;
  is_enrolled: boolean;
  created_at: string;
}

export interface LearningPathProgress {
  enrollment_id: string;
  path: LearningPath;
  enrolled_at: string;
  last_accessed: string;
  completion_percentage: number;
  completed_steps: number;
  total_steps: number;
  time_spent: number;
  estimated_completion_date: string;
  step_progress: Array<{
    step_id: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
    completion_percentage: number;
    time_spent: number;
    last_accessed?: string;
  }>;
}

// Certification Types
export interface CertificationEvidence {
  type: string;
  url: string;
  description: string;
}

export interface Certification {
  id: string;
  user: PostUser;
  skill: {
    id: string;
    name: string;
    category: string;
  };
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  issued_at: string;
  expires_at?: string;
  verification_url: string;
  certificate_number: string;
  verified_by?: PostUser;
  evidence: CertificationEvidence[];
}

// AI Types
export interface CareerAssessmentRequest {
  user_profile: {
    education_level: 'high_school' | 'undergraduate' | 'graduate' | 'postgraduate';
    major?: string;
    interests: string[];
    experience_years: number;
    current_skills: string[];
    career_goals?: string;
  };
  analysis_depth?: 'quick' | 'standard' | 'comprehensive';
  include_salary_insights?: boolean;
  market_region?: string;
}

export interface CareerAssessment {
  assessment_id: string;
  career_paths: Array<{
    title: string;
    match_score: number;
    description: string;
    required_skills: string[];
    skill_gap: string[];
    salary_range?: {
      min: number;
      max: number;
      currency: string;
    };
    time_to_ready: string;
    growth_outlook: 'excellent' | 'good' | 'average' | 'declining';
  }>;
  strengths: string[];
  areas_for_improvement: string[];
  recommended_next_steps: Array<{
    step: string;
    priority: 'high' | 'medium' | 'low';
    estimated_duration: string;
  }>;
  market_insights: {
    trending_skills: string[];
    emerging_technologies: string[];
    demand_forecast: string;
  };
  generated_at: string;
}

// ==================== API Client Class ====================

class EvolvAPIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Build query string from params object with proper type safety
   */
  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    return searchParams.toString();
  }

  /**
   * Get authentication token from Supabase
   */
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Make HTTP request with authentication
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getAuthToken();
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      logger.error('API request failed', error);
      throw error;
    }
  }

  // ==================== USER GROWTH ENDPOINTS ====================

  /**
   * Get user achievements
   */
  async getUserAchievements(
    userId: string,
    params?: {
      category?: string;
      rarity?: string;
      earned?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<{
    achievements: Achievement[];
    stats: {
      total_earned: number;
      total_points: number;
      rarity_breakdown: Record<string, number>;
    };
    pagination: Pagination;
  }>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/users/${userId}/achievements${query ? `?${query}` : ''}`);
  }

  /**
   * Award achievement to user (admin only)
   */
  async awardAchievement(
    userId: string,
    data: {
      achievement_id: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<ApiResponse<Achievement>> {
    return this.request(`/users/${userId}/achievements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get user level and XP
   */
  async getUserLevel(userId: string): Promise<ApiResponse<UserLevel>> {
    return this.request(`/users/${userId}/level`);
  }

  /**
   * Add experience points
   */
  async addExperiencePoints(
    userId: string,
    data: {
      amount: number;
      source: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<ApiResponse<{
    xp_added: number;
    total_xp: number;
    current_level: number;
    level_up: boolean;
    new_level?: number;
    rewards: Array<{
      type: string;
      id: string;
      name: string;
    }>;
  }>> {
    return this.request(`/users/${userId}/xp`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(params: {
    type: 'weekly' | 'monthly' | 'all-time';
    metric?: 'xp' | 'skills' | 'achievements' | 'certifications';
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    leaderboard: LeaderboardEntry[];
    user_rank: {
      rank: number;
      score: number;
      percentile: number;
    };
    metadata: {
      period_start: string;
      period_end: string;
      total_participants: number;
    };
    pagination: Pagination;
  }>> {
    const query = this.buildQueryString(params);
    return this.request(`/leaderboard?${query}`);
  }

  // ==================== SOCIAL ENDPOINTS ====================

  /**
   * Get personalized feed
   */
  async getFeed(params?: {
    filter?: 'all' | 'following' | 'guilds' | 'trending';
    content_type?: string;
    page?: number;
    limit?: number;
    since?: string;
  }): Promise<ApiResponse<{
    feed: Post[];
    pagination: Pagination;
    has_new: boolean;
  }>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/feed${query ? `?${query}` : ''}`);
  }

  /**
   * Create a new post
   */
  async createPost(data: {
    content: string;
    attachments?: Array<{
      type: 'image' | 'video' | 'link' | 'file';
      url: string;
    }>;
    visibility?: 'public' | 'followers' | 'private';
    tags?: string[];
  }): Promise<ApiResponse<Post>> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get post comments
   */
  async getPostComments(
    postId: string,
    params?: {
      sort?: 'newest' | 'oldest' | 'popular';
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<{
    comments: Comment[];
    total_count: number;
    pagination: Pagination;
  }>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/posts/${postId}/comments${query ? `?${query}` : ''}`);
  }

  /**
   * Add comment to post
   */
  async addComment(
    postId: string,
    data: {
      content: string;
      parent_comment_id?: string;
    }
  ): Promise<ApiResponse<Comment>> {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Toggle like on post
   */
  async togglePostLike(postId: string): Promise<ApiResponse<{
    liked: boolean;
    likes_count: number;
  }>> {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  /**
   * Get user followers
   */
  async getUserFollowers(
    userId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<{
    followers: PostUser[];
    total_count: number;
    pagination: Pagination;
  }>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/users/${userId}/followers${query ? `?${query}` : ''}`);
  }

  /**
   * Get users being followed
   */
  async getUserFollowing(
    userId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<{
    following: PostUser[];
    total_count: number;
    pagination: Pagination;
  }>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/users/${userId}/following${query ? `?${query}` : ''}`);
  }

  /**
   * Toggle follow user
   */
  async toggleFollowUser(userId: string): Promise<ApiResponse<{
    following: boolean;
    followers_count: number;
  }>> {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  // ==================== LEARNING PATHS ENDPOINTS ====================

  /**
   * Get recommended learning paths
   */
  async getLearningPaths(params?: {
    skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category?: string;
    duration?: number;
    status?: 'available' | 'enrolled' | 'completed';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    paths: LearningPath[];
    recommendations: Array<{
      path_id: string;
      relevance_score: number;
      reason: string;
    }>;
    pagination: Pagination;
  }>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/learning-paths${query ? `?${query}` : ''}`);
  }

  /**
   * Get learning path details
   */
  async getLearningPathDetails(pathId: string): Promise<ApiResponse<LearningPath & {
    steps: Array<{
      id: string;
      order: number;
      title: string;
      description: string;
      estimated_duration: number;
      content_type: string;
      resources: Array<{ title: string; url: string; type: string }>;
    }>;
  }>> {
    return this.request(`/learning-paths/${pathId}`);
  }

  /**
   * Enroll in learning path
   */
  async enrollInLearningPath(
    pathId: string,
    data?: {
      start_date?: string;
      goals?: string[];
      notifications_enabled?: boolean;
    }
  ): Promise<ApiResponse<{
    enrollment_id: string;
    path_id: string;
    enrolled_at: string;
    estimated_completion: string;
  }>> {
    return this.request(`/learning-paths/${pathId}/enroll`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  /**
   * Get learning path progress
   */
  async getLearningPathProgress(pathId: string): Promise<ApiResponse<LearningPathProgress>> {
    return this.request(`/learning-paths/${pathId}/progress`);
  }

  /**
   * Update learning path progress
   */
  async updateLearningPathProgress(
    pathId: string,
    data: {
      step_id: string;
      status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
      completion_percentage?: number;
      time_spent?: number;
      notes?: string;
    }
  ): Promise<ApiResponse<LearningPathProgress>> {
    return this.request(`/learning-paths/${pathId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== CERTIFICATION ENDPOINTS ====================

  /**
   * Request skill certification
   */
  async requestSkillCertification(
    skillId: string,
    data: {
      evidence_type: 'assessment' | 'project' | 'portfolio' | 'peer_review' | 'external_certificate';
      evidence_urls?: string[];
      assessment_id?: string;
      description?: string;
      requested_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }
  ): Promise<ApiResponse<{
    certification_request_id: string;
    status: string;
    estimated_review_time: string;
  }>> {
    return this.request(`/skills/${skillId}/certify`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get certification details
   */
  async getCertificationDetails(
    certificationId: string,
    includeVerification: boolean = false
  ): Promise<ApiResponse<Certification>> {
    const query = includeVerification ? '?include_verification=true' : '';
    return this.request(`/certifications/${certificationId}${query}`);
  }

  /**
   * Get user certifications
   */
  async getUserCertifications(
    userId: string,
    params?: {
      status?: 'pending' | 'approved' | 'rejected' | 'expired';
      skill_category?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<{
    certifications: Certification[];
    stats: {
      total_certifications: number;
      by_status: {
        approved: number;
        pending: number;
        expired: number;
      };
    };
    pagination: Pagination;
  }>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/users/${userId}/certifications${query ? `?${query}` : ''}`);
  }

  // ==================== AI INTEGRATION ENDPOINTS ====================

  /**
   * Get AI career assessment
   */
  async getCareerAssessment(
    data: CareerAssessmentRequest
  ): Promise<ApiResponse<CareerAssessment>> {
    return this.request('/ai/career-assessment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get AI skill recommendations
   */
  async getSkillRecommendations(data: {
    current_skills: Array<{
      skill_name: string;
      level: number;
    }>;
    target_role?: string;
    time_commitment?: string;
    learning_style?: 'visual' | 'reading' | 'hands-on' | 'mixed';
    constraints?: {
      avoid_categories?: string[];
      budget?: 'free' | 'low' | 'medium' | 'unlimited';
    };
  }): Promise<ApiResponse<{
    recommendations: Array<{
      skill_id: string;
      skill_name: string;
      relevance_score: number;
      priority: 'critical' | 'high' | 'medium' | 'low';
      reason: string;
      estimated_learning_time: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      prerequisites: string[];
      resources: Array<{
        title: string;
        type: string;
        url: string;
        cost: string;
      }>;
    }>;
    learning_roadmap: Array<{
      phase: number;
      skills: string[];
      duration: string;
    }>;
    confidence_score: number;
  }>> {
    return this.request('/ai/skill-recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Generate AI learning path
   */
  async generateLearningPath(data: {
    goal: string;
    current_level: 'absolute_beginner' | 'beginner' | 'intermediate' | 'advanced';
    current_skills?: string[];
    time_constraint?: {
      duration_months: number;
      hours_per_week: number;
    };
    learning_preferences?: {
      style: 'visual' | 'reading' | 'hands-on' | 'mixed';
      pace: 'relaxed' | 'moderate' | 'intensive';
      prefer_free_resources: boolean;
    };
    focus_areas?: string[];
  }): Promise<ApiResponse<LearningPath>> {
    return this.request('/ai/learning-path-generator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== SKILL ENDPOINTS ====================

  /**
   * Get available skills
   */
  async getSkills(params?: {
    category?: string;
    difficulty?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    skills: Array<{
      id: string;
      name: string;
      category: string;
      difficulty: number;
      description?: string;
    }>;
    categories: string[];
    pagination: Pagination;
  }>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/skills${query ? `?${query}` : ''}`);
  }

  /**
   * Get user skills
   */
  async getUserSkills(
    userId: string,
    verifiedOnly: boolean = false
  ): Promise<ApiResponse<{
    skills: Array<{
      skill_id: string;
      skill_name: string;
      level: number;
      verified: boolean;
    }>;
    skill_graph: {
      nodes: Array<{ id: string; x: number; y: number }>;
      edges: Array<{ from: string; to: string }>;
    };
    stats: {
      total_skills: number;
      verified_skills: number;
      average_level: number;
    };
  }>> {
    const query = verifiedOnly ? '?verified_only=true' : '';
    return this.request(`/users/${userId}/skills${query}`);
  }
}

// ==================== Export Singleton Instance ====================

export const apiClient = new EvolvAPIClient();

// ==================== React Hooks (Optional) ====================

/**
 * Example React hooks for common API operations
 */
import { useState, useEffect } from 'react';

export function useUserLevel(userId: string) {
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLevel() {
      try {
        setLoading(true);
        const response = await apiClient.getUserLevel(userId);
        if (response.success && response.data) {
          setLevel(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchLevel();
    }
  }, [userId]);

  return { level, loading, error };
}

export function useLeaderboard(
  type: 'weekly' | 'monthly' | 'all-time',
  metric: 'xp' | 'skills' | 'achievements' | 'certifications' = 'xp'
) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; score: number; percentile: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const response = await apiClient.getLeaderboard({ type, metric });
        if (response.success && response.data) {
          setLeaderboard(response.data.leaderboard);
          setUserRank(response.data.user_rank);
        }
      } catch (err) {
        logger.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [type, metric]);

  return { leaderboard, userRank, loading };
}

export function useFeed(filter: 'all' | 'following' | 'guilds' | 'trending' = 'all') {
  const [feed, setFeed] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = async () => {
    try {
      const response = await apiClient.getFeed({ filter, page: page + 1 });
      if (response.success && response.data) {
        setFeed((prev) => [...prev, ...response.data.feed]);
        setHasMore(response.data.pagination.has_next);
        setPage(page + 1);
      }
    } catch (err) {
      logger.error('Failed to load more feed items', err);
    }
  };

  useEffect(() => {
    async function fetchFeed() {
      try {
        setLoading(true);
        const response = await apiClient.getFeed({ filter, page: 1 });
        if (response.success && response.data) {
          setFeed(response.data.feed);
          setHasMore(response.data.pagination.has_next);
        }
      } catch (err) {
        logger.error('Failed to fetch feed', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, [filter]);

  return { feed, loading, hasMore, loadMore };
}
