import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { StarRating } from '../StarRating';
import type { Book } from '../../lib/supabase';

interface BookCardProps {
  book: Book;
  onStatusChange: (bookId: string, status: Book['reading_status']) => void;
  onRatingChange: (bookId: string, rating: number) => void;
  ratingLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'currently_reading', label: 'Currently Reading' },
  { value: 'finished', label: 'Finished' },
] as const;

const STATUS_COLORS: Record<string, string> = {
  want_to_read: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  currently_reading: 'bg-orange-600/20 text-orange-300 border-orange-600/30',
  finished: 'bg-green-600/20 text-green-300 border-green-600/30',
};

function getStatusLabel(status: Book['reading_status']) {
  return STATUS_OPTIONS.find(option => option.value === status)?.label || 'Unknown';
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onStatusChange,
  onRatingChange,
  ratingLoading = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [dropdownOpen]);

  const handleStatusChange = (newStatus: Book['reading_status']) => {
    onStatusChange(book.id, newStatus);
    setDropdownOpen(false);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/70 to-purple-900/60 border-slate-700/50 flex flex-col h-full">
      <CardHeader className="flex flex-row gap-2 items-center pb-2">
        <div 
          className="flex-shrink-0 w-14 h-20 rounded overflow-hidden bg-slate-700 flex items-center justify-center"
          style={book.cover_url ? {} : { background: book.cover_color || 'linear-gradient(135deg, #7f53ac 0%, #657ced 100%)' }}
        >
          {book.cover_url ? (
            <img 
              src={book.cover_url} 
              alt={`Cover of ${book.title}`} 
              className="object-cover w-full h-full"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400 text-xs">No Cover</span>
          )}
        </div>
        
        <div className="ml-2 flex-1 min-w-0">
          <CardTitle className="text-base font-semibold line-clamp-2 text-white">
            {book.title}
          </CardTitle>
          {book.author && (
            <div className="text-xs text-purple-300 font-medium line-clamp-1 mt-1">
              {book.author}
            </div>
          )}
          <div className="mt-2">
            <StarRating
              value={typeof book.rating === 'number' ? book.rating : 0}
              onChange={rating => onRatingChange(book.id, rating)}
              disabled={ratingLoading}
              size={18}
            />
            {ratingLoading && (
              <span className="ml-2 text-xs text-gray-400 animate-pulse">Saving...</span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex items-center justify-between pt-2 mt-auto">
        <div className="relative" ref={dropdownRef}>
          <Badge
            className={`cursor-pointer px-3 py-1 rounded-full border transition-colors ${
              STATUS_COLORS[book.reading_status] || 'bg-slate-700/40 text-gray-300 border-slate-700/60'
            } ${dropdownOpen ? 'ring-2 ring-purple-400' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            role="button"
            tabIndex={0}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setDropdownOpen(!dropdownOpen);
              }
            }}
          >
            {getStatusLabel(book.reading_status)}
            {dropdownOpen ? (
              <ChevronUp className="inline ml-1 w-4 h-4" />
            ) : (
              <ChevronDown className="inline ml-1 w-4 h-4" />
            )}
          </Badge>
          
          {dropdownOpen && (
            <div 
              className="absolute left-0 z-20 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-xl"
              role="listbox"
            >
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`w-full px-4 py-2 hover:bg-purple-800/40 cursor-pointer text-sm text-left transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    book.reading_status === option.value 
                      ? 'text-purple-400 font-semibold bg-purple-800/20' 
                      : 'text-gray-200'
                  }`}
                  onClick={() => handleStatusChange(option.value)}
                  role="option"
                  aria-selected={book.reading_status === option.value}
                >
                  <span className="flex items-center justify-between">
                    {option.label}
                    {book.reading_status === option.value && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

