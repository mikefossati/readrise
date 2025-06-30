import React, { useMemo } from 'react';
import AppLayout from './layout/AppLayout';
import { useBookLibrary } from '../hooks/useBookLibrary';
import { BookCard } from './library/BookCard';
import { LibraryHeader } from './library/LibraryHeader';
import { LibrarySearch } from './library/LibrarySearch';
import { LibraryTabs } from './library/LibraryTabs';
import { LibraryEmptyState } from './library/LibraryEmptyState';
import { Loader2 } from 'lucide-react';

const BookLibrary: React.FC = () => {
  const {
    books,
    filteredBooks,
    loading,
    error,
    searchTerm,
    activeTab,
    setSearchTerm,
    setActiveTab,
    updateBookStatus,
    updateBookRating,
    refreshBooks,
  } = useBookLibrary();

  // Calculate book counts for tabs
  const bookCounts = useMemo(() => {
    const counts = {
      all: books.length,
      want_to_read: 0,
      currently_reading: 0,
      finished: 0,
    };
    books.forEach(book => {
      counts[book.reading_status]++;
    });
    return counts;
  }, [books]);

  if (loading) {
    return (
      <AppLayout currentPage="library">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300 text-lg">Loading your library...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout currentPage="library">
        <div className="text-center py-20">
          <div className="text-red-400 mb-4">Error: {error}</div>
          <button onClick={refreshBooks} className="border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg px-6 py-2 mt-2">
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  const isFiltered = searchTerm.trim() !== '' || activeTab !== 'all';
  const showEmptyState = books.length === 0 || (isFiltered && filteredBooks.length === 0);

  return (
    <AppLayout currentPage="library">
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <LibraryHeader bookCount={books.length} />
          {books.length > 0 && (
            <>
              <LibraryTabs 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                bookCounts={bookCounts}
              />
              <LibrarySearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </>
          )}
          {showEmptyState ? (
            <LibraryEmptyState 
              isFiltered={isFiltered && books.length > 0}
              searchTerm={searchTerm}
              activeTab={activeTab}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredBooks.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onStatusChange={updateBookStatus}
                  onRatingChange={updateBookRating}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default BookLibrary;
