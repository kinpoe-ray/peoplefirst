import { Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Target, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export default function Header() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pathBlue to-warmOrange flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-semibold text-white group-hover:text-pathBlue transition-colors duration-200">
              PathFinder
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" icon={<Home className="w-4 h-4" />} text="首页" />
            <NavLink to="/contents" icon={<BookOpen className="w-4 h-4" />} text="职业库" />
            <NavLink to="/tasks" icon={<Target className="w-4 h-4" />} text="试验场" />
            <NavLink to="/stories" icon={<MessageSquare className="w-4 h-4" />} text="故事墙" />
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-pathBlue/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-pathBlue" />
                    </div>
                  )}
                  <span className="text-sm text-dark-text-secondary">{user.username}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg hover:bg-white/5 text-dark-text-tertiary hover:text-warningRed transition-all duration-200"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="px-4 py-2 text-sm text-dark-text-secondary hover:text-white transition-colors duration-200"
                >
                  登录
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg transition-all duration-200"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
}

function NavLink({ to, icon, text }: NavLinkProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-dark-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </Link>
  );
}
