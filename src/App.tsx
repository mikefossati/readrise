import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { PageErrorFallback, RouteErrorFallback } from './components/common/ErrorFallback';

// Import components
import ReadRiseLanding from './components/ReadRiseLanding';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Lazy load heavy components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const BookSearch = React.lazy(() => import('./components/BookSearch'));
const BookLibrary = React.lazy(() => import('./components/BookLibrary'));
const ReadingTimer = React.lazy(() => import('./components/ReadingTimer'));
const AchievementsLazy = React.lazy(() => import('./pages/achievements'));
const ErrorServiceTestPageLazy = React.lazy(() => import('./pages/ErrorServiceTestPage'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
      <p className="text-white">Loading...</p>
    </div>
  </div>
);

// Route wrapper with error boundary
const RouteWithErrorBoundary: React.FC<{ 
  children: React.ReactNode; 
  routeName: string;
}> = ({ children, routeName }) => (
  <ErrorBoundary
    level="page"
    fallback={RouteErrorFallback}
    onError={(error, errorInfo, errorId) => {
      console.log(`Route error in ${routeName}:`, { error, errorInfo, errorId });
      // TODO: Send to error tracking service
    }}
  >
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RouteWithErrorBoundary routeName="landing">
              <ReadRiseLanding />
            </RouteWithErrorBoundary>
          )
        } 
      />

      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <RouteWithErrorBoundary routeName="dashboard">
              <Dashboard />
            </RouteWithErrorBoundary>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/achievements" 
        element={
          <ProtectedRoute>
            <RouteWithErrorBoundary routeName="achievements">
              <AchievementsLazy />
            </RouteWithErrorBoundary>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/search" 
        element={
          <ProtectedRoute>
            <RouteWithErrorBoundary routeName="search">
              <BookSearch />
            </RouteWithErrorBoundary>
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/library" 
        element={
          <ProtectedRoute>
            <RouteWithErrorBoundary routeName="library">
              <BookLibrary />
            </RouteWithErrorBoundary>
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/timer" 
        element={
          <ProtectedRoute>
            <RouteWithErrorBoundary routeName="timer">
              <ReadingTimer />
            </RouteWithErrorBoundary>
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/error-service-test" 
        element={
          <RouteWithErrorBoundary routeName="error-service-test">
            <ErrorServiceTestPageLazy />
          </RouteWithErrorBoundary>
        }
      />

      {/* Catch-all route */}
      <Route 
        path="*" 
        element={
          <RouteWithErrorBoundary routeName="not-found">
            <Navigate to="/" replace />
          </RouteWithErrorBoundary>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary
      level="page"
      fallback={PageErrorFallback}
      onError={(error, errorInfo, errorId) => {
        console.error('Top-level app error:', { error, errorInfo, errorId });
        // TODO: Send critical errors to monitoring service
      }}
    >
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;