import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ReadRiseLanding from './components/ReadRiseLanding';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

import Dashboard from './components/Dashboard';
import BookSearch from './components/BookSearch';
import BookLibrary from './components/BookLibrary';
import ReadingTimer from './components/ReadingTimer';

const AchievementsLazy = React.lazy(() => import('./pages/achievements'));

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <ReadRiseLanding />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/achievements" element={
        <ProtectedRoute>
          <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading Achievements...</div>}>
            <AchievementsLazy />
          </React.Suspense>
        </ProtectedRoute>
      } />
      <Route path="/search" element={
            <ProtectedRoute>
              <BookSearch />
            </ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute>
              <BookLibrary />
            </ProtectedRoute>
          } />
          <Route path="/timer" element={
            <ProtectedRoute>
              <ReadingTimer />
            </ProtectedRoute>
          } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;