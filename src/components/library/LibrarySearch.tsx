import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface LibrarySearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  className?: string;
}

export const LibrarySearch: React.FC<LibrarySearchProps> = ({
  searchTerm,
  onSearchChange,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search with Ctrl/Cmd + K
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  const clearSearch = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`max-w-2xl mx-auto mb-8 ${className}`}>
      <div className="relative">
        <div className={`
          relative flex items-center bg-slate-800/60 backdrop-blur-sm rounded-2xl border transition-all duration-200
          ${isFocused 
            ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-slate-800/80' 
            : 'border-slate-700/50 hover:border-slate-600'
          }
        `}>
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-12 pr-20 py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
            placeholder="Search by title, author, or genre..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className="absolute right-2 flex items-center gap-2">
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 bg-slate-700/50 px-2 py-1 rounded">
              <span>⌘K</span>
            </div>
          </div>
        </div>
        {/* Search suggestions/hints */}
        {searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl z-10">
            <div className="p-3 text-sm text-gray-400">
              Searching for "<span className="text-white font-medium">{searchTerm}</span>"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
