import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BookOpen, Clock, Search, ChevronDown, ChevronUp, AlertCircle, WifiOff, X } from 'lucide-react';
import { TimerSetupDropdownPortal } from './TimerSetupDropdownPortal';
import { TimerStats } from './TimerStats';
import { TimerEmptyState } from './TimerEmptyState';
import type { Book } from '../../lib/supabase';

interface ReadingStats {
  todayMinutes: number;
  weeklyMinutes: number;
  currentStreak: number;
  averageSessionLength: number;
  totalSessions: number;
}

interface TimerSetupProps {
  books: Book[];
  selectedBook: Book | null;
  onBookSelect: (book: Book) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  onStart: () => void;
  loadingBooks: boolean;
  startingSession: boolean;
  readingStats: ReadingStats;
  error?: string | null;
}

const DURATION_PRESETS = [15, 25, 30, 45, 60, 90];

const getDurationDescription = (minutes: number): string => {
  if (minutes <= 15) return "Perfect for a quick reading break";
  if (minutes <= 30) return "Ideal for focused reading";
  if (minutes <= 60) return "Great for deep reading sessions";
  return "Extended reading marathon";
};

const getEndTime = (durationMinutes: number): string => {
  const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);
  return endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const TimerSetup: React.FC<TimerSetupProps> = ({
  books,
  selectedBook,
  onBookSelect,
  duration,
  onDurationChange,
  onStart,
  loadingBooks,
  startingSession,
  readingStats,
  error,
}) => {
  // Error/edge/validation state management

  const [startError, setStartError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  // Retry and add books handlers
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);
  const handleAddBooks = useCallback(() => {
    window.location.href = '/search';
  }, []);

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Validation
  useEffect(() => {
    if (!selectedBook) {
      setValidationError('Please select a book to read');
    } else if (duration < 5) {
      setValidationError('Session must be at least 5 minutes');
    } else if (duration > 120) {
      setValidationError('Session cannot exceed 2 hours');
    } else {
      setValidationError(null);
    }
  }, [selectedBook, duration]);

  // Start handler with error feedback
  const handleStart = useCallback(async () => {
    try {
      setStartError(null);
      await onStart();
    } catch (error) {
      setStartError(error instanceof Error ? error.message : 'Failed to start session');
    }
  }, [onStart]);

  // Error/empty/loading states
  // All hooks must be declared before any early return
  const [bookSearchOpen, setBookSearchOpen] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  // Separate refs for div and button to avoid TS type errors
  const bookSelectorDivRef = useRef<HTMLDivElement>(null);
  const bookSelectorButtonRef = useRef<HTMLButtonElement>(null);

  if (loadingBooks) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Reading Timer</h1>
          <p className="text-xl text-gray-300">Focus on your reading with distraction-free sessions</p>
        </div>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Loading Your Library</h3>
            <p className="text-gray-400">Preparing your books for the perfect reading session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (typeof error === 'string' && error) {
    const errorType = error.includes('network') || error.includes('connection')
      ? 'connection-error'
      : 'loading-error';
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Reading Timer</h1>
          <p className="text-xl text-gray-300">Focus on your reading with distraction-free sessions</p>
        </div>
        <TimerEmptyState
          type={errorType as any}
          error={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Reading Timer</h1>
          <p className="text-xl text-gray-300">Focus on your reading with distraction-free sessions</p>
        </div>
        <TimerEmptyState
          type="no-books"
          onAddBooks={handleAddBooks}
        />
      </div>
    );
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    (book.author && book.author.toLowerCase().includes(bookSearch.toLowerCase()))
  );

  const currentlyReadingBooks = filteredBooks.filter(b => b.reading_status === 'currently_reading');
  const otherBooks = filteredBooks.filter(b => b.reading_status !== 'currently_reading');

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header with fade-in */}
      <div className="text-center animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white mb-4">Reading Timer</h1>
        <p className="text-xl text-gray-300">Focus on your reading with distraction-free sessions</p>
      </div>

      {/* Stats with delayed animation */}
      {!loadingBooks && books.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <TimerStats {...readingStats} />
        </div>
      )}

      {/* Book Selection with enhanced interactions */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover-lift timer-transition animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Select Book
            {selectedBook && (
              <div className="ml-auto">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingBooks ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg">
                <div className="w-12 h-16 bg-slate-700 rounded shimmer"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-700 rounded shimmer"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3 shimmer"></div>
                </div>
              </div>
              <div className="text-center text-gray-400 text-sm">Loading your books...</div>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No books in your library yet</p>
              <Button 
                onClick={() => window.location.href = '/search'}
                variant="outline"
                className="border-purple-500 text-purple-300"
              >
                Add Books
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Selected Book Display */}
              {selectedBook ? (
                <div className="space-y-2">
                  {/* Book count indicator */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      {books.findIndex(b => b.id === selectedBook.id) + 1} of {books.length} books
                    </span>
                    <button
                      onClick={() => setBookSearchOpen(true)}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Change book
                    </button>
                  </div>
                  <div
                    ref={bookSelectorDivRef}
                    className={`group flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-all duration-200 hover:border-purple-500/40 timer-transition hover-lift`}
                    onClick={() => setBookSearchOpen(true)}
                  >
                    <div className="w-12 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
                      {selectedBook.cover_url ? (
                        <img src={selectedBook.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg group-hover:text-purple-100 transition-colors">
                        {selectedBook.title}
                      </h3>
                      {selectedBook.author && (
                        <p className="text-purple-300 text-sm mb-2">{selectedBook.author}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs border-purple-500/30 text-purple-300"
                        >
                          {selectedBook.reading_status.replace('_', ' ')}
                        </Badge>
                        {selectedBook.reading_status === 'currently_reading' && (
                          <div className="flex items-center gap-1 text-xs text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Active
                          </div>
                        )}
                      </div>
                      {selectedBook.total_reading_time && (
                        <div className="text-xs text-gray-400 mt-1">
                          {Math.round(selectedBook.total_reading_time / 60)} minutes read so far
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-purple-300 transition-colors">
                      <ChevronDown className="w-5 h-5" />
                      <span className="text-xs">Change</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  ref={bookSelectorButtonRef}
                  onClick={() => setBookSearchOpen(true)}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 border-dashed border-purple-500/30 text-purple-300"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Choose a book from your library
                </Button>
              )}

              {/* Book Search Dropdown */}
              {bookSearchOpen && (
                <TimerSetupDropdownPortal anchorRef={(selectedBook ? bookSelectorDivRef : bookSelectorButtonRef) as React.RefObject<HTMLElement>} onRequestClose={() => { setBookSearchOpen(false); setBookSearch(''); }}>
                  <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl z-[9999] max-h-80 overflow-hidden">
                    <div className="p-4 border-b border-slate-700/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search your books..."
                          value={bookSearch}
                          onChange={(e) => setBookSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => {
                          setBookSearchOpen(false);
                          setBookSearch('');
                        }}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {currentlyReadingBooks.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs font-medium text-green-400 bg-green-500/10">
                            Currently Reading
                          </div>
                          {currentlyReadingBooks.map(book => (
                            <BookOption 
                              key={book.id} 
                              book={book} 
                              onSelect={() => {
                                onBookSelect(book);
                                setBookSearchOpen(false);
                                setBookSearch('');
                              }}
                            />
                          ))}
                        </div>
                      )}
                      {otherBooks.length > 0 && (
                        <div>
                          {currentlyReadingBooks.length > 0 && (
                            <div className="px-4 py-2 text-xs font-medium text-gray-400 bg-slate-800/30">
                              Other Books
                            </div>
                          )}
                          {otherBooks.map(book => (
                            <BookOption 
                              key={book.id} 
                              book={book} 
                              onSelect={() => {
                                onBookSelect(book);
                                setBookSearchOpen(false);
                                setBookSearch('');
                              }}
                            />
                          ))}
                        </div>
                      )}
                      {filteredBooks.length === 0 && (
                        <div className="p-4 text-center text-gray-400">
                          No books found matching "{bookSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                </TimerSetupDropdownPortal>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duration Selection */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Session Duration
            </div>
            <div className="text-sm text-gray-400 font-normal">
              Choose your focus time
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Presets Row */}
          <div className="space-y-3">
            <div className="text-sm text-gray-400 mb-2">Quick presets</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {DURATION_PRESETS.map(preset => {
                const isSelected = duration === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => onDurationChange(preset)}
                    className={`
                      flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2
                      ${isSelected 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-400 shadow-lg shadow-purple-500/25 scale-105' 
                        : 'bg-slate-700/50 text-gray-300 border-slate-600 hover:border-purple-500/50 hover:bg-slate-700 hover:text-white hover:scale-105'
                      }
                    `}
                  >
                    <div className="text-base font-semibold">{preset}</div>
                    <div className="text-xs opacity-80">min</div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Custom Duration */}
          <div className="space-y-3">
            <div className="text-sm text-gray-400">Custom duration</div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={duration}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((duration - 5) / 115) * 100}%, #374151 ${((duration - 5) / 115) * 100}%, #374151 100%)`
                }}
              />
              <input
                type="number"
                min="5"
                max="120"
                step="5"
                value={duration}
                onChange={(e) => onDurationChange(parseInt(e.target.value) || 25)}
                className="w-20 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          {/* Duration Display & Context */}
          <div className="text-center p-4 bg-slate-900/30 rounded-xl border border-slate-700/30">
            <div className="text-3xl font-bold text-white mb-2">{duration} minutes</div>
            <div className="text-gray-400 text-sm mb-2">
              {getDurationDescription(duration)}
            </div>
            <div className="text-xs text-purple-300">
              Session will end at {getEndTime(duration)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Button, Error, Validation, Offline States */}
      {/* Offline Banner */}
      {!isOnline && (
        <Card className="bg-orange-900/20 border-orange-500/30 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3 text-orange-300">
              <WifiOff className="w-5 h-5" />
              <span>You're offline. Some features may not work properly.</span>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Validation Feedback */}
      {validationError && (
        <div className="text-center mb-4">
          <p className="text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 inline-block">
            {validationError}
          </p>
        </div>
      )}
      {/* Start Error Feedback */}
      {startError && (
        <Card className="bg-red-900/20 border-red-500/30 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium">Failed to Start Session</p>
                <p className="text-red-400/80 text-sm">{startError}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setStartError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
        <Button
          onClick={handleStart}
          disabled={!selectedBook || duration === 0 || startingSession}
          size="lg"
          className={`
            bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
            text-white text-lg px-12 py-4 h-auto timer-transition hover-lift
            ${selectedBook && duration > 0 && !startingSession ? 'animate-pulse-glow' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          `}
        >
          {startingSession ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 shimmer"></div>
              Starting Session...
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 mr-2" />
              Start Reading Session
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Helper component for book options
const BookOption: React.FC<{ book: Book; onSelect: () => void }> = ({ book, onSelect }) => (
  <button
    onClick={onSelect}
    className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/50 transition-colors text-left"
  >
    <div className="w-8 h-12 bg-slate-700 rounded overflow-hidden flex-shrink-0">
      {book.cover_url ? (
        <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-medium text-white truncate">{book.title}</div>
      {book.author && (
        <div className="text-gray-400 text-sm truncate">{book.author}</div>
      )}
    </div>
  </button>
);
