import React from 'react';
import AppLayout from './layout/AppLayout';
import { useBookSearch } from '../hooks/useBookSearch';
import { SearchInput } from './search/SearchInput';
import { SearchResults } from './search/SearchResults';
import { AlertTriangle } from 'lucide-react';

const BookSearch: React.FC = () => {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    addingBooks,
    libraryBookIds,
    addBookToLibrary,
    hasSearched,
  } = useBookSearch();

  return (
    <AppLayout currentPage="search">
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Discover Books
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Find your next favorite book from millions of titles
            </p>
            
            <SearchInput
              query={query}
              onQueryChange={setQuery}
              loading={loading}
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3 text-red-400 bg-red-900/30 px-6 py-4 rounded-xl border border-red-500/30">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Results */}
          <SearchResults
            results={results}
            query={query}
            loading={loading}
            hasSearched={hasSearched}
            addingBooks={addingBooks}
            libraryBookIds={libraryBookIds}
            onAddBook={addBookToLibrary}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default BookSearch;
