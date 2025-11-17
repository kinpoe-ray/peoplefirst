import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // 是否需要完全认证（排除游客模式）
  fallbackPath?: string;
}

/**
 * 保护需要认证的路由
 * - 未认证用户会被重定向到登录页
 * - 可以设置 requireAuth=true 来排除游客模式
 */
export function ProtectedRoute({
  children,
  requireAuth = false,
  fallbackPath = '/signin',
}: ProtectedRouteProps) {
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

  // 检查认证状态
  const isAuthenticated = !!user || isGuest;

  // 如果需要完全认证但用户是游客
  if (requireAuth && !user) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location, message: 'Please sign in to access this feature' }}
        replace
      />
    );
  }

  // 如果未认证
  if (!isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
