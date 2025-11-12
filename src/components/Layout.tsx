import { Outlet } from 'react-router-dom';
import { AuthNavigation } from './AuthNavigation';
import { ErrorBoundary } from './ErrorBoundary';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorBoundary>
        <AuthNavigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Outlet />
        </main>
      </ErrorBoundary>
    </div>
  );
}
