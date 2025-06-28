import React from 'react';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'library' | 'timer' | 'search';
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative">
      {/* Animated orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <Header currentPage={currentPage} />
      <main className="relative z-10 px-2 md:px-6 py-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
