import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Target, MessageSquare, ArrowRight, Compass, Sparkles, Flame, Leaf, Zap } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { supabase } from '../lib/supabase';
import { DashboardStats } from '../types/pathfinder';
import { createLogger } from '../lib/logger';

const logger = createLogger('Home');

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    total_contents: 0,
    total_tasks: 0,
    total_stories: 0,
    active_users: 0,
  });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStats();

    // Parallax effect on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
      logger.error('Failed to load stats', error);
    }
  };

  return (
    <Layout>
      {/* Hero Section - Asymmetric Layout */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-ember/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-violet/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-moss/10 rounded-full blur-[150px]" />

          {/* Floating geometric shapes */}
          <div className="absolute top-20 right-1/4 w-4 h-4 bg-ember rotate-45 float opacity-60" />
          <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-moss rounded-full float opacity-50" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-violet float opacity-40" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left content - takes 7 columns */}
          <div className="lg:col-span-7 space-y-8">
            {/* Badge */}
            <div className="fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-ember/10 border border-ember/30 rounded-full text-caption text-ember">
                <Flame className="w-4 h-4" />
                为迷茫中的探索者而建
              </span>
            </div>

            {/* Main headline - bold and asymmetric */}
            <div className="fade-in-up delay-100">
              <h1 className="text-hero text-shadow">
                <span className="block">先</span>
                <span className="block text-ember relative">
                  试试
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-[draw_1s_ease-out_forwards]" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
                  </svg>
                </span>
                <span className="block">再决定</span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-textSecondary max-w-xl leading-relaxed fade-in-up delay-200">
              不是规划人生，而是<span className="text-moss font-medium">体验人生</span>。
              <br />
              在真实的尝试中发现真正的自己。
            </p>

            {/* CTA buttons with glow effect */}
            <div className="flex flex-wrap gap-4 pt-4 fade-in-up delay-300">
              <Link
                to="/contents"
                className="group relative px-8 py-4 bg-ember hover:bg-ember-dark text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-3 btn-glow shadow-glow-ember hover:shadow-[0_0_50px_rgba(255,107,53,0.5)]"
              >
                <Compass className="w-5 h-5" />
                开始探索
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <Link
                to="/stories"
                className="group px-8 py-4 glass-warm hover:bg-ember/10 text-ivory rounded-xl font-medium transition-all duration-300 flex items-center gap-3"
              >
                <MessageSquare className="w-5 h-5" />
                听听真实故事
              </Link>
            </div>
          </div>

          {/* Right content - Visual element */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative w-full aspect-square">
              {/* Central compass/discovery visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-80 h-80">
                  {/* Rotating ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-ember/30 animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-8 rounded-full border border-moss/20 animate-[spin_15s_linear_infinite_reverse]" />

                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-ember via-violet to-moss rounded-2xl rotate-12 flex items-center justify-center shadow-glow-ember animate-scale-in">
                      <Sparkles className="w-16 h-16 text-white" />
                    </div>
                  </div>

                  {/* Orbiting stats */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <StatOrb icon={<BookOpen className="w-4 h-4" />} value={stats.total_contents} label="职业" color="ember" />
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <StatOrb icon={<Target className="w-4 h-4" />} value={stats.total_tasks} label="任务" color="moss" />
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <StatOrb icon={<MessageSquare className="w-4 h-4" />} value={stats.total_stories} label="故事" color="violet" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-textTertiary rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-ember rounded-full mt-2 animate-[slideDown_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* Features Section - Card grid with hover effects */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-display mb-6">
              三种方式，<span className="gradient-text">探索可能</span>
            </h2>
            <p className="text-xl text-textSecondary max-w-2xl mx-auto">
              从了解到尝试，从迷茫到清晰
            </p>
          </div>

          {/* Asymmetric grid layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="职业去魅化"
              subtitle="看见真实的一天"
              description="不是光鲜的宣传片，而是真实的工作日常。高光时刻与崩溃瞬间，让你在尝试前就看清职业真相。"
              color="ember"
              link="/contents"
              stats={`${stats.total_contents}+ 职业`}
              featured
            />

            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="技能试验场"
              subtitle="在实践中发现天赋"
              description="30-60分钟沉浸式任务，AI实时反馈。不是纸上谈兵，而是真刀真枪地试一试。"
              color="moss"
              link="/tasks"
              stats={`${stats.total_tasks}+ 任务`}
            />

            <FeatureCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="迷茫者故事墙"
              subtitle="你不是一个人"
              description="真实的尝试、真实的失败、真实的发现。在他人的故事中找到共鸣，在分享中获得力量。"
              color="violet"
              link="/stories"
              stats={`${stats.total_stories}+ 故事`}
            />
          </div>
        </div>
      </section>

      {/* Philosophy Section - Breaking the grid */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Quote */}
            <div className="relative">
              <div className="absolute -top-8 -left-8 text-[120px] font-bold text-ember/10 leading-none select-none">"</div>
              <blockquote className="relative z-10">
                <p className="text-display text-ivory leading-tight">
                  迷茫不是问题，<br />
                  <span className="text-ember">停止探索</span>才是。
                </p>
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-16 h-[2px] bg-ember" />
                <span className="text-textSecondary">PeopleFirst 理念</span>
              </div>
            </div>

            {/* Right - Action cards */}
            <div className="space-y-4">
              <PhilosophyCard
                icon={<Flame className="w-6 h-6" />}
                title="勇气 > 完美计划"
                description="与其花三个月做职业规划，不如花三天做一次真实尝试"
              />
              <PhilosophyCard
                icon={<Leaf className="w-6 h-6" />}
                title="体验 > 想象"
                description="你以为自己喜欢的，可能并不适合你"
              />
              <PhilosophyCard
                icon={<Zap className="w-6 h-6" />}
                title="行动 > 等待"
                description="找到方向的唯一方式是开始行动"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Bold and warm */}
      <section className="relative py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl noise-overlay">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-ember via-ember-dark to-violet opacity-90" />

            {/* Content */}
            <div className="relative z-10 p-12 md:p-20 text-center">
              <h2 className="text-display text-white mb-6 text-shadow">
                准备好开始尝试了吗？
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                不需要完美的计划，不需要百分百的确定。<br />
                你需要的只是一点点勇气，和开始的决心。
              </p>
              <Link
                to="/contents"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-ember hover:bg-cream rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Compass className="w-6 h-6" />
                立即开始探索
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Orbiting stat component
function StatOrb({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  const colorClasses = {
    ember: 'bg-ember/20 text-ember border-ember/30',
    moss: 'bg-moss/20 text-moss border-moss/30',
    violet: 'bg-violet/20 text-violet border-violet/30',
  }[color];

  return (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-xl ${colorClasses} border backdrop-blur-sm`}>
      {icon}
      <span className="text-lg font-semibold">{value}+</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}

// Feature card with refined design
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  link: string;
  stats: string;
  featured?: boolean;
}

function FeatureCard({ icon, title, subtitle, description, color, link, stats, featured }: FeatureCardProps) {
  const colorClasses = {
    ember: {
      bg: 'from-ember/10 to-transparent',
      border: 'hover:border-ember/50',
      icon: 'bg-ember/20 text-ember group-hover:bg-ember group-hover:text-white',
      text: 'text-ember',
    },
    moss: {
      bg: 'from-moss/10 to-transparent',
      border: 'hover:border-moss/50',
      icon: 'bg-moss/20 text-moss group-hover:bg-moss group-hover:text-white',
      text: 'text-moss',
    },
    violet: {
      bg: 'from-violet/10 to-transparent',
      border: 'hover:border-violet/50',
      icon: 'bg-violet/20 text-violet group-hover:bg-violet group-hover:text-white',
      text: 'text-violet',
    },
  }[color];

  return (
    <Link
      to={link}
      className={`group relative overflow-hidden bg-charcoal border border-slate ${colorClasses.border} rounded-2xl p-8 transition-all duration-500 hover-lift ${featured ? 'md:row-span-2' : ''}`}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-16 h-16 ${colorClasses.icon} rounded-xl mb-6 transition-all duration-500`}>
          {icon}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-h1 text-ivory group-hover:text-white transition-colors duration-300">
            {title}
          </h3>
          <p className={`text-caption ${colorClasses.text} font-medium`}>
            {subtitle}
          </p>
          <p className="text-body text-textSecondary leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between">
          <span className="text-small text-textTertiary bg-slate/50 px-3 py-1 rounded-full">{stats}</span>
          <ArrowRight className="w-5 h-5 text-textTertiary group-hover:text-white group-hover:translate-x-2 transition-all duration-300" />
        </div>
      </div>
    </Link>
  );
}

// Philosophy card component
function PhilosophyCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group flex items-start gap-4 p-6 bg-charcoal border border-slate hover:border-ember/30 rounded-xl transition-all duration-300 hover-lift">
      <div className="flex-shrink-0 w-12 h-12 bg-ember/10 text-ember rounded-lg flex items-center justify-center group-hover:bg-ember group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div>
        <h4 className="text-h2 text-ivory mb-2">{title}</h4>
        <p className="text-body text-textSecondary">{description}</p>
      </div>
    </div>
  );
}

// Add CSS animation for drawing line
const style = document.createElement('style');
style.textContent = `
  @keyframes draw {
    to {
      stroke-dashoffset: 0;
    }
  }
  @keyframes slideDown {
    0%, 100% {
      transform: translateY(0);
      opacity: 1;
    }
    50% {
      transform: translateY(6px);
      opacity: 0.5;
    }
  }
`;
document.head.appendChild(style);
