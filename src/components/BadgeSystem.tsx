import React, { useState, useEffect } from 'react';
import { Badge, UserBadge, BadgeProgress, BadgeStats, BadgeRarity, BadgeCategory } from '@/types';
import { BadgeService } from '@/services/badgeService';
import { useAuth } from '@/hooks/useAuth';
import { BadgeIcon, Trophy, Star, Award, Crown, Target, Users, BookOpen, TrendingUp } from 'lucide-react';

interface BadgeSystemProps {
  userId?: string;
  showProgress?: boolean;
  compact?: boolean;
}

// 稀有度配置
const RARITY_CONFIG = {
  common: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: Star,
    label: '普通'
  },
  rare: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: Trophy,
    label: '稀有'
  },
  epic: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    icon: Award,
    label: '史诗'
  },
  legendary: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: Crown,
    label: '传奇'
  }
};

// 类别配置
const CATEGORY_CONFIG = {
  learning: {
    icon: BookOpen,
    label: '学习',
    color: 'text-green-600'
  },
  social: {
    icon: Users,
    label: '社交',
    color: 'text-blue-600'
  },
  achievement: {
    icon: Target,
    label: '成就',
    color: 'text-purple-600'
  },
  skill: {
    icon: TrendingUp,
    label: '技能',
    color: 'text-orange-600'
  },
  milestone: {
    icon: Trophy,
    label: '里程碑',
    color: 'text-red-600'
  }
};

export default function BadgeSystem({ userId, showProgress = true, compact = false }: BadgeSystemProps) {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [badgeStats, setBadgeStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<BadgeRarity | 'all'>('all');

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadBadgeData();
    }
  }, [targetUserId]);

  const loadBadgeData = async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    try {
      const [badges, progress, stats] = await Promise.all([
        BadgeService.getUserBadges(targetUserId),
        BadgeService.getBadgeProgress(targetUserId),
        BadgeService.getUserBadgeStats(targetUserId)
      ]);
      
      setUserBadges(badges);
      setBadgeProgress(progress);
      setBadgeStats(stats);
    } catch (error) {
      console.error('Error loading badge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityConfig = (rarity: BadgeRarity) => RARITY_CONFIG[rarity];
  const getCategoryConfig = (category: BadgeCategory) => CATEGORY_CONFIG[category];

  const filteredBadges = userBadges.filter(ub => {
    const matchesCategory = selectedCategory === 'all' || ub.badge.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || ub.badge.rarity === selectedRarity;
    return matchesCategory && matchesRarity;
  });

  const getProgressForBadge = (badgeId: string) => {
    return badgeProgress.find(p => p.badge_id === badgeId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBadges.slice(0, 12).map((userBadge) => {
          const rarityConfig = getRarityConfig(userBadge.badge.rarity);
          const CategoryIcon = getCategoryConfig(userBadge.badge.category).icon;
          const IconComponent = rarityConfig.icon;
          
          return (
            <div
              key={userBadge.id}
              className={`relative p-3 rounded-lg border-2 ${rarityConfig.borderColor} ${rarityConfig.bgColor} group hover:scale-105 transition-transform cursor-pointer`}
              title={`${userBadge.badge.name} - ${userBadge.badge.description}`}
            >
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {userBadge.badge.icon_url ? (
                    <img 
                      src={userBadge.badge.icon_url} 
                      alt={userBadge.badge.name}
                      className="w-8 h-8"
                    />
                  ) : (
                    <IconComponent className={`w-8 h-8 ${rarityConfig.color}`} />
                  )}
                </div>
                <p className={`text-xs font-medium ${rarityConfig.color} truncate`}>
                  {userBadge.badge.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  +{userBadge.badge.points}分
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 徽章统计 */}
      {badgeStats && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BadgeIcon className="w-5 h-5" />
              徽章统计
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {badgeStats.earned_badges}
                </div>
                <div className="text-sm text-gray-600">已获得徽章</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {badgeStats.total_points}
                </div>
                <div className="text-sm text-gray-600">总积分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {badgeStats.rarity_distribution.epic + badgeStats.rarity_distribution.legendary}
                </div>
                <div className="text-sm text-gray-600">高级徽章</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {badgeStats.category_distribution.learning}
                </div>
                <div className="text-sm text-gray-600">学习徽章</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">徽章收藏</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                类别筛选
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  全部
                </button>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key as BadgeCategory)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        selectedCategory === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <IconComponent className="w-3 h-3" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                稀有度筛选
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRarity('all')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedRarity === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  全部
                </button>
                {Object.entries(RARITY_CONFIG).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedRarity(key as BadgeRarity)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        selectedRarity === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <IconComponent className="w-3 h-3" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 徽章网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((userBadge) => {
              const rarityConfig = getRarityConfig(userBadge.badge.rarity);
              const categoryConfig = getCategoryConfig(userBadge.badge.category);
              const IconComponent = rarityConfig.icon;
              const progress = getProgressForBadge(userBadge.badge.id);

              return (
                <div key={userBadge.id} className={`bg-white rounded-lg border-2 p-4 ${rarityConfig.borderColor}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${rarityConfig.bgColor}`}>
                      {userBadge.badge.icon_url ? (
                        <img 
                          src={userBadge.badge.icon_url} 
                          alt={userBadge.badge.name}
                          className="w-8 h-8"
                        />
                      ) : (
                        <IconComponent className={`w-8 h-8 ${rarityConfig.color}`} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {userBadge.badge.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${rarityConfig.bgColor} ${rarityConfig.color}`}>
                          {rarityConfig.label}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${categoryConfig.color}`}>
                          {categoryConfig.label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {userBadge.badge.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>获得时间: {new Date(userBadge.earned_at).toLocaleDateString()}</span>
                        <span className="font-medium text-green-600">
                          +{userBadge.badge.points}分
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-8">
              <BadgeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无徽章</p>
            </div>
          )}
        </div>
      </div>

      {/* 进度追踪 */}
      {showProgress && badgeProgress.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              徽章进度
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badgeProgress
                .filter(p => !p.is_earned)
                .slice(0, 6)
                .map((progress) => {
                  const badge = userBadges.find(ub => ub.badge_id === progress.badge_id)?.badge;
                  if (!badge) return null;

                  const rarityConfig = getRarityConfig(badge.rarity);
                  const categoryConfig = getCategoryConfig(badge.category);
                  const IconComponent = rarityConfig.icon;

                  return (
                    <div key={progress.badge_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <IconComponent className={`w-6 h-6 ${rarityConfig.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{badge.name}</h4>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            进度: {progress.current_value}/{progress.required_value}
                          </span>
                          <span className="font-medium">
                            {Math.round(progress.percentage)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}