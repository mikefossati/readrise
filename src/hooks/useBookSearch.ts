import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { addBook, getBooks } from '../lib/supabase';
import type { Book } from '../lib/supabase';

export interface BookSearchResult {
  id: string;
  title: string;
  authors: string[];
  description: string;
  cover: string | null;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
}

interface UseBookSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: BookSearchResult[];
  loading: boolean;
  error: string | null;
  addingBooks: Set<string>;
  libraryBookIds: Set<string>;
  addBookToLibrary: (book: BookSearchResult) => Promise<void>;
  clearResults: () => void;
  hasSearched: boolean;
}

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export function useBookSearch(): UseBookSearchReturn {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingBooks, setAddingBooks] = useState<Set<string>>(new Set());
  const [libraryBookIds, setLibraryBookIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fetch library books to prevent duplicates
  useEffect(() => {
    if (!user?.id) return;
    getBooks(user.id).then(res => {
      if (res.data) {
        const ids = new Set<string>(res.data.map(book => {
  if ('google_id' in book && typeof book.google_id === 'string') return book.google_id;
  if ('id' in book && typeof book.id === 'string') return book.id;
  return `${book.title}-${book.author}`;
}));
        setLibraryBookIds(ids);
      }
    });
  }, [user?.id]);

  // Search books
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    const searchBooks = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response = await fetch(
          `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(debouncedQuery)}&maxResults=24&printType=books`,
          { signal: abortControllerRef.current.signal }
        );
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }
        const data = await response.json();
        if (!data.items) {
          setResults([]);
          return;
        }
        const books: BookSearchResult[] = data.items
          .filter((item: any) => item.volumeInfo.title)
          .map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || ['Unknown Author'],
            description: item.volumeInfo.description || '',
            cover: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
            publishedDate: item.volumeInfo.publishedDate,
            pageCount: item.volumeInfo.pageCount,
            categories: item.volumeInfo.categories,
            averageRating: item.volumeInfo.averageRating,
            ratingsCount: item.volumeInfo.ratingsCount,
          }));
        setResults(books);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError('Failed to search books. Please try again.');
          console.error('Book search error:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    searchBooks();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  const addBookToLibrary = useCallback(async (book: BookSearchResult) => {
    if (!user?.id) return;
    const bookKey = book.id;
    if (libraryBookIds.has(bookKey) || addingBooks.has(bookKey)) return;
    setAddingBooks(prev => new Set(prev).add(bookKey));
    try {
      const newBook = {
        user_id: user.id,
        title: book.title,
        author: book.authors.join(', '),
        cover_url: book.cover,
        google_id: book.id,
        cover_color: null,
        rating: null,
        reading_status: 'want_to_read' as Book['reading_status'],
        total_reading_time: null,
      };
      const result = await addBook(newBook);
      if (result.error) {
        throw new Error(result.error.message || 'Failed to add book');
      }
      setLibraryBookIds(prev => new Set(prev).add(bookKey));
    } catch (err) {
      console.error('Failed to add book:', err);
      throw err;
    } finally {
      setAddingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookKey);
        return newSet;
      });
    }
  }, [user?.id, libraryBookIds, addingBooks]);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
    setHasSearched(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    addingBooks,
    libraryBookIds,
    addBookToLibrary,
    clearResults,
    hasSearched,
  };
}
