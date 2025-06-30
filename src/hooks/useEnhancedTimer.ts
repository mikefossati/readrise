import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBooks, startSession, endSession, getRecentSessions } from '../lib/supabase';
import type { Book, ReadingSession } from '../lib/supabase';

type TimerState = 'setup' | 'ready' | 'running' | 'paused' | 'completed';

interface UseEnhancedTimerReturn {
  timerState: TimerState;
  selectedBook: Book | null;
  duration: number;
  remaining: number;
  progress: number;
  books: Book[];
  loadingBooks: boolean;
  currentSession: ReadingSession | null;
  setSelectedBook: (book: Book | null) => void;
  setDuration: (duration: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  completeSession: (sessionData?: { mood?: string; notes?: string; pagesRead?: number }) => Promise<void>;
  startingSession: boolean;
  completingSession: boolean;
  error: string | null;
  clearError: () => void;
  readingStats: {
    todayMinutes: number;
    weeklyMinutes: number;
    currentStreak: number;
    averageSessionLength: number;
    totalSessions: number;
  };
}


export function useEnhancedTimer(): UseEnhancedTimerReturn {
  const { user } = useAuth();
  const [timerState, setTimerState] = useState<TimerState>('setup');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [currentSession, setCurrentSession] = useState<ReadingSession | null>(null);
  const [startingSession, setStartingSession] = useState(false);
  const [completingSession, setCompletingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const startTimeRef = useRef<number>(0);

  // Reading stats state
  const [readingStats, setReadingStats] = useState({
    todayMinutes: 0,
    weeklyMinutes: 0,
    currentStreak: 0,
    averageSessionLength: 0,
    totalSessions: 0,
  });

  useEffect(() => {
    if (!user?.id) return;
    setLoadingBooks(true);
    getBooks(user.id)
      .then((result: import('../types/Result').Result<Book[]>) => {
        if (!result.ok) {
          setError(result.error.message);
        } else {
          const sortedBooks = (result.data || []).sort((a, b) => {
            if (a.reading_status === 'currently_reading' && b.reading_status !== 'currently_reading') return -1;
            if (a.reading_status !== 'currently_reading' && b.reading_status === 'currently_reading') return 1;
            return a.title.localeCompare(b.title);
          });
          setBooks(sortedBooks);
          const currentlyReading = sortedBooks.find(b => b.reading_status === 'currently_reading');
          if (currentlyReading && !selectedBook) {
            setSelectedBook(currentlyReading);
          }
        }
        setLoadingBooks(false);
      }).finally(() => setLoadingBooks(false));
  }, [user?.id, selectedBook]);

  // Fetch reading stats
  useEffect(() => {
    if (!user?.id) return;
    const fetchStats = async () => {
      try {
        const { data: sessions } = await getRecentSessions(user.id, 100);
        if (sessions) {
          const now = new Date();
          const today = now.toISOString().slice(0, 10);
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 7);

          const completedSessions = sessions.filter(s => s.completed && s.actual_duration);

          // Calculate stats
          const todayMinutes = completedSessions
            .filter(s => s.start_time.startsWith(today))
            .reduce((sum, s) => sum + (s.actual_duration || 0), 0) / 60;

          const weeklyMinutes = completedSessions
            .filter(s => new Date(s.start_time) >= weekStart)
            .reduce((sum, s) => sum + (s.actual_duration || 0), 0) / 60;

          const averageSessionLength = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0) / completedSessions.length / 60
            : 0;

          // Calculate streak (simplified)
          const calculateStreak = (sessions: any[]): number => {
            const uniqueDates = [...new Set(sessions.map(s => s.start_time.slice(0, 10)))].sort();
            let streak = 0;
            const today = new Date().toISOString().slice(0, 10);
            if (uniqueDates.includes(today)) {
              streak = 1;
              for (let i = uniqueDates.length - 2; i >= 0; i--) {
                const prevDate = new Date(uniqueDates[i]);
                const nextDate = new Date(uniqueDates[i + 1]);
                const dayDiff = (nextDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
                if (dayDiff === 1) streak++;
                else break;
              }
            }
            return streak;
          };

          const currentStreak = calculateStreak(completedSessions);

          setReadingStats({
            todayMinutes: Math.round(todayMinutes),
            weeklyMinutes: Math.round(weeklyMinutes),
            currentStreak,
            averageSessionLength: Math.round(averageSessionLength),
            totalSessions: completedSessions.length,
          });
        }
      } catch (error) {
        console.error('Failed to fetch reading stats:', error);
      }
    };
    fetchStats();
  }, [user?.id]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedBook && duration > 0 && timerState === 'setup') {
      setTimerState('ready');
      setRemaining(duration * 60);
      setProgress(1);
    }
  }, [selectedBook, duration, timerState]);

  const startTimer = useCallback(async () => {
    if (!selectedBook || !user?.id) return;
    setStartingSession(true);
    setError(null);
    try {
      const sessionData = {
        user_id: user.id,
        book_id: selectedBook.id,
        start_time: new Date().toISOString(),
        planned_duration: duration * 60,
        session_type: 'focused' as const,
        notes: null,
        mood: null,
      };
      const result = await startSession(sessionData);
      if ((result as { error?: string | { message: string } }).error) throw new Error(typeof (result as any).error === 'string' ? (result as any).error : (result as any).error.message);
      setCurrentSession(result.data!);
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      const worker = new Worker(new URL('../components/timerWorker.js', import.meta.url));
      workerRef.current = worker;
      startTimeRef.current = Date.now();
      worker.postMessage({ type: 'START', payload: { duration: duration * 60 } });
      worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'TICK') {
          setRemaining(payload.remaining);
          setProgress(payload.remaining / (duration * 60));
        } else if (type === 'DONE') {
          setTimerState('completed');
        }
      };
      setTimerState('running');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setStartingSession(false);
    }
  }, [selectedBook, user?.id, duration]);

  const pauseTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'PAUSE' });
    }
    setTimerState('paused');
  }, []);

  const resumeTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESUME' });
    }
    setTimerState('running');
  }, []);

  const stopTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'STOP' });
    }
    setTimerState('completed');
  }, []);

  const resetTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setTimerState('setup');
    setCurrentSession(null);
    setRemaining(0);
    setProgress(0);
    setError(null);
  }, []);

  const completeSession = useCallback(async (sessionData?: { mood?: string; notes?: string; pagesRead?: number }) => {
    if (!currentSession) return;
    setCompletingSession(true);
    try {
      const actualDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
      const endTime = new Date().toISOString();
      await endSession(
        currentSession.id,
        endTime,
        actualDuration,
        true,
        sessionData?.mood,
        sessionData?.notes
      );
      resetTimer();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete session');
    } finally {
      setCompletingSession(false);
    }
  }, [currentSession, resetTimer]);

  const clearError = useCallback(() => setError(null), []);

  return {
    timerState,
    selectedBook,
    duration,
    remaining,
    progress,
    books,
    loadingBooks,
    currentSession,
    setSelectedBook,
    setDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    completeSession,
    startingSession,
    completingSession,
    error,
    clearError,
    readingStats,
  };
}
