import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle, CheckCircle, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    // 检查是否有有效的重置令牌
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setValidToken(true);
      } else {
        setError('重置链接无效或已过期');
      }
    };

    checkSession();
  }, []);

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
    setError('');

    // 验证密码
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);

      // 3秒后跳转到登录页
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (err: any) {
      setError(err.message || '重置密码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 成功页面
  if (success) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-successGreen/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-successGreen" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">密码重置成功！</h2>
            <p className="text-dark-text-secondary mb-6">
              您的密码已成功重置，即将跳转到登录页...
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
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember to-violet flex items-center justify-center shadow-glow-ember group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold text-white group-hover:text-ember transition-colors duration-300">PeopleFirst</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mt-6 mb-2">设置新密码</h1>
          <p className="text-dark-text-secondary">请输入您的新密码</p>
        </div>

        {/* Form */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          {!validToken ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warningRed/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-warningRed" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">链接无效</h2>
              <p className="text-dark-text-secondary mb-6">
                重置链接无效或已过期，请重新申请密码重置。
              </p>
              <Link
                to="/forgot-password"
                className="inline-block px-6 py-3 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg font-medium transition-all duration-200"
              >
                重新申请
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-warningRed/10 border border-warningRed/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-warningRed flex-shrink-0" />
                  <p className="text-sm text-warningRed">{error}</p>
                </div>
              )}

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-text-secondary mb-2">
                  新密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
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
                  确认新密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="再次输入新密码"
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
                className="w-full flex items-center justify-center gap-2 py-3 bg-pathBlue hover:bg-pathBlue-dark disabled:bg-dark-border disabled:text-dark-text-tertiary text-white rounded-lg font-medium transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    重置中...
                  </>
                ) : (
                  <>
                    重置密码
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
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
