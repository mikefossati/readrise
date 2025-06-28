import React, { useEffect, useState } from 'react';
import AppLayout from './layout/AppLayout';
import { SessionCompleteModal } from './SessionCompleteModal';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../lib/supabase';
import { Loader2, BookOpen } from 'lucide-react';

// Types for reading session
interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  start_time: string;
  end_time: string | null;
  planned_duration: number | null;
  actual_duration: number | null;
  session_type: 'focused' | 'open';
}

const PRESETS = [15, 25, 45, 60, 90, 120];
const MINUTES_MIN = 1;
const MINUTES_MAX = 180;

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function getTodayDateStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const TIMER_STORAGE_KEY = 'readrise_timer_state';

const ReadingTimer: React.FC = () => {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [achievement, setAchievement] = useState<string | undefined>(undefined);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [duration, setDuration] = useState<number>(25);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [timerState, setTimerState] = useState<'idle'|'running'|'paused'|'finished'>('idle');
  const [remaining, setRemaining] = useState<number>(0);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [session, setSession] = useState<ReadingSession|null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [todayTotal, setTodayTotal] = useState<number>(0);

  // Fetch books with reading_status='currently_reading'
  useEffect(() => {
    if (!user?.id) return;
    setLoadingBooks(true);
    import('../lib/supabase').then(m => m.getBooks(user.id)).then(res => {
      if (res.error) setError(res.error);
      const crBooks = (res.data || []).filter(b => b.reading_status === 'currently_reading');
      setBooks(crBooks);
      setSelectedBook(crBooks[0]?.id || '');
      setLoadingBooks(false);
    });
  }, [user]);

  // Fetch today's total reading time
  useEffect(() => {
    if (!user?.id) return;
    import('../lib/supabase').then(m => m.getRecentSessions(user.id, 100)).then(res => {
      if (res.data) {
        const today = getTodayDateStr();
        const total = res.data.filter(s => s.start_time.startsWith(today) && s.actual_duration)
          .reduce((sum, s) => sum + (s.actual_duration || 0), 0);
        setTodayTotal(total);
      }
    });
  }, [user, timerState]);

  // Restore timer state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.userId === user?.id) {
          setSelectedBook(state.selectedBook);
          setDuration(state.duration);
          setTimerState(state.timerState);
          setRemaining(state.remaining);
          setSession(state.session);
        }
      } catch {}
    }
  }, [user]);

  // Persist timer state
  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
      userId: user.id,
      selectedBook,
      duration,
      timerState,
      remaining,
      session,
    }));
  }, [user, selectedBook, duration, timerState, remaining, session]);

  // Timer logic with Web Worker and performance.now()
  useEffect(() => {
    let timerWorker: Worker | null = null;
    if (timerState === 'running') {
      timerWorker = new Worker(new URL('./timerWorker.js', import.meta.url));
      setWorker(timerWorker);
      timerWorker.postMessage({ type: 'START', payload: { duration: duration * 60 } });
      timerWorker.onmessage = (e: MessageEvent) => {
        const { type, payload } = e.data;
        if (type === 'TICK') setRemaining(payload.remaining);
        if (type === 'DONE') {
          setTimerState('finished');
          handleSessionEnd();
        }
      };
    }
    return () => {
      if (timerWorker) timerWorker.terminate();
    };
  }, [timerState, duration]);

  // Show modal when finished
  useEffect(() => {
    if (timerState === 'finished' && session) {
      setModalOpen(true);
      setShowConfetti(true);
      // Play audio if enabled
      if (audioEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      // Achievement logic (simple demo)
      if (!localStorage.getItem('firstSessionComplete')) {
        setAchievement('First session complete!');
        localStorage.setItem('firstSessionComplete', '1');
      } else if ((session.actual_duration ?? 0) >= 1800) {
        setAchievement('30+ minute session!');
      } else {
        setAchievement(undefined);
      }
    } else {
      setModalOpen(false);
      setShowConfetti(false);
    }
  }, [timerState, session, audioEnabled]);

  const handleStart = async () => {
    if (!selectedBook || !user?.id) return;
    setSessionLoading(true);
    setTimerState('running');
    setRemaining(duration * 60);
    // Create session in Supabase
    try {
      const mod = await import('../lib/supabase');
      const now = new Date().toISOString();
      const { data, error } = await mod.startSession({
        user_id: user.id,
        book_id: selectedBook,
        start_time: now,
        planned_duration: duration,
        session_type: 'focused',
        notes: null,
        mood: null,
      });
      if (error) setError(error);
      if (data !== null && typeof data.planned_duration === 'number') setSession(data);
    } catch (e) {
      setError('Failed to start session.');
    }
    setSessionLoading(false);
  };

  const handlePause = () => {
    setTimerState('paused');
    if (worker) worker.postMessage({ type: 'PAUSE' });
  };

  const handleResume = () => {
    setTimerState('running');
    if (worker) worker.postMessage({ type: 'RESUME' });
  };

  const handleStop = () => {
    if (window.confirm('End session early? Your progress will be saved.')) {
      setTimerState('finished');
      if (worker) worker.postMessage({ type: 'STOP' });
      handleSessionEnd();
    }
  };

  const handleReset = () => {
    setTimerState('idle');
    setRemaining(0);
    setSession(null);
    setCustomDuration('');
  };

  // End session in Supabase
  const handleSessionEnd = async (opts?: { mood?: string, notes?: string }) => {
    if (!session) return;
    try {
      const mod = await import('../lib/supabase');
      const end = new Date().toISOString();
      const actual = (duration * 60) - remaining;
      await mod.endSession(session.id, end, actual, remaining <= 0, opts?.mood, opts?.notes);
    } catch (e) {
      setError('Failed to end session.');
    }
  };

  // Save mood/notes to session
  const handleModalClose = async () => {
    await handleSessionEnd({ mood, notes });
    setModalOpen(false);
    setMood('');
    setNotes('');
    setAchievement(undefined);
    setShowConfetti(false);
  };

  // Quick actions
  const handleStartAnother = async () => {
    await handleModalClose();
    handleReset();
  };
  const handleGoLibrary = () => { window.location.href = '/library'; };
  const handleGoDashboard = () => { window.location.href = '/dashboard'; };


  // Handle custom duration input
  const handleCustomDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomDuration(val);
    const num = parseInt(val, 10);
    if (num >= MINUTES_MIN && num <= MINUTES_MAX) setDuration(num);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (timerState === 'running' && e.code === 'Space') {
        e.preventDefault();
        handlePause();
      } else if (timerState === 'paused' && e.code === 'Space') {
        e.preventDefault();
        handleResume();
      } else if ((timerState === 'running' || timerState === 'paused') && e.code === 'Escape') {
        e.preventDefault();
        handleStop();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [timerState, worker]);

  // Page Visibility API
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && timerState === 'running') {
        handlePause();
      } else if (!document.hidden && timerState === 'paused') {
        handleResume();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [timerState, worker]);

  // Browser notification on complete
  useEffect(() => {
    if (timerState === 'finished' && Notification && Notification.permission === 'granted') {
      new Notification('Reading session complete!', { body: 'Great job! 🎉' });
    }
  }, [timerState]);

  // Progress ring (SVG)
  const progress = duration > 0 ? (remaining / (duration * 60)) : 1;
  const radius = 90;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - progress);

  // Mobile wake lock (placeholder, needs async API)
  // let wakeLock: any; // Uncomment and use navigator.wakeLock.request('screen') for advanced mobile support

  return (
    <AppLayout currentPage="timer">
      <audio ref={audioRef} src="/session-complete.mp3" preload="auto" />
      <SessionCompleteModal
        open={modalOpen}
        bookTitle={books.find(b => b.id === session?.book_id)?.title || ''}
        plannedMinutes={session?.planned_duration || duration}
        actualMinutes={Math.round((session?.actual_duration ?? ((duration * 60) - remaining)) / 60)}
        mood={mood}
        notes={notes}
        onMoodChange={setMood}
        onNotesChange={setNotes}
        onStartAnother={handleStartAnother}
        onGoLibrary={handleGoLibrary}
        onGoDashboard={handleGoDashboard}
        onClose={handleModalClose}
        achievement={achievement}
        showConfetti={showConfetti}
        audioEnabled={audioEnabled}
        onAudioToggle={() => setAudioEnabled(a => !a)}
      />
      <div className="max-w-xl mx-auto my-8">
        <Card className="p-6 bg-gradient-to-br from-slate-900/90 to-purple-900/80 border-0 shadow-xl">
          {loadingBooks ? (
            <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin mr-2" /> Loading...</div>
          ) : books.length === 0 ? (
            <div className="text-center text-gray-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              No books marked as 'Currently Reading'. <a href="/library" className="text-purple-400 underline">Go to Library</a>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Select Book</label>
              <select
                className="w-full rounded-lg bg-slate-800/80 border border-slate-700/50 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={selectedBook}
                disabled={timerState !== 'idle'}
                onChange={e => setSelectedBook(e.target.value)}
              >
                {books.map(b => (
                  <option key={b.id} value={b.id}>{b.title} {b.author ? `by ${b.author}` : ''}</option>
                ))}
              </select>
            </div>
          )}
          {/* Timer controls */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {PRESETS.map(p => (
              <Button key={p} size="sm" variant={duration === p ? 'default' : 'secondary'} disabled={timerState !== 'idle'} onClick={() => setDuration(p)}>{p} min</Button>
            ))}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Custom (min)"
              value={customDuration}
              onChange={handleCustomDuration}
              disabled={timerState !== 'idle'}
              className="w-24 px-2 py-1 rounded bg-slate-700/60 border border-slate-700/50 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={3}
            />
          </div>

          {/* Circular progress timer */}
          <div className="flex flex-col items-center my-6">
            <svg width={200} height={200} className="block">
              <circle cx={100} cy={100} r={radius} fill="none" stroke="#312e81" strokeWidth={16} />
              <circle
                cx={100}
                cy={100}
                r={radius}
                fill="none"
                stroke="url(#timer-gradient)"
                strokeWidth={14}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              />
              <defs>
                <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <text
                x="100"
                y="115"
                textAnchor="middle"
                fontSize="2.5rem"
                fill="#f3f4f6"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
              </text>
            </svg>
          </div>

          {/* Timer action buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {timerState === 'idle' && (
              <Button size="lg" onClick={handleStart} disabled={!selectedBook || sessionLoading}>Start</Button>
            )}
            {timerState === 'running' && (
              <>
                <Button size="lg" variant="secondary" onClick={handlePause}>Pause</Button>
                <Button size="lg" variant="destructive" onClick={handleStop}>Stop</Button>
              </>
            )}
            {timerState === 'paused' && (
              <>
                <Button size="lg" onClick={handleResume}>Resume</Button>
                <Button size="lg" variant="destructive" onClick={handleStop}>Stop</Button>
              </>
            )}
            {(timerState === 'paused' || timerState === 'finished') && (
              <Button size="lg" variant="ghost" onClick={handleReset}>Reset</Button>
            )}
          </div>

          {/* Session stats */}
          <div className="flex flex-col items-center gap-2 text-sm text-gray-300">
            <div>Current session: {pad(Math.floor(((duration * 60) - remaining)/60))}:{pad(((duration * 60) - remaining)%60)}</div>
            <div>Today's total: {Math.floor(todayTotal/60)} min {todayTotal%60} sec</div>
          </div>

          {/* Error message */}
          {error && <div className="text-center text-red-400 mt-4">{error}</div>}
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReadingTimer;
