import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Target, MessageSquare, ArrowRight, TrendingUp, Users, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { supabase } from '../lib/supabase';
import { DashboardStats } from '../types/pathfinder';

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    total_contents: 0,
    total_tasks: 0,
    total_stories: 0,
    active_users: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [contents, tasks, stories, users] = await Promise.all([
        supabase.from('contents').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }),
        supabase.from('stories').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        total_contents: contents.count || 0,
        total_tasks: tasks.count || 0,
        total_stories: stories.count || 0,
        active_users: users.count || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-pathBlue/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pathBlue/10 border border-pathBlue/20 rounded-full text-sm text-pathBlue mb-4">
              <Sparkles className="w-4 h-4" />
              <span>为18-30岁职场迷茫者设计</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-medium tracking-tight">
              先<span className="text-pathBlue">试试</span>，再决定
            </h1>

            <p className="text-xl md:text-2xl text-dark-text-secondary max-w-2xl mx-auto">
              少一些规划，多一些尝试。通过真实职业内容、实操任务和故事分享，帮你找到真正适合的方向。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                to="/contents"
                className="group px-8 py-4 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                开始探索
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/stories"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-all duration-200 border border-white/10"
              >
                看看他们的故事
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <StatCard icon={<BookOpen className="w-6 h-6" />} value={stats.total_contents} label="职业内容" />
            <StatCard icon={<Target className="w-6 h-6" />} value={stats.total_tasks} label="实操任务" />
            <StatCard icon={<MessageSquare className="w-6 h-6" />} value={stats.total_stories} label="真实故事" />
            <StatCard icon={<Users className="w-6 h-6" />} value={stats.active_users} label="探索者" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium mb-4">三大探索模块</h2>
          <p className="text-dark-text-secondary">从了解到尝试，从失败到发现</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="职业去魅化内容库"
            description="真实的一天、高光时刻与崩溃瞬间，用能力雷达图看清职业真相"
            color="pathBlue"
            link="/contents"
            stats={`${stats.total_contents} 个职业`}
          />

          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="技能试验场"
            description="30-60分钟实操任务，AI实时评估，在尝试中发现自己的天赋"
            color="warmOrange"
            link="/tasks"
            stats={`${stats.total_tasks} 个任务`}
          />

          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="迷茫者故事墙"
            description="分享你的尝试、失败和发现，在真实经历中找到共鸣和方向"
            color="successGreen"
            link="/stories"
            stats={`${stats.total_stories} 个故事`}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-pathBlue/20 via-warmOrange/10 to-transparent border border-pathBlue/20 rounded-2xl p-12 md:p-16 text-center">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-medium">
              准备好开始尝试了吗？
            </h2>
            <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
              不用完美的计划，只需要一点勇气。选择一个你感兴趣的方向，试试看。
            </p>
            <div className="pt-4">
              <Link
                to="/contents"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-dark-bg hover:bg-gray-100 rounded-lg font-medium transition-all duration-200"
              >
                立即开始
                <TrendingUp className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center space-y-2">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-lg text-pathBlue">
        {icon}
      </div>
      <div className="text-3xl font-semibold text-white">{value}+</div>
      <div className="text-sm text-dark-text-tertiary">{label}</div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  link: string;
  stats: string;
}

function FeatureCard({ icon, title, description, color, link, stats }: FeatureCardProps) {
  const colorClasses = {
    pathBlue: 'from-pathBlue/20 to-pathBlue/5 border-pathBlue/20 text-pathBlue',
    warmOrange: 'from-warmOrange/20 to-warmOrange/5 border-warmOrange/20 text-warmOrange',
    successGreen: 'from-successGreen/20 to-successGreen/5 border-successGreen/20 text-successGreen',
  }[color];

  return (
    <Link
      to={link}
      className="group relative overflow-hidden bg-dark-surface hover:bg-dark-surface/80 border border-dark-border hover:border-white/20 rounded-xl p-8 transition-all duration-200"
    >
      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${colorClasses} rounded-xl mb-6`}>
        {icon}
      </div>

      <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-pathBlue transition-colors duration-200">
        {title}
      </h3>

      <p className="text-dark-text-secondary mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-dark-text-tertiary">{stats}</span>
        <ArrowRight className="w-5 h-5 text-dark-text-tertiary group-hover:text-pathBlue group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </Link>
  );
}
