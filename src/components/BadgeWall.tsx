import React, { useState, useEffect } from 'react';
import { Badge, UserBadge, BadgeRarity, BadgeCategory } from '@/types';
import { BadgeService } from '@/services/badgeService';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Star, Award, Crown, Target, Users, BookOpen, TrendingUp, Lock, CheckCircle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 稀有度配置
const RARITY_CONFIG = {
  common: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: Star,
    label: '普通',
    count: 0
  },
  rare: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: Trophy,
    label: '稀有',
    count: 0
  },
  epic: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    icon: Award,
    label: '史诗',
    count: 0
  },
  legendary: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: Crown,
    label: '传奇',
    count: 0
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

interface BadgeWallProps {
  userId?: string;
}

export default function BadgeWall({ userId }: BadgeWallProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<BadgeRarity | 'all'>('all');
  const [stats, setStats] = useState({
    totalBadges: 0,
    earnedBadges: 0,
    completionRate: 0
  });

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadBadgeWall();
    }
  }, [targetUserId]);

  const loadBadgeWall = async () => {
    setLoading(true);
    try {
      const { badges: allBadges, userBadges: earnedBadgeIds } = await BadgeService.getBadgeWall(targetUserId);
      setBadges(allBadges);
      setUserBadges(earnedBadgeIds);

      // 计算统计信息
      setStats({
        totalBadges: allBadges.length,
        earnedBadges: earnedBadgeIds.length,
        completionRate: allBadges.length > 0 ? Math.round((earnedBadgeIds.length / allBadges.length) * 100) : 0
      });
    } catch (error) {
      console.error('加载徽章墙失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityConfig = (rarity: BadgeRarity) => RARITY_CONFIG[rarity];
  const getCategoryConfig = (category: BadgeCategory) => CATEGORY_CONFIG[category];

  const filteredBadges = badges.filter(badge => {
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity;
    return matchesCategory && matchesRarity;
  });

  const isBadgeEarned = (badgeId: string) => userBadges.includes(badgeId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/badges')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="返回我的徽章"
              >
                ← 返回
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  徽章墙
                </h1>
                <p className="text-gray-600 mt-2">
                  展示平台所有徽章，您已获得 {stats.earnedBadges}/{stats.totalBadges} 个
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
                <div className="text-sm text-gray-600">完成度</div>
              </div>
            </div>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.entries(RARITY_CONFIG).map(([rarity, config]) => {
            const count = badges.filter(b => b.rarity === rarity).length;
            const earned = badges.filter(b => b.rarity === rarity && isBadgeEarned(b.id)).length;
            const IconComponent = config.icon;
            
            return (
              <div key={rarity} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{config.label}</p>
                    <p className="text-xl font-bold text-gray-900">{earned}/{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              筛选徽章
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
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
          </div>
        </div>

        {/* 徽章网格 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              徽章集合 ({filteredBadges.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBadges.map((badge) => {
                const rarityConfig = getRarityConfig(badge.rarity);
                const categoryConfig = getCategoryConfig(badge.category);
                const IconComponent = rarityConfig.icon;
                const isEarned = isBadgeEarned(badge.id);
                
                return (
                  <div
                    key={badge.id}
                    className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                      isEarned
                        ? `${rarityConfig.borderColor} ${rarityConfig.bgColor}`
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {/* 获得状态标识 */}
                    {!isEarned && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    
                    {isEarned && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}

                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        {badge.icon_url ? (
                          <img
                            src={badge.icon_url}
                            alt={badge.name}
                            className="w-12 h-12"
                          />
                        ) : (
                          <div className={`p-3 rounded-full ${rarityConfig.bgColor}`}>
                            <IconComponent className={`w-8 h-8 ${rarityConfig.color}`} />
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <h3 className={`font-semibold text-sm mb-1 ${
                          isEarned ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {badge.name}
                        </h3>
                        <p className={`text-xs ${
                          isEarned ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {badge.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isEarned ? rarityConfig.bgColor : 'bg-gray-200'
                        } ${isEarned ? rarityConfig.color : 'text-gray-500'}`}>
                          {rarityConfig.label}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isEarned ? 'bg-gray-100' : 'bg-gray-200'
                        } ${categoryConfig.color}`}>
                          {categoryConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className={isEarned ? 'text-green-600' : 'text-gray-500'}>
                          {isEarned ? `+${badge.points}分` : '未获得'}
                        </span>
                        <span className="text-gray-400">
                          {badge.requirement_type === 'course_complete' && '课程完成'}
                          {badge.requirement_type === 'skill_mastery' && '技能掌握'}
                          {badge.requirement_type === 'streak' && '连续学习'}
                          {badge.requirement_type === 'social' && '社交互动'}
                          {badge.requirement_type === 'milestone' && '里程碑'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredBadges.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无徽章</h3>
                <p className="text-gray-600">调整筛选条件查看其他徽章</p>
              </div>
            )}
          </div>
        </div>

        {/* 成就提示 */}
        {stats.earnedBadges > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🎉 恭喜您！</h3>
                <p className="text-blue-100">
                  您已经获得了 {stats.earnedBadges} 个徽章，完成度达到 {stats.completionRate}%
                </p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-300" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}