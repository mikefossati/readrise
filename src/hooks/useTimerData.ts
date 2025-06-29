import { useState, useEffect, useCallback } from "react";
import { getBooks, getRecentSessions } from "../lib/supabase";
import type { Book, ReadingSession } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface UseTimerDataReturn {
  books: Book[];
  loadingBooks: boolean;
  error: string | null;
  todayTotal: number;
  recentSessions: ReadingSession[];
  refreshData: () => Promise<void>;
}

export function useTimerData(): UseTimerDataReturn {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [recentSessions, setRecentSessions] = useState<ReadingSession[]>([]);

  // Enhanced refresh function
  const refreshData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingBooks(true);
    setError(null);
    try {
      const [booksRes, sessionsRes] = await Promise.all([
        getBooks(user.id),
        getRecentSessions(user.id, 100)
      ]);
      if (booksRes.error) {
        throw new Error(booksRes.error);
      }
      if (sessionsRes.error) {
        throw new Error(sessionsRes.error);
      }
      // Process books
      const allBooks = booksRes.data || [];
      allBooks.sort((a, b) => {
        if (a.reading_status === 'currently_reading' && b.reading_status !== 'currently_reading') return -1;
        if (a.reading_status !== 'currently_reading' && b.reading_status === 'currently_reading') return 1;
        return (a.title || '').localeCompare(b.title || '');
      });
      setBooks(allBooks);
      // Process sessions
      const sessions = sessionsRes.data || [];
      setRecentSessions(sessions);
      // Calculate today's total
      const today = new Date().toISOString().slice(0, 10);
      const todaySessions = sessions.filter(s => 
        s.start_time.startsWith(today) && s.actual_duration
      );
      const total = todaySessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0);
      setTodayTotal(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoadingBooks(false);
    }
  }, [user?.id]);

  // Fetch books
  useEffect(() => {
    if (!user?.id) return;
    
    setLoadingBooks(true);
    setError(null);
    
    getBooks(user.id)
      .then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          const allBooks = res.data || [];
          // Sort: 'currently_reading' first, then others alphabetically
          allBooks.sort((a, b) => {
            if (a.reading_status === 'currently_reading' && b.reading_status !== 'currently_reading') return -1;
            if (a.reading_status !== 'currently_reading' && b.reading_status === 'currently_reading') return 1;
            return (a.title || '').localeCompare(b.title || '');
          });
          setBooks(allBooks);
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch books');
      })
      .finally(() => {
        setLoadingBooks(false);
      });
  }, [user?.id]);

  // Fetch recent sessions and calculate today's total
  useEffect(() => {
    if (!user?.id) return;

    getRecentSessions(user.id, 100)
      .then(res => {
        if (res.data) {
          setRecentSessions(res.data);
          
          // Calculate today's total reading time
          const today = new Date().toISOString().slice(0, 10);
          const todaySessions = res.data.filter(s => 
            s.start_time.startsWith(today) && s.actual_duration
          );
          const total = todaySessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0);
          setTodayTotal(total);
        }
      })
      .catch(err => {
        console.error('Failed to fetch recent sessions:', err);
      });
  }, [user?.id]);

  return {
    books,
    loadingBooks,
    error,
    todayTotal,
    recentSessions,
    refreshData,
  };
}