import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBooks, supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../lib/supabase';

interface UseBookLibraryReturn {
  books: Book[];
  filteredBooks: Book[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  activeTab: string;
  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: string) => void;
  updateBookStatus: (bookId: string, status: Book['reading_status']) => Promise<void>;
  updateBookRating: (bookId: string, rating: number) => Promise<void>;
  refreshBooks: () => Promise<void>;
}

export function useBookLibrary(): UseBookLibraryReturn {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch books
  const fetchBooks = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await getBooks(user.id);
      if (res.error) {
        throw new Error(res.error.message || 'Unknown error');
      }
      
      const sortedBooks = (res.data || []).sort((a, b) => {
        // Currently reading first, then alphabetical
        if (a.reading_status === 'currently_reading' && b.reading_status !== 'currently_reading') return -1;
        if (a.reading_status !== 'currently_reading' && b.reading_status === 'currently_reading') return 1;
        return (a.title || '').localeCompare(b.title || '');
      });
      
      setBooks(sortedBooks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Optimistic status update
  const updateBookStatus = useCallback(async (bookId: string, newStatus: Book['reading_status']) => {
    // Optimistic update
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, reading_status: newStatus } : book
    ));

    try {
      const { error } = await supabase
        .from('books')
        .update({ reading_status: newStatus })
        .eq('id', bookId);
      
      if (error) throw error;
    } catch (err) {
      // Rollback on error
      setError('Failed to update book status');
      await fetchBooks(); // Refresh to get correct state
    }
  }, [fetchBooks]);

  // Optimistic rating update
  const updateBookRating = useCallback(async (bookId: string, rating: number) => {
    // Optimistic update
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, rating } : book
    ));

    try {
      const { error } = await supabase
        .from('books')
        .update({ rating })
        .eq('id', bookId);
      
      if (error) throw error;
    } catch (err) {
      setError('Failed to update book rating');
      await fetchBooks(); // Refresh to get correct state
    }
  }, [fetchBooks]);

  // Memoized filtered books
  const filteredBooks = useMemo(() => {
    let filtered = books;
    
    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(book => book.reading_status === activeTab);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchLower) ||
        (book.author && book.author.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [books, activeTab, searchTerm]);

  return {
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
    refreshBooks: fetchBooks,
  };
}
