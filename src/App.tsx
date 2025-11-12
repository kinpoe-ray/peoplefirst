import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { useAuth } from './hooks/useAuth.tsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GrowthHub from './pages/GrowthHub';
import Community from './pages/Community';
import MySpace from './pages/MySpace';
import AICareerAdvisor from './pages/AICareerAdvisor';
import SkillGym from './pages/SkillGym';
import SkillGraphPage from './pages/SkillGraphPage';
import ChallengeMode from './pages/ChallengeMode';
import SocialHub from './pages/SocialHub';
import Profile from './pages/Profile';
import Guilds from './pages/Guilds';
import Alumni from './pages/Alumni';
import AuthTest from './pages/AuthTest';
import Badges from './pages/Badges';
import Settings from './pages/Settings';
import BadgeWall from './components/BadgeWall';
import GradeManagement from './pages/GradeManagement';
import SkillFolio from './components/SkillFolio';
import SkillArena from './components/SkillArena';
import TeacherPortal from './components/TeacherPortal';
import SchoolDashboard from './components/SchoolDashboard';
import Layout from './components/Layout';
import GlobalLoading from './components/GlobalLoading';
import { useState } from 'react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [showLoading, setShowLoading] = useState(false);

  // 显示加载状态如果认证检查时间过长
  if (loading) {
    setTimeout(() => setShowLoading(true), 2000);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        {showLoading ? (
          <GlobalLoading message="正在加载..." />
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        )}
      </div>
    );
  }

  // 游客和正式用户都可以访问
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* New simplified navigation */}
        <Route index element={<Dashboard />} />
        <Route path="growth" element={<GrowthHub />} />
        <Route path="community" element={<Community />} />
        <Route path="badges" element={<Badges />} />
        <Route path="my" element={<MySpace />} />

        {/* Legacy routes - redirect to new structure */}
        <Route path="ai-advisor" element={<Navigate to="/growth?tab=ai" replace />} />
        <Route path="skill-gym" element={<Navigate to="/growth?tab=assessment" replace />} />
        <Route path="skill-graph" element={<Navigate to="/growth?tab=ai" replace />} />
        <Route path="challenge" element={<Navigate to="/growth?tab=assessment" replace />} />
        <Route path="grades" element={<Navigate to="/growth?tab=grades" replace />} />
        <Route path="social" element={<Navigate to="/community?tab=feed" replace />} />
        <Route path="guilds" element={<Navigate to="/community?tab=guilds" replace />} />
        <Route path="alumni" element={<Navigate to="/community?tab=alumni" replace />} />
        <Route path="profile" element={<Navigate to="/my?tab=profile" replace />} />
        <Route path="settings" element={<Navigate to="/my?tab=settings" replace />} />

        {/* Keep some old routes for direct access */}
        <Route path="skill-folio" element={<SkillFolio />} />
        <Route path="skill-arena" element={<SkillArena />} />
        <Route path="teacher-portal" element={<TeacherPortal />} />
        <Route path="school-dashboard" element={<SchoolDashboard />} />
        <Route path="badge-wall" element={<BadgeWall />} />
        <Route path="auth-test" element={<AuthTest />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
