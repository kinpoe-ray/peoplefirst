import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BadgeService } from '@/services/badgeService';

export function useBadgeChecker() {
  const { user } = useAuth();

  useEffect(() => {
    // 初始化徽章库
    BadgeService.initializeBadgeLibrary();
  }, []);

  useEffect(() => {
    // 当用户登录时检查徽章
    if (user) {
      BadgeService.checkAndAwardBadges(user.id);
    }
  }, [user]);

  // 手动触发徽章检查
  const checkBadges = async () => {
    if (user) {
      return await BadgeService.checkAndAwardBadges(user.id);
    }
    return [];
  };

  return { checkBadges };
}