import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, GraduationCap, Shield } from 'lucide-react';

interface AuthStatusProps {
  showRole?: boolean;
  showDetails?: boolean;
  className?: string;
}

/**
 * 认证状态显示组件
 * 用于显示当前用户的认证状态和基本信息
 */
export function AuthStatus({ 
  showRole = true, 
  showDetails = false, 
  className = "" 
}: AuthStatusProps) {
  const { user, profile, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">加载中...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <User className="h-4 w-4" />
        <span className="text-sm">未登录</span>
      </div>
    );
  }

  const userRoleDisplay = {
    student: '学生',
    teacher: '老师',
    alumni: '校友',
  }[profile?.user_type || 'student'];

  const roleIcon = {
    student: <GraduationCap className="h-4 w-4 text-blue-600" />,
    teacher: <Shield className="h-4 w-4 text-green-600" />,
    alumni: <User className="h-4 w-4 text-purple-600" />,
  }[profile?.user_type || 'student'];

  const roleBadgeClass = {
    student: 'bg-blue-100 text-blue-800',
    teacher: 'bg-green-100 text-green-800',
    alumni: 'bg-purple-100 text-purple-800',
  }[profile?.user_type || 'student'];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* 用户头像 */}
      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
        {profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt={profile?.full_name || '用户头像'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-gray-600" />
        )}
      </div>

      {/* 用户信息 */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {profile?.full_name || user?.user_metadata?.full_name || '未设置姓名'}
        </div>
        
        {showDetails && (
          <div className="text-xs text-gray-500 truncate">
            {user?.email}
          </div>
        )}
        
        {showRole && (
          <div className="flex items-center space-x-1 mt-1">
            {roleIcon}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass}`}>
              {userRoleDisplay}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 简洁的认证状态指示器
 */
export function AuthIndicator({ className = "" }: { className?: string }) {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${
        isAuthenticated ? 'bg-green-400' : 'bg-gray-300'
      }`} />
      <span className="text-xs text-gray-600">
        {isAuthenticated ? '已登录' : '未登录'}
      </span>
    </div>
  );
}

/**
 * 角色权限显示组件
 */
export function RoleBadge({ className = "" }: { className?: string }) {
  const { profile } = useAuth();
  const userRole = profile?.user_type || 'student';
  
  const roleConfig = {
    student: {
      label: '学生',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <GraduationCap className="h-3 w-3" />
    },
    teacher: {
      label: '老师',
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: <Shield className="h-3 w-3" />
    },
    alumni: {
      label: '校友',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <User className="h-3 w-3" />
    },
  };
  
  const config = roleConfig[userRole];
  
  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

export default AuthStatus;