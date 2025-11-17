import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Target, MessageSquare, User, LogOut, Flame } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export default function Header() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ember to-violet flex items-center justify-center shadow-glow-ember group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-ivory group-hover:text-ember transition-colors duration-300">
              PeopleFirst
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" icon={<Home className="w-4 h-4" />} text="首页" active={location.pathname === '/'} />
            <NavLink to="/contents" icon={<BookOpen className="w-4 h-4" />} text="职业库" active={location.pathname.startsWith('/contents')} />
            <NavLink to="/tasks" icon={<Target className="w-4 h-4" />} text="试验场" active={location.pathname.startsWith('/tasks')} />
            <NavLink to="/stories" icon={<MessageSquare className="w-4 h-4" />} text="故事墙" active={location.pathname.startsWith('/stories')} />
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-ember/10 transition-all duration-300"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-7 h-7 rounded-full ring-2 ring-ember/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-ember/20 flex items-center justify-center ring-2 ring-ember/30">
                      <User className="w-4 h-4 text-ember" />
                    </div>
                  )}
                  <span className="text-sm text-textSecondary group-hover:text-ivory transition-colors">{user.username}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg hover:bg-warningRed/10 text-textTertiary hover:text-warningRed transition-all duration-300"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/signin"
                  className="px-4 py-2 text-sm text-textSecondary hover:text-ivory transition-colors duration-300"
                >
                  登录
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-sm bg-ember hover:bg-ember-dark text-white rounded-lg transition-all duration-300 hover:shadow-glow-ember"
                >
                  开始探索
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
  active?: boolean;
}

function NavLink({ to, icon, text, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        active
          ? 'text-ember bg-ember/10'
          : 'text-textSecondary hover:text-ivory hover:bg-slate/50'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-ember rounded-full" />
      )}
    </Link>
  );
}
