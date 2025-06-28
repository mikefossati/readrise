import React, { useEffect, useState, useRef } from 'react';
import AppLayout from './layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Loader2, Search as SearchIcon, CheckCircle, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { StarRating } from './StarRating';
import type { Book } from '../lib/supabase';

const STATUS_TABS = [
  { key: 'all', label: 'All Books' },
  { key: 'want_to_read', label: 'Want to Read' },
  { key: 'currently_reading', label: 'Currently Reading' },
  { key: 'finished', label: 'Finished' },
];

const STATUS_COLORS: Record<string, string> = {
  want_to_read: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  currently_reading: 'bg-orange-600/20 text-orange-300 border-orange-600/30',
  finished: 'bg-green-600/20 text-green-300 border-green-600/30',
};

function getStatusLabel(status: Book['reading_status']) {
  switch (status) {
    case 'want_to_read': return 'Want to Read';
    case 'currently_reading': return 'Currently Reading';
    case 'finished': return 'Finished';
    default: return 'Unknown';
  }
}

const BookLibrary: React.FC = () => {
  const [ratingLoading, setRatingLoading] = useState<{[id:string]:boolean}>({});
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [filtered, setFiltered] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusDropdown, setStatusDropdown] = useState<{[id:string]:boolean}>({});
  const debounceRef = useRef<NodeJS.Timeout|null>(null);

  // Fetch books
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    import('../lib/supabase').then(m => m.getBooks(user.id)).then(res => {
      setBooks(res.data || []);
      setLoading(false);
      setError(res.error);
    });
  }, [user]);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Filter books
  useEffect(() => {
    let filteredBooks = books;
    if (tab !== 'all') {
      filteredBooks = filteredBooks.filter(b => b.reading_status === tab);
    }
    if (debouncedSearch) {
      filteredBooks = filteredBooks.filter(
        b => b.title.toLowerCase().includes(debouncedSearch) ||
             (b.author && b.author.toLowerCase().includes(debouncedSearch))
      );
    }
    setFiltered(filteredBooks);
  }, [books, tab, debouncedSearch]);

  // Update status handler
  const handleStatusChange = async (bookId: string, newStatus: Book['reading_status']) => {
    setBooks(bs => bs.map(b => b.id === bookId ? { ...b, reading_status: newStatus } : b));
    setStatusDropdown(d => ({ ...d, [bookId]: false }));
    try {
      const mod = await import('../lib/supabase');
      await mod.supabase.from('books').update({ reading_status: newStatus }).eq('id', bookId);
    } catch (e) {
      setError('Failed to update status.');
    }
  };

  const handleRatingChange = async (bookId: string, rating: number) => {
    setRatingLoading(r => ({ ...r, [bookId]: true }));
    setBooks(bs => bs.map(b => b.id === bookId ? { ...b, rating } : b));
    try {
      const mod = await import('../lib/supabase');
      await mod.updateBookRating(bookId, rating);
    } catch (e) {
      setError('Failed to update rating.');
    }
    setRatingLoading(r => ({ ...r, [bookId]: false }));
  };

  return (
    <AppLayout currentPage="library">
      <div className="max-w-6xl mx-auto px-2 md:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            My Library <span className="text-purple-400">({books.length} books)</span>
          </h1>
          <div className="flex gap-2 mt-2 md:mt-0">
            {STATUS_TABS.map(t => (
              <Button
                key={t.key}
                className={`rounded-full px-4 py-1 text-sm font-semibold transition-all ${tab===t.key ? 'bg-purple-600 text-white' : 'bg-slate-700/60 text-gray-300 hover:bg-purple-700/60'}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base text-white placeholder-gray-400 shadow"
              placeholder="Search by title or author..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <SearchIcon className="absolute right-3 top-2.5 w-5 h-5 text-purple-400 pointer-events-none" />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="animate-spin w-8 h-8 text-purple-400" />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-8">{error}</div>
        ) : books.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <div className="mb-2">No books in your library yet.</div>
            <Button onClick={() => window.location.href='/search'} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 mt-4">
              <Plus className="w-4 h-4 mr-2" /> Add Books
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <div>No books match your search or filter.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(book => (
              <Card key={book.id} className="bg-gradient-to-br from-slate-800/70 to-purple-900/60 border-slate-700/50 flex flex-col h-full justify-between">
                <CardHeader className="flex flex-row gap-2 items-center pb-0">
                  <div className="flex-shrink-0 w-14 h-20 rounded overflow-hidden bg-slate-700 flex items-center justify-center"
                    style={book.cover_url ? {} : { background: book.cover_color || 'linear-gradient(135deg, #7f53ac 0%, #657ced 100%)' }}>
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-gray-400 text-xs">No Cover</span>
                    )}
                  </div>
                  <div className="ml-2 flex-1">
  <CardTitle className="text-base font-semibold line-clamp-2 text-white">
    {book.title}
  </CardTitle>
  <div className="text-xs text-purple-300 font-medium line-clamp-1">
    {book.author}
  </div>
  <div className="mt-1">
    <StarRating
  value={typeof book.rating === 'number' ? book.rating : 0}
  onChange={rating => handleRatingChange(book.id, rating)}
  disabled={ratingLoading[book.id]}
  size={22}
/>
    {ratingLoading[book.id] && (
      <span className="ml-2 text-xs text-gray-400 animate-pulse">Saving...</span>
    )}
  </div>
</div>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-2">
                  <div className="relative">
                    <Badge
                      className={`cursor-pointer px-3 py-1 rounded-full border ${STATUS_COLORS[book.reading_status] || 'bg-slate-700/40 text-gray-300 border-slate-700/60'}`}
                      onClick={() => setStatusDropdown(d => ({ ...d, [book.id]: !d[book.id] }))}
                    >
                      {getStatusLabel(book.reading_status)}
                      {statusDropdown[book.id] ? <ChevronUp className="inline ml-1 w-4 h-4" /> : <ChevronDown className="inline ml-1 w-4 h-4" />}
                    </Badge>
                    {statusDropdown[book.id] && (
                      <div className="absolute left-0 z-10 mt-2 w-40 bg-slate-900 border border-slate-700 rounded shadow-lg">
                        {['want_to_read','currently_reading','finished'].map(s => (
                          <div
                            key={s}
                            className={`px-4 py-2 hover:bg-purple-800/40 cursor-pointer text-sm ${book.reading_status === s ? 'text-purple-400 font-semibold' : 'text-gray-200'}`}
                            onClick={() => handleStatusChange(book.id, s as Book['reading_status'])}
                          >
                            {getStatusLabel(s as Book['reading_status'])}
                            {book.reading_status === s && <CheckCircle className="inline ml-2 w-4 h-4 text-green-400" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default BookLibrary;
