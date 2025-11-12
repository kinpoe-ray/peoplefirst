import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BadgeSystem from '@/components/BadgeSystem';
import { BadgeService } from '@/services/badgeService';
import { useAuth } from '@/hooks/useAuth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { BadgeIcon, Trophy, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';

export default function Badges() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();

  useEffect(() => {
    // 初始化徽章库
    const initializeBadges = async () => {
      try {
        await BadgeService.initializeBadgeLibrary();
        handleSuccess('徽章系统初始化完成', '系统就绪');
      } catch (error) {
        handleError(error, '初始化徽章系统');
      }
    };

    initializeBadges();
  }, []);

  // 检查用户徽章状态
  useEffect(() => {
    if (user) {
      const checkBadges = async () => {
        try {
          await BadgeService.checkAndAwardBadges(user.id);
        } catch (error) {
          handleError(error, '检查徽章状态');
        }
      };
      checkBadges();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg border w-full max-w-md">
          <div className="p-6 text-center">
            <BadgeIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">需要登录</h2>
            <p className="text-gray-600 mb-6">
              请先登录以查看您的徽章和成就
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                登录
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                注册
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BadgeIcon className="w-8 h-8 text-blue-600" />
                我的徽章
              </h1>
              <p className="text-gray-600 mt-2">
                查看您的学习成就和进度追踪
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/badge-wall')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Trophy className="w-4 h-4" />
                徽章墙
              </button>
            </div>
          </div>
        </div>

        {/* 徽章系统组件 */}
        <BadgeSystem showProgress={true} />
      </div>
    </div>
  );
}