import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from '../hooks/use-mobile';
import { 
  Brain, 
  User, 
  Settings, 
  LogOut, 
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  Award,
  Home,
  Dumbbell,
  Network,
  Users,
  GraduationCap as AlumniIcon,
  BarChart3,
  Shield,
  BookOpen
} from 'lucide-react';

export function AuthNavigation() {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const userRoleDisplay = {
    student: '学生',
    teacher: '老师',
    alumni: '校友',
  }[profile?.user_type || 'student'];

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Evolv</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                注册
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  注册
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Evolv</span>
          </Link>

          {/* Desktop Navigation - Simplified to 5 items */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-1 rounded-md hover:bg-gray-100"
            >
              <Home className="w-4 h-4" />
              首页
            </Link>
            <Link
              to="/growth"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-1 rounded-md hover:bg-gray-100"
            >
              <Dumbbell className="w-4 h-4" />
              成长中心
            </Link>
            <Link
              to="/community"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-1 rounded-md hover:bg-gray-100"
            >
              <Users className="w-4 h-4" />
              社区
            </Link>
            <Link
              to="/badges"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-1 rounded-md hover:bg-gray-100"
            >
              <Award className="w-4 h-4" />
              徽章
            </Link>
            <Link
              to="/my"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-1 rounded-md hover:bg-gray-100"
            >
              <User className="w-4 h-4" />
              我的
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {profile?.full_name || user?.user_metadata?.full_name}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {userRoleDisplay}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{profile?.full_name}</div>
                    <div className="text-gray-500">{user?.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      身份：{userRoleDisplay}
                    </div>
                  </div>
                  
                  <Link
                    to="/badges"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Award className="h-4 w-4 mr-3" />
                    我的徽章
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    设置
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    登出
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Simplified */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>首页</span>
              </Link>
              <Link
                to="/growth"
                className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Dumbbell className="w-4 h-4" />
                <span>成长中心</span>
              </Link>
              <Link
                to="/community"
                className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="w-4 h-4" />
                <span>社区</span>
              </Link>
              <Link
                to="/badges"
                className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Award className="w-4 h-4" />
                <span>徽章</span>
              </Link>
              <Link
                to="/my"
                className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>我的</span>
              </Link>

              <div className="border-t pt-3 mt-3">
                <div className="px-3 py-3 bg-gray-50 rounded-lg mx-2">
                  <div className="font-medium text-gray-900">{profile?.full_name}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    身份：{userRoleDisplay}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
}

export default AuthNavigation;