import { Badge, UserBadge, BadgeProgress, BadgeStats, BadgeRarity, BadgeCategory } from '@/types';
import { supabase } from '@/lib/supabase';

// 徽章库 - 预定义的徽章配置
export const BADGE_LIBRARY: Omit<Badge, 'id' | 'created_at'>[] = [
  // 初学者徽章
  {
    name: '初来乍到',
    description: '完成个人资料设置',
    icon_url: '/icons/badges/welcome.svg',
    rarity: 'common',
    category: 'milestone',
    requirement_type: 'milestone',
    requirement_value: 1,
    requirement_score: 0,
    points: 10
  },
  {
    name: '学习新手',
    description: '完成第一门课程',
    icon_url: '/icons/badges/beginner-learner.svg',
    rarity: 'common',
    category: 'learning',
    requirement_type: 'course_complete',
    requirement_value: 1,
    requirement_score: 0,
    points: 25
  },
  {
    name: '知识探索者',
    description: '完成3门课程',
    icon_url: '/icons/badges/explorer.svg',
    rarity: 'common',
    category: 'learning',
    requirement_type: 'course_complete',
    requirement_value: 3,
    requirement_score: 0,
    points: 50
  },
  
  // 进阶徽章
  {
    name: '技能学徒',
    description: '掌握一项技能',
    icon_url: '/icons/badges/apprentice.svg',
    rarity: 'rare',
    category: 'skill',
    requirement_type: 'skill_mastery',
    requirement_value: 1,
    requirement_score: 80,
    points: 100
  },
  {
    name: '学习达人',
    description: '连续学习7天',
    icon_url: '/icons/badges/streak.svg',
    rarity: 'rare',
    category: 'achievement',
    requirement_type: 'streak',
    requirement_value: 7,
    requirement_score: 0,
    points: 150
  },
  {
    name: '知识分享者',
    description: '发布5篇学习心得',
    icon_url: '/icons/badges/sharer.svg',
    rarity: 'rare',
    category: 'social',
    requirement_type: 'social',
    requirement_value: 5,
    requirement_score: 0,
    points: 120
  },
  {
    name: '课程专家',
    description: '完成10门课程',
    icon_url: '/icons/badges/course-expert.svg',
    rarity: 'rare',
    category: 'learning',
    requirement_type: 'course_complete',
    requirement_value: 10,
    requirement_score: 0,
    points: 200
  },
  
  // 专家徽章
  {
    name: '技能大师',
    description: '掌握5项核心技能',
    icon_url: '/icons/badges/master.svg',
    rarity: 'epic',
    category: 'skill',
    requirement_type: 'skill_mastery',
    requirement_value: 5,
    requirement_score: 90,
    points: 500
  },
  {
    name: '学习冠军',
    description: '连续学习30天',
    icon_url: '/icons/badges/champion.svg',
    rarity: 'epic',
    category: 'achievement',
    requirement_type: 'streak',
    requirement_value: 30,
    requirement_score: 0,
    points: 800
  },
  {
    name: '社区领袖',
    description: '获得100个点赞',
    icon_url: '/icons/badges/leader.svg',
    rarity: 'epic',
    category: 'social',
    requirement_type: 'social',
    requirement_value: 100,
    requirement_score: 0,
    points: 600
  },
  {
    name: '全能学者',
    description: '在所有技能类别中都有建树',
    icon_url: '/icons/badges/scholar.svg',
    rarity: 'epic',
    category: 'achievement',
    requirement_type: 'milestone',
    requirement_value: 5,
    requirement_score: 0,
    points: 1000
  },
  
  // 传奇徽章
  {
    name: '传奇学习者',
    description: '完成50门课程',
    icon_url: '/icons/badges/legend.svg',
    rarity: 'legendary',
    category: 'learning',
    requirement_type: 'course_complete',
    requirement_value: 50,
    requirement_score: 0,
    points: 2000
  },
  {
    name: '终极导师',
    description: '帮助100位同学进步',
    icon_url: '/icons/badges/mentor.svg',
    rarity: 'legendary',
    category: 'social',
    requirement_type: 'social',
    requirement_value: 100,
    requirement_score: 0,
    points: 3000
  },
  {
    name: '知识之神',
    description: '总学习时长超过1000小时',
    icon_url: '/icons/badges/god.svg',
    rarity: 'legendary',
    category: 'achievement',
    requirement_type: 'milestone',
    requirement_value: 1000,
    requirement_score: 0,
    points: 5000
  }
];

export class BadgeService {
  // 初始化徽章库
  static async initializeBadgeLibrary(): Promise<void> {
    try {
      const { data: existingBadges } = await supabase
        .from('badges')
        .select('name');

      const existingNames = existingBadges?.map(b => b.name) || [];
      
      const newBadges = BADGE_LIBRARY.filter(badge => !existingNames.includes(badge.name));
      
      if (newBadges.length > 0) {
        const { error } = await supabase
          .from('badges')
          .insert(newBadges);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error initializing badge library:', error);
    }
  }

  // 获取用户的所有徽章
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  }

  // 获取徽章进度
  static async getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
    try {
      const userBadges = await this.getUserBadges(userId);
      const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
      
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*');

      if (!allBadges) return [];

      const progress: BadgeProgress[] = [];
      
      for (const badge of allBadges) {
        if (earnedBadgeIds.includes(badge.id)) {
          progress.push({
            badge_id: badge.id,
            current_value: badge.requirement_value,
            required_value: badge.requirement_value,
            percentage: 100,
            is_earned: true
          });
        } else {
          // 这里需要根据具体的用户数据计算进度
          // 示例：假设我们有用户课程完成数、技能分数等
          const currentValue = await this.calculateBadgeProgress(userId, badge);
          
          progress.push({
            badge_id: badge.id,
            current_value: currentValue,
            required_value: badge.requirement_value,
            percentage: Math.min((currentValue / badge.requirement_value) * 100, 100),
            is_earned: currentValue >= badge.requirement_value
          });
        }
      }
      
      return progress;
    } catch (error) {
      console.error('Error calculating badge progress:', error);
      return [];
    }
  }

  // 计算徽章进度
  private static async calculateBadgeProgress(userId: string, badge: Badge): Promise<number> {
    try {
      switch (badge.requirement_type) {
        case 'course_complete':
          // 获取用户完成的课程数
          const { count: completedCourses } = await supabase
            .from('user_courses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed');
          return completedCourses || 0;

        case 'skill_mastery':
          // 获取用户掌握的技能数
          const { count: masteredSkills } = await supabase
            .from('user_skills')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('proficiency_score', badge.requirement_score);
          return masteredSkills || 0;

        case 'streak':
          // 这里需要根据用户活动日志计算连续天数
          // 暂时返回0，需要实现具体的连续天数计算逻辑
          return 0;

        case 'social':
          // 获取用户的社交互动数（点赞、评论等）
          const { count: socialInteractions } = await supabase
            .from('social_interactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
          return socialInteractions || 0;

        case 'milestone':
          // 根据不同的里程碑类型返回不同的值
          return 1; // 基础值，需要根据具体里程碑调整

        default:
          return 0;
      }
    } catch (error) {
      console.error('Error calculating badge progress:', error);
      return 0;
    }
  }

  // 检查并奖励徽章
  static async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    try {
      const progress = await this.getBadgeProgress(userId);
      const newBadges: UserBadge[] = [];
      
      for (const prog of progress) {
        if (prog.is_earned) {
          const existingBadge = await this.getUserBadge(userId, prog.badge_id);
          if (!existingBadge) {
            const awardedBadge = await this.awardBadge(userId, prog.badge_id);
            if (awardedBadge) {
              newBadges.push(awardedBadge);
            }
          }
        }
      }
      
      return newBadges;
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      return [];
    }
  }

  // 授予徽章
  static async awardBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({ user_id: userId, badge_id: badgeId })
        .select(`
          *,
          badge:badges(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
  }

  // 检查用户是否已有徽章
  static async getUserBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error checking user badge:', error);
      return null;
    }
  }

  // 获取用户徽章统计
  static async getUserBadgeStats(userId: string): Promise<BadgeStats> {
    try {
      const userBadges = await this.getUserBadges(userId);
      
      const rarityDistribution = {
        common: userBadges.filter(ub => ub.badge.rarity === 'common').length,
        rare: userBadges.filter(ub => ub.badge.rarity === 'rare').length,
        epic: userBadges.filter(ub => ub.badge.rarity === 'epic').length,
        legendary: userBadges.filter(ub => ub.badge.rarity === 'legendary').length,
      };

      const categoryDistribution = {
        learning: userBadges.filter(ub => ub.badge.category === 'learning').length,
        social: userBadges.filter(ub => ub.badge.category === 'social').length,
        achievement: userBadges.filter(ub => ub.badge.category === 'achievement').length,
        skill: userBadges.filter(ub => ub.badge.category === 'skill').length,
        milestone: userBadges.filter(ub => ub.badge.category === 'milestone').length,
      };

      const totalPoints = userBadges.reduce((sum, ub) => sum + ub.badge.points, 0);

      return {
        total_badges: userBadges.length,
        earned_badges: userBadges.length,
        total_points: totalPoints,
        rarity_distribution: rarityDistribution,
        category_distribution: categoryDistribution,
      };
    } catch (error) {
      console.error('Error calculating badge stats:', error);
      return {
        total_badges: 0,
        earned_badges: 0,
        total_points: 0,
        rarity_distribution: { common: 0, rare: 0, epic: 0, legendary: 0 },
        category_distribution: { learning: 0, social: 0, achievement: 0, skill: 0, milestone: 0 },
      };
    }
  }

  // 获取所有徽章（用于徽章墙）
  static async getAllBadges(): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('rarity', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all badges:', error);
      return [];
    }
  }

  // 获取徽章墙数据（包含用户获得情况）
  static async getBadgeWall(userId?: string): Promise<{ badges: Badge[], userBadges: string[] }> {
    try {
      const badges = await this.getAllBadges();
      let userBadges: string[] = [];
      
      if (userId) {
        const userBadgeData = await this.getUserBadges(userId);
        userBadges = userBadgeData.map(ub => ub.badge_id);
      }
      
      return { badges, userBadges };
    } catch (error) {
      console.error('Error fetching badge wall:', error);
      return { badges: [], userBadges: [] };
    }
  }
}