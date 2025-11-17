import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ContentList from './pages/ContentList';
import ContentDetail from './pages/ContentDetail';
import TaskList from './pages/TaskList';
import TaskExecution from './pages/TaskExecution';
import StoryWall from './pages/StoryWall';
import StoryDetail from './pages/StoryDetail';
import StoryCreate from './pages/StoryCreate';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import GuestOnlyRoute from './components/GuestOnlyRoute';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Public Routes - accessible to everyone including guests */}
          <Route path="/" element={<Home />} />
          <Route path="/contents" element={<ContentList />} />
          <Route path="/contents/:id" element={<ContentDetail />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/stories" element={<StoryWall />} />
          <Route path="/stories/:id" element={<StoryDetail />} />

          {/* Protected Routes - require authentication (guests allowed) */}
          <Route
            path="/tasks/:id/execute"
            element={
              <ProtectedRoute>
                <TaskExecution />
              </ProtectedRoute>
            }
          />

          {/* Strictly Protected Routes - require full authentication (no guests) */}
          <Route
            path="/stories/create"
            element={
              <ProtectedRoute requireAuth>
                <StoryCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requireAuth>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Guest Only Routes - redirect authenticated users away */}
          <Route
            path="/signin"
            element={
              <GuestOnlyRoute>
                <Login />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestOnlyRoute>
                <SignUp />
              </GuestOnlyRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
