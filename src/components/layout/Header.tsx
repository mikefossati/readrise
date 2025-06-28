import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Library, Timer, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentPage: 'dashboard' | 'library' | 'timer' | 'search';
}

const navLinks = [
  { name: 'Dashboard', to: '/dashboard', icon: <BookOpen className="w-5 h-5 mr-2" /> },
  { name: 'Library', to: '/library', icon: <Library className="w-5 h-5 mr-2" /> },
  { name: 'Timer', to: '/timer', icon: <Timer className="w-5 h-5 mr-2" /> },
  { name: 'Search', to: '/search', icon: <Search className="w-5 h-5 mr-2" /> },
];

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (to: string) => {
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <header className="relative z-20 px-2 md:px-6 py-4 border-b border-slate-800/50 bg-slate-900/70 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ReadRise
          </span>
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map(link => (
            <button
              key={link.name}
              onClick={() => handleNav(link.to)}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors font-medium text-gray-300 hover:text-white hover:bg-slate-800/50 ${currentPage === link.name.toLowerCase() || location.pathname.startsWith(link.to) ? 'bg-slate-800/60 text-white' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </button>
          ))}
        </div>
        {/* User section */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              {user?.email?.split('@')[0] || 'Reader'}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white hover:bg-slate-800/50 p-2 rounded-lg"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
          {/* Hamburger for mobile */}
          <button
            className="inline-flex md:hidden items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800/50"
            onClick={() => setMenuOpen(open => !open)}
            aria-label="Open menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>
      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800/60 shadow-xl animate-slide-down">
          <div className="flex flex-col items-stretch p-4 space-y-2">
            {navLinks.map(link => (
              <button
                key={link.name}
                onClick={() => handleNav(link.to)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium text-gray-300 hover:text-white hover:bg-slate-800/50 ${currentPage === link.name.toLowerCase() || location.pathname.startsWith(link.to) ? 'bg-slate-800/60 text-white' : ''}`}
              >
                {link.icon}
                <span>{link.name}</span>
              </button>
            ))}
            <div className="flex items-center space-x-2 px-4 py-2 mt-2 bg-slate-800/40 rounded-lg border border-slate-700/40">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">
                {user?.email?.split('@')[0] || 'Reader'}
              </span>
              <button
                onClick={logout}
                className="ml-auto text-gray-400 hover:text-white hover:bg-slate-800/50 p-2 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
