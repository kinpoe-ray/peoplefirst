import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * 认证Hook - 提供认证相关功能
 * 基于AuthContext，提供更简洁的接口
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    isAuthenticated,
    isGuest,
  } = context;
  
  return {
    // 用户信息
    user,
    profile,
    loading,
    
    // 认证方法
    signIn,
    signUp,
    signOut,
    refreshProfile,
    
    // 便捷方法
    isAuthenticated,
    isGuest,
    isTeacher: profile?.user_type === 'teacher',
    isStudent: profile?.user_type === 'student',
    isAlumni: profile?.user_type === 'alumni',
    userRole: profile?.user_type || null,
    userName: profile?.full_name || user?.user_metadata?.full_name || '',
    userTypeDisplay: {
      student: '学生',
      teacher: '老师',
      alumni: '校友',
    }[profile?.user_type || 'student'] || '学生',
  };
}

/**
 * 高阶组件 - 保护需要认证的路由
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { loading, user } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (!user) {
      // 可以重定向到登录页或显示未认证UI
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">需要登录</h2>
            <p className="text-gray-600 mb-6">请先登录以访问此页面</p>
            <a
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              去登录
            </a>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}

/**
 * 检查用户权限的Hook
 */
export function usePermissions() {
  const { profile } = useAuth();
  const userRole = profile?.user_type || 'student';
  
  return {
    canCreateCourse: userRole === 'teacher' || userRole === 'alumni',
    canCreateQuestion: userRole === 'teacher',
    canManageUsers: userRole === 'teacher',
    canViewAnalytics: userRole === 'teacher',
    canModerate: userRole === 'teacher',
    userRole,
    isAdmin: userRole === 'teacher',
  };
}

/**
 * 角色检查Hook
 */
export function useRoleCheck(requiredRole?: 'teacher' | 'student' | 'alumni') {
  const { profile } = useAuth();
  
  if (!requiredRole) return true;
  
  return profile?.user_type === requiredRole;
}