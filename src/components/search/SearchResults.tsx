import React from 'react';
import { BookSearchCard } from './BookSearchCard';
import { BookOpen, Search } from 'lucide-react';

interface SearchResultsProps {
  results: any[];
  query: string;
  loading: boolean;
  hasSearched: boolean;
  addingBooks: Set<string>;
  libraryBookIds: Set<string>;
  onAddBook: (book: any) => Promise<void>;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  loading,
  hasSearched,
  addingBooks,
  libraryBookIds,
  onAddBook,
}) => {
  // Loading state with skeletons
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-slate-800/50 rounded-lg animate-pulse h-80"></div>
        ))}
      </div>
    );
  }

  // No search performed yet
  if (!hasSearched) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">Discover Your Next Great Read</h3>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Search for books by title, author, genre, or any keyword to find your perfect match.
        </p>
      </div>
    );
  }

  // No results found
  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No books found</h3>
        <p className="text-gray-400 mb-6">
          No books match "<span className="text-white font-medium">{query}</span>". Try different keywords or check your spelling.
        </p>
        <div className="text-sm text-gray-500">
          <p>Try searching for:</p>
          <ul className="mt-2 space-y-1">
            <li>• Book titles (e.g., "The Great Gatsby")</li>
            <li>• Author names (e.g., "Stephen King")</li>
            <li>• Genres (e.g., "science fiction")</li>
          </ul>
        </div>
      </div>
    );
  }

  // Results grid
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">
          Found {results.length} books for "<span className="text-purple-400">{query}</span>"
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map(book => (
          <BookSearchCard
            key={book.id}
            book={book}
            isAdded={libraryBookIds.has(book.id)}
            isAdding={addingBooks.has(book.id)}
            onAdd={() => onAddBook(book)}
          />
        ))}
      </div>
    </div>
  );
};
