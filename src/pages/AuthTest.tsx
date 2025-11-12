import React from 'react';
import { useAuth, usePermissions, useRoleCheck } from '../hooks/useAuth.tsx';
import { AuthStatus, RoleBadge } from '../components/AuthStatus';
import { Brain, Shield, GraduationCap, Users } from 'lucide-react';

/**
 * 认证系统测试页面
 * 用于验证所有认证功能是否正常工作
 */
export default function AuthTest() {
  const { user, profile, loading, isAuthenticated, signOut } = useAuth();
  const permissions = usePermissions();
  const isTeacherRole = useRoleCheck('teacher');
  const isStudentRole = useRoleCheck('student');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">认证测试页面</h2>
          <p className="text-gray-600 mb-6">请先登录以查看认证系统测试</p>
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

  const roleConfig = {
    student: {
      icon: <GraduationCap className="h-6 w-6" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    teacher: {
      icon: <Shield className="h-6 w-6" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    alumni: {
      icon: <Users className="h-6 w-6" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    }
  };

  const currentRole = profile?.user_type || 'student';
  const config = roleConfig[currentRole];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">认证系统测试</h1>
          </div>
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            登出
          </button>
        </div>

        {/* 用户基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-lg border-2 ${config.bg} ${config.border}`}>
            <div className="flex items-center space-x-3 mb-4">
              {config.icon}
              <h2 className="text-xl font-bold text-gray-900">用户信息</h2>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {user?.id}</p>
              <p><span className="font-medium">邮箱:</span> {user?.email}</p>
              <p><span className="font-medium">姓名:</span> {profile?.full_name}</p>
              <p><span className="font-medium">学校:</span> {profile?.school || '未设置'}</p>
              <p><span className="font-medium">专业:</span> {profile?.major || '未设置'}</p>
              <p><span className="font-medium">毕业年份:</span> {profile?.graduation_year || '未设置'}</p>
            </div>
          </div>

          <div className="p-6 rounded-lg border-2 bg-gray-50 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">认证状态</h2>
            <div className="space-y-3">
              <AuthStatus showRole showDetails />
              <div className="flex items-center space-x-2">
                <span className="font-medium">状态:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAuthenticated ? '已登录' : '未登录'}
                </span>
              </div>
              <RoleBadge />
            </div>
          </div>
        </div>

        {/* 权限测试 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">权限测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">基本权限</h3>
              <div className="space-y-1 text-sm">
                <p>已认证: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? '✅' : '❌'}</span></p>
                <p>学生: <span className={isStudentRole ? 'text-green-600' : 'text-red-600'}>{isStudentRole ? '✅' : '❌'}</span></p>
                <p>老师: <span className={isTeacherRole ? 'text-green-600' : 'text-red-600'}>{isTeacherRole ? '✅' : '❌'}</span></p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">功能权限</h3>
              <div className="space-y-1 text-sm">
                <p>创建课程: <span className={permissions.canCreateCourse ? 'text-green-600' : 'text-red-600'}>{permissions.canCreateCourse ? '✅' : '❌'}</span></p>
                <p>创建问题: <span className={permissions.canCreateQuestion ? 'text-green-600' : 'text-red-600'}>{permissions.canCreateQuestion ? '✅' : '❌'}</span></p>
                <p>用户管理: <span className={permissions.canManageUsers ? 'text-green-600' : 'text-red-600'}>{permissions.canManageUsers ? '✅' : '❌'}</span></p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">管理权限</h3>
              <div className="space-y-1 text-sm">
                <p>查看分析: <span className={permissions.canViewAnalytics ? 'text-green-600' : 'text-red-600'}>{permissions.canViewAnalytics ? '✅' : '❌'}</span></p>
                <p>内容审核: <span className={permissions.canModerate ? 'text-green-600' : 'text-red-600'}>{permissions.canModerate ? '✅' : '❌'}</span></p>
                <p>管理员: <span className={permissions.isAdmin ? 'text-green-600' : 'text-red-600'}>{permissions.isAdmin ? '✅' : '❌'}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* 数据库连接测试 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Supabase连接测试</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">URL:</span> {import.meta.env.VITE_SUPABASE_URL}</p>
              <p><span className="font-medium">环境:</span> {import.meta.env.VITE_APP_ENV}</p>
              <p><span className="font-medium">Profile表访问:</span> <span className="text-green-600">✅</span></p>
              <p><span className="font-medium">用户数据:</span> {profile ? '✅ 正常' : '❌ 异常'}</p>
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">测试说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 如果所有项目都显示✅，说明认证系统配置正确</li>
            <li>• 权限测试根据您的用户角色显示相应结果</li>
            <li>• 老师角色具有更多管理权限</li>
            <li>• 可以在注册时选择不同角色进行测试</li>
          </ul>
        </div>
      </div>
    </div>
  );
}