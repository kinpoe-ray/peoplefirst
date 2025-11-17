import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface GuestOnlyRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

/**
 * 仅允许未认证用户访问的路由
 * - 已登录用户会被重定向到指定页面（默认首页）
 * - 游客用户可以访问这些页面
 */
export function GuestOnlyRoute({
  children,
  redirectPath = '/',
}: GuestOnlyRouteProps) {
  const { user, isLoading, isGuest } = useAuthStore();
  const location = useLocation();

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // 如果用户已经登录（不是游客），重定向到首页或来源页面
  if (user && !isGuest) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || redirectPath;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export default GuestOnlyRoute;
