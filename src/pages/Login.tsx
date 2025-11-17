import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Flame, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import SEO from '../components/SEO';
import { pageSEO } from '../config/seo';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.password) {
      setFormError('请填写所有字段');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('请输入有效的邮箱地址');
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setFormError(err.message || '登录失败，请检查邮箱和密码');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  return (
    <div className="min-h-screen bg-void flex relative overflow-hidden">
      <SEO
        title={pageSEO.login.title}
        description={pageSEO.login.description}
        url="/signin"
        noindex={true}
        keywords={['登录', 'PeopleFirst', '职业探索']}
      />
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ember/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-lg">
          <div className="mb-8 fade-in-up">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ember to-violet flex items-center justify-center shadow-glow-ember group-hover:scale-110 transition-transform duration-300">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-semibold text-ivory group-hover:text-ember transition-colors duration-300">
                PeopleFirst
              </span>
            </Link>
          </div>

          <h1 className="text-display text-ivory mb-6 fade-in-up delay-100">
            继续你的<br />
            <span className="gradient-text">探索之旅</span>
          </h1>

          <p className="text-xl text-textSecondary leading-relaxed mb-8 fade-in-up delay-200">
            每一次登录，都是重新发现自己的开始。
            <br />
            你的尝试和发现，都在这里等着你。
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 fade-in-up delay-300">
            <div className="flex items-center gap-3 text-textSecondary">
              <div className="w-8 h-8 rounded-lg bg-ember/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-ember" />
              </div>
              <span>AI 实时评估你的技能尝试</span>
            </div>
            <div className="flex items-center gap-3 text-textSecondary">
              <div className="w-8 h-8 rounded-lg bg-moss/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-moss" />
              </div>
              <span>记录你的每一次探索历程</span>
            </div>
            <div className="flex items-center gap-3 text-textSecondary">
              <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet" />
              </div>
              <span>与迷茫者社区分享故事</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full relative z-10">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember to-violet flex items-center justify-center shadow-glow-ember">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-ivory">PeopleFirst</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="glass rounded-2xl p-8 fade-in-up">
            <div className="mb-6">
              <h2 className="text-h1 text-ivory mb-2">欢迎回来</h2>
              <p className="text-textSecondary">登录继续你的探索之旅</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {(formError || error) && (
                <div className="flex items-center gap-3 p-4 bg-warningRed/10 border border-warningRed/30 rounded-xl animate-slide-down">
                  <AlertCircle className="w-5 h-5 text-warningRed flex-shrink-0" />
                  <p className="text-sm text-warningRed">{formError || error}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-2">
                  邮箱地址
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textTertiary group-focus-within:text-ember transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-charcoal border border-slate rounded-xl text-ivory placeholder-textMuted focus:outline-none focus:border-ember focus:ring-2 focus:ring-ember/20 transition-all duration-300"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-textSecondary">
                    密码
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-ember hover:text-ember-light transition-colors"
                  >
                    忘记密码？
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textTertiary group-focus-within:text-ember transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-charcoal border border-slate rounded-xl text-ivory placeholder-textMuted focus:outline-none focus:border-ember focus:ring-2 focus:ring-ember/20 transition-all duration-300"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-ember hover:bg-ember-dark disabled:bg-slate disabled:text-textMuted text-white rounded-xl font-medium transition-all duration-300 hover:shadow-glow-ember btn-glow"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    登录
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-textSecondary">
                还没有账号？{' '}
                <Link to="/signup" className="text-ember hover:text-ember-light font-medium transition-colors">
                  立即注册，开始探索
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-textTertiary hover:text-textSecondary transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
