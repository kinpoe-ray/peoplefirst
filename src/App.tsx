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
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contents" element={<ContentList />} />
          <Route path="/contents/:id" element={<ContentDetail />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/:id/execute" element={<TaskExecution />} />
          <Route path="/stories" element={<StoryWall />} />
          <Route path="/stories/:id" element={<StoryDetail />} />
          <Route path="/stories/create" element={<StoryCreate />} />
          <Route path="/profile" element={<Profile />} />

          {/* Auth Routes */}
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
