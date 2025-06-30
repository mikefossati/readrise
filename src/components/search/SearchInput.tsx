import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

const POPULAR_SEARCHES = [
  'Fiction bestsellers',
  'Science fiction',
  'Mystery thriller',
  'Self help',
  'Biography',
  'Romance novels',
];

export const SearchInput: React.FC<SearchInputProps> = ({
  query,
  onQueryChange,
  loading = false,
  placeholder = "Search for books, authors, or genres...",
  suggestions = POPULAR_SEARCHES,
  onSuggestionClick,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
    onQueryChange('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion);
    setShowSuggestions(false);
    onSuggestionClick?.(suggestion);
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className={`
        relative flex items-center bg-slate-800/60 backdrop-blur-sm rounded-2xl border transition-all duration-200
        ${isFocused 
          ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-slate-800/80' 
          : 'border-slate-700/50 hover:border-slate-600'
        }
      `}>
        <Search className={`absolute left-4 w-6 h-6 transition-colors ${loading ? 'animate-pulse text-purple-400' : 'text-gray-400'}`} />
        
        <input
          ref={inputRef}
          type="text"
          className="w-full pl-14 pr-24 py-5 bg-transparent text-white placeholder-gray-400 focus:outline-none text-xl"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(!query);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
        />
        
        <div className="absolute right-3 flex items-center gap-2">
          {query && (
            <button
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 bg-slate-700/50 px-2 py-1 rounded">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl z-10">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Popular searches</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
