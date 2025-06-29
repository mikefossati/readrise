import React from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import type { Book } from '../../lib/supabase';

interface BookSelectorProps {
  books: Book[];
  selectedBook: string;
  onBookChange: (bookId: string) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
}

export const BookSelector: React.FC<BookSelectorProps> = ({
  books,
  selectedBook,
  onBookChange,
  disabled = false,
  loading = false,
  error,
}) => {
  if (loading) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Select Book
        </label>
        <div className="flex items-center justify-center h-10 rounded-lg bg-slate-800/80 border border-slate-700/50">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-gray-400">Loading books...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Select Book
        </label>
        <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Select Book
        </label>
        <div className="text-center text-gray-400 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-400" />
          <p>No books in your library yet.</p>
          <a 
            href="/search" 
            className="text-purple-400 underline hover:text-purple-300"
          >
            Add books to get started
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Select Book
      </label>
      <select
        className="w-full rounded-lg bg-slate-800/80 border border-slate-700/50 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        value={selectedBook}
        onChange={(e) => onBookChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Choose a book...</option>
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.title} {book.author ? `by ${book.author}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
