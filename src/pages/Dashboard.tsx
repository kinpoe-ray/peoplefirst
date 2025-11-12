import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BadgeService } from '../services/badgeService';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useCache, useResourcePreloader } from '../hooks/usePerformance';
import { Brain, Trophy, Users, BookOpen, TrendingUp, Award, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MobileStatCard, MobileButtonGroup, MobileGrid, MobileCard } from '../components/MobileOptimized';
import DemoPanel from '../components/DemoPanel';
import GuestConversionBanner from '../components/GuestConversionBanner';

export default function Dashboard() {
  const { profile } = useAuth();
  const { handleError, handleSuccess } = useErrorHandler();
  const { preloadResource } = useResourcePreloader();
  const [stats, setStats] = useState({
    totalSkills: 0,
    verifiedSkills: 0,
    badges: 0,
    courses: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 使用缓存优化数据加载
  const { data: dashboardData, refetch: refetchDashboard } = useCache(
    `dashboard-${profile?.id}`,
    async () => {
      if (!profile) return null;

      // 游客模式下返回模拟数据
      if (profile.user_type === 'guest') {
        return {
          skills: [
            { id: '1', name: 'JavaScript', level: 2, score: 75, verified: true },
            { id: '2', name: 'React', level: 1, score: 60, verified: false },
            { id: '3', name: 'Python', level: 1, score: 45, verified: false },
          ],
          badges: [
            { id: 'badge1', name: '初来乍到', description: '完成首次登录' },
            { id: 'badge2', name: '勇敢尝试', description: '完成第一次技能测评' },
          ],
          courses: [
            { id: 'course1', title: 'JavaScript基础入门', progress: 60 },
            { id: 'course2', title: 'React开发实战', progress: 30 },
          ],
          verifiedSkillsCount: 1
        };
      }

      // 正式用户从数据库查询
      const [skillsData, badgesData, coursesData] = await Promise.all([
        supabase.from('user_skills').select('*', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('user_badges').select('*', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('user_courses').select('*', { count: 'exact' }).eq('user_id', profile.id),
      ]);

      const verifiedSkillsCount = skillsData.data?.filter(s => s.verified).length || 0;

      return {
        skills: skillsData.data || [],
        badges: badgesData.data || [],
        courses: coursesData.data || [],
        verifiedSkillsCount
      };
    },
    [profile?.id, profile?.user_type]
  );

  useEffect(() => {
    if (dashboardData) {
      setStats({
        totalSkills: dashboardData.skills.length,
        verifiedSkills: dashboardData.verifiedSkillsCount,
        badges: dashboardData.badges.length,
        courses: dashboardData.courses.length,
      });
      setLoading(false);
    }
  }, [dashboardData]);

  useEffect(() => {
    // 初始化徽章系统
    const initializeBadgeSystem = async () => {
      try {
        await BadgeService.initializeBadgeLibrary();
        if (profile) {
          await BadgeService.checkAndAwardBadges(profile.id);
        }
      } catch (error) {
        handleError(error, '初始化徽章系统');
      }
    };

    initializeBadgeSystem();
  }, [profile]);

  // 预加载重要资源
  useEffect(() => {
    const resources = [
      { type: 'image', src: '/icons/skill-graph.svg' },
      { type: 'image', src: '/icons/assessment.svg' },
    ];
    
    resources.forEach(preloadResource);
  }, [preloadResource]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchDashboard();
      handleSuccess('仪表板数据已刷新', '刷新成功');
    } catch (error) {
      handleError(error, '刷新仪表板数据');
    } finally {
      setRefreshing(false);
    }
  };

  const quickActions = [
    {
      title: 'AI职业导师',
      description: '获取个性化的职业建议和技能发展路径',
      icon: Brain,
      link: '/ai-advisor',
      color: 'bg-blue-500',
    },
    {
      title: '技能健身房',
      description: '参加技能测评，获得认证徽章',
      icon: Trophy,
      link: '/skill-gym',
      color: 'bg-purple-500',
    },
    {
      title: '技能社交',
      description: '加入技能公会，与同道者交流',
      icon: Users,
      link: '/social',
      color: 'bg-green-500',
    },
    {
      title: '课程管理',
      description: '导入课程成绩，生成学术技能图谱',
      icon: BookOpen,
      link: '/courses',
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8">
      <GuestConversionBanner />
      
      <MobileCard className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">欢迎回来，{profile?.full_name}</h1>
            <p className="text-blue-100 text-sm sm:text-base">
              {profile?.user_type === 'student' && '继续你的技能成长之旅'}
              {profile?.user_type === 'teacher' && '欢迎来到教师共创平台'}
              {profile?.user_type === 'alumni' && '分享你的职场经验，帮助学弟学妹'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors disabled:opacity-50 self-start min-h-[44px] min-w-[44px] justify-center"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">刷新</span>
          </button>
        </div>
      </MobileCard>

      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 px-2">数据概览</h2>
        <MobileGrid cols={2} gap={4}>
          <MobileStatCard
            title="掌握技能"
            value={stats.totalSkills}
            icon={<TrendingUp className="h-6 w-6" />}
            color="blue"
          />
          <MobileStatCard
            title="已验证技能"
            value={stats.verifiedSkills}
            icon={<Award className="h-6 w-6" />}
            color="green"
          />
          <MobileStatCard
            title="获得徽章"
            value={stats.badges}
            icon={<Trophy className="h-6 w-6" />}
            color="purple"
          />
          <MobileStatCard
            title="已修课程"
            value={stats.courses}
            icon={<BookOpen className="h-6 w-6" />}
            color="orange"
          />
        </MobileGrid>
      </div>

      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 px-2">快速开始</h2>
        <MobileGrid cols={1} gap={4}>
          {quickActions.map((action) => (
            <Link
              key={action.link}
              to={action.link}
              className="block"
            >
              <MobileCard className="hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`${action.color} p-3 rounded-lg shrink-0`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                  </div>
                </div>
              </MobileCard>
            </Link>
          ))}
        </MobileGrid>
      </div>

      {/* 演示面板 - 仅在无数据时显示 */}
      {stats.totalSkills === 0 && stats.badges === 0 && stats.courses === 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 px-2">开始体验</h2>
          <div className="max-w-2xl mx-auto">
            <DemoPanel />
          </div>
        </div>
      )}
    </div>
  );
}
