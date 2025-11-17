import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return '密码至少需要8个字符';
    }
    if (!/[A-Z]/.test(password)) {
      return '密码至少需要一个大写字母';
    }
    if (!/[a-z]/.test(password)) {
      return '密码至少需要一个小写字母';
    }
    if (!/[0-9]/.test(password)) {
      return '密码至少需要一个数字';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // 前端验证
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('请填写所有字段');
      return;
    }

    if (formData.username.length < 3) {
      setFormError('用户名至少需要3个字符');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('请输入有效的邮箱地址');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('两次输入的密码不一致');
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.username);
      setShowSuccess(true);

      // 3秒后跳转到首页
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setFormError('该邮箱已被注册');
      } else {
        setFormError(err.message || '注册失败，请重试');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // 清除错误信息
    setFormError('');
  };

  // 成功提示页面
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-successGreen/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-successGreen" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">注册成功！</h2>
            <p className="text-dark-text-secondary mb-6">
              欢迎加入PathFinder，即将跳转到首页...
            </p>
            <div className="w-8 h-8 mx-auto border-4 border-pathBlue border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pathBlue to-warmOrange flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">创建账号</h1>
          <p className="text-dark-text-secondary">开始探索你的职业可能性</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {formError && (
              <div className="flex items-center gap-2 p-4 bg-warningRed/10 border border-warningRed/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-warningRed flex-shrink-0" />
                <p className="text-sm text-warningRed">{formError}</p>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-dark-text-secondary mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="至少3个字符"
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue transition-colors"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue transition-colors"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-text-secondary mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="至少8位，包含大小写字母和数字"
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue transition-colors"
                  disabled={isLoading}
                  required
                />
              </div>
              <p className="mt-1.5 text-xs text-dark-text-tertiary">
                密码需包含大小写字母、数字，至少8个字符
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-text-secondary mb-2">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="再次输入密码"
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue transition-colors"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-pathBlue hover:bg-pathBlue-dark disabled:bg-dark-border disabled:text-dark-text-tertiary text-white rounded-lg font-medium transition-all duration-200 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  注册中...
                </>
              ) : (
                <>
                  创建账号
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-dark-text-secondary">
              已有账号？{' '}
              <Link to="/signin" className="text-pathBlue hover:text-pathBlue-light font-medium transition-colors">
                立即登录
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-dark-text-tertiary hover:text-dark-text-secondary transition-colors">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
