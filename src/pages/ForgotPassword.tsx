import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 验证邮箱
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '发送重置链接失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">重置密码</h1>
          <p className="text-dark-text-secondary">输入您的邮箱地址，我们将发送重置链接</p>
        </div>

        {/* Form */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-successGreen/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-successGreen" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">邮件已发送！</h2>
              <p className="text-dark-text-secondary mb-6">
                我们已向 <span className="text-white font-medium">{email}</span> 发送了密码重置链接。
              </p>
              <p className="text-sm text-dark-text-tertiary mb-6">
                请检查您的邮箱（包括垃圾邮件文件夹），并点击链接重置密码。
              </p>
              <Link
                to="/signin"
                className="inline-block px-6 py-3 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg font-medium transition-all duration-200"
              >
                返回登录
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="your@email.com"
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
                    发送中...
                  </>
                ) : (
                  <>
                    发送重置链接
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/signin"
                  className="text-sm text-dark-text-secondary hover:text-white transition-colors"
                >
                  ← 返回登录
                </Link>
              </div>
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
