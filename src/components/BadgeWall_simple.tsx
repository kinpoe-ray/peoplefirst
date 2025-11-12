import { useState, useEffect } from 'react';
import { Badge, UserBadge, BadgeProgress, BadgeStats, BadgeRarity, BadgeCategory } from '@/types';
import { BadgeService } from '@/services/badgeService';
import { useAuth } from '@/hooks/useAuth';
import { BadgeIcon, Trophy, Star, Award, Crown, Target, Users, BookOpen, TrendingUp } from 'lucide-react';

interface BadgeWallProps {
  userId?: string;
}

export default function BadgeWall({ userId }: BadgeWallProps) {
  const { user } = useAuth();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            徽章墙
          </h1>
          <p className="text-gray-600 mt-2">
            您已获得 {stats.earnedBadges}/{stats.totalBadges} 个徽章，完成度 {stats.completionRate}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badges.map((badge) => {
              const isEarned = isBadgeEarned(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isEarned ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      {badge.icon_url ? (
                        <img src={badge.icon_url} alt={badge.name} className="w-12 h-12" />
                      ) : (
                        <Trophy className="w-12 h-12 text-blue-600" />
                      )}
                    </div>
                    
                    <h3 className={`font-semibold text-sm mb-1 ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                      {badge.name}
                    </h3>
                    <p className={`text-xs ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                      {badge.description}
                    </p>

                    <div className="mt-3 text-xs">
                      <span className={`px-2 py-1 rounded-full ${isEarned ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {isEarned ? `+${badge.points}分` : '未获得'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}