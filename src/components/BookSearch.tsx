import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import AppLayout from './layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes?q=';

// Import Book type for correct typing
import type { Book } from '../lib/supabase';

interface BookResult {
  id: string;
  title: string;
  authors: string[];
  description: string;
  cover: string | null;
}

const BookSearch = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [libraryIds, setLibraryIds] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch library book IDs to prevent duplicates
  useEffect(() => {
    if (!user?.id) return;
    import('../lib/supabase').then(m => m.getBooks(user.id)).then(res => {
      const ids = (res.data || []).map((b: any) => b.google_id || b.title + b.author);
      setLibraryIds(ids);
    });
  }, [user]);

  // Fetch from Google Books API
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(GOOGLE_BOOKS_API + encodeURIComponent(debouncedQuery))
      .then(res => res.json())
      .then(data => {
        if (!data.items) {
          setResults([]);
          setError(null);
          setLoading(false);
          return;
        }
        setResults(
          data.items.map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || [],
            description: item.volumeInfo.description || '',
            cover: item.volumeInfo.imageLinks?.thumbnail || null,
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch books. Try again later.');
        setLoading(false);
      });
  }, [debouncedQuery]);

  // Add book to Supabase
  const handleAdd = async (book: BookResult) => {
    if (!user?.id) return;
    setAddedIds(ids => [...ids, book.id]);
    // Prevent duplicates by checking libraryIds
    const isDuplicate = libraryIds.includes(book.id);
    if (isDuplicate) return;
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
    const mod = await import('../lib/supabase');
    await mod.addBook(newBook);
    setLibraryIds(ids => [...ids, book.id]);
  };

  // UI
  return (
    <AppLayout currentPage="search">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Search for Books
        </h1>
        <div className="mb-6 flex flex-col md:flex-row gap-3 items-center justify-center">
          <input
            type="text"
            className="w-full md:w-96 px-4 py-3 rounded-lg bg-slate-800/60 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg text-white placeholder-gray-400 shadow"
            placeholder="Find your next read..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        {error && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 text-red-400 bg-red-900/30 px-4 py-2 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}
        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg bg-slate-800/70 animate-pulse h-64"></div>
            ))}
          </div>
        )}
        {/* Empty state */}
        {!loading && debouncedQuery && results.length === 0 && !error && (
          <div className="text-center text-gray-400 mt-12">No books found for "{debouncedQuery}"</div>
        )}
        {/* Results grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {results.map(book => {
            const isAdded = libraryIds.includes(book.id) || addedIds.includes(book.id);
            return (
              <Card
                key={book.id}
                className="bg-gradient-to-br from-slate-800/70 to-purple-900/60 border-slate-700/50 flex flex-col h-64 justify-between"
              >
                <CardHeader className="p-3 pb-0 flex flex-row gap-2 items-center">
                  <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden bg-slate-700 flex items-center justify-center">
                    {book.cover ? (
                      <img src={book.cover} alt={book.title} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-gray-500 text-xs">No Cover</span>
                    )}
                  </div>
                  <div className="ml-2 flex-1">
                    <CardTitle className="text-base font-semibold line-clamp-2 text-white">
                      {book.title}
                    </CardTitle>
                    <div className="text-xs text-purple-300 font-medium line-clamp-1">
                      {book.authors.join(', ')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-2 pt-1 flex-1 flex flex-col">
                  <div className="text-xs text-gray-300 line-clamp-3 mb-2 flex-1">
                    {book.description}
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3 py-1 rounded"
                      disabled={isAdded}
                      onClick={() => handleAdd(book)}
                    >
                      {isAdded ? (
                        <span className="flex items-center gap-1 text-green-300"><CheckCircle className="w-4 h-4" /> Added</span>
                      ) : (
                        <span className="flex items-center gap-1"><Plus className="w-4 h-4" /> Add to Library</span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default BookSearch;
