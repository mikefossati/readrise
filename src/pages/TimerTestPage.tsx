import { useState } from 'react';
import { TimerDisplay, TimerControls, BookSelector, DurationSelector, TimerStats } from '../components/timer';
import type { Book } from '../lib/supabase';

const mockBooks: Book[] = [
  { id: '1', user_id: 'u1', title: 'Atomic Habits', author: 'James Clear', cover_url: null, cover_color: null, rating: null, reading_status: 'currently_reading', total_reading_time: null },
  { id: '2', user_id: 'u1', title: 'Deep Work', author: 'Cal Newport', cover_url: null, cover_color: null, rating: null, reading_status: 'want_to_read', total_reading_time: null },
];

export default function TimerTestPage() {
  // TimerDisplay state
  const [remaining, setRemaining] = useState(1500); // 25 min
  const [progress, setProgress] = useState(0.5);
  // TimerControls state
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');
  // BookSelector state
  const [selectedBook, setSelectedBook] = useState('');
  const [books, setBooks] = useState<Book[]>(mockBooks);
  // DurationSelector state
  const [duration, setDuration] = useState(25);
  // TimerStats state
  const [todayTotalMinutes, setTodayTotalMinutes] = useState(3600); // 1 hr
  const [weeklyMinutes] = useState(200);
  const [currentStreak] = useState(3);
  const [averageSessionLength] = useState(20);
  const [totalSessions] = useState(42);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center gap-10">
      <h1 className="text-2xl font-bold mb-4">Timer Components Test Page</h1>

      {/* TimerDisplay */}
      <section className="w-full max-w-md bg-slate-800 rounded-xl p-6 mb-6 shadow-md flex flex-col items-center">
        <h2 className="font-semibold mb-2">TimerDisplay</h2>
        <TimerDisplay remaining={remaining} progress={progress} />
        <div className="flex gap-2 mt-4">
          <button onClick={() => setRemaining((r) => Math.max(0, r - 60))} className="bg-blue-700 px-3 py-1 rounded">-1 min</button>
          <button onClick={() => setRemaining((r) => r + 60)} className="bg-blue-700 px-3 py-1 rounded">+1 min</button>
          <button onClick={() => setProgress((p) => Math.max(0, p - 0.05))} className="bg-purple-700 px-3 py-1 rounded">-5%</button>
          <button onClick={() => setProgress((p) => Math.min(1, p + 0.05))} className="bg-purple-700 px-3 py-1 rounded">+5%</button>
        </div>
      </section>

      {/* TimerControls */}
      <section className="w-full max-w-md bg-slate-800 rounded-xl p-6 mb-6 shadow-md flex flex-col items-center">
        <h2 className="font-semibold mb-2">TimerControls</h2>
        <TimerControls
          timerState={timerState}
          onStart={() => setTimerState('running')}
          onPause={() => setTimerState('paused')}
          onResume={() => setTimerState('running')}
          onStop={() => setTimerState('finished')}
          onReset={() => setTimerState('idle')}
        />
        <div className="flex gap-2 mt-4">
          <button onClick={() => setTimerState('idle')} className="bg-gray-700 px-3 py-1 rounded">Idle</button>
          <button onClick={() => setTimerState('running')} className="bg-blue-700 px-3 py-1 rounded">Running</button>
          <button onClick={() => setTimerState('paused')} className="bg-yellow-700 px-3 py-1 rounded">Paused</button>
          <button onClick={() => setTimerState('finished')} className="bg-purple-700 px-3 py-1 rounded">Finished</button>
        </div>
      </section>

      {/* BookSelector */}
      <section className="w-full max-w-md bg-slate-800 rounded-xl p-6 mb-6 shadow-md flex flex-col items-center">
        <h2 className="font-semibold mb-2">BookSelector</h2>
        <BookSelector
          books={books}
          selectedBook={selectedBook}
          onBookChange={setSelectedBook}
          loading={false}
          error={null}
        />
        <div className="flex gap-2 mt-4">
          <button onClick={() => setBooks([])} className="bg-gray-700 px-3 py-1 rounded">No Books</button>
          <button onClick={() => setBooks(mockBooks)} className="bg-blue-700 px-3 py-1 rounded">Reset Books</button>
        </div>
      </section>

      {/* DurationSelector */}
      <section className="w-full max-w-md bg-slate-800 rounded-xl p-6 mb-6 shadow-md flex flex-col items-center">
        <h2 className="font-semibold mb-2">DurationSelector</h2>
        <DurationSelector duration={duration} onDurationChange={setDuration} />
      </section>

      {/* TimerStats */}
      <section className="w-full max-w-md bg-slate-800 rounded-xl p-6 mb-6 shadow-md flex flex-col items-center">
        <h2 className="font-semibold mb-2">TimerStats</h2>
        <TimerStats
          todayMinutes={todayTotalMinutes / 60}
          weeklyMinutes={weeklyMinutes}
          currentStreak={currentStreak}
          averageSessionLength={averageSessionLength}
          totalSessions={totalSessions}
        />
        <div className="flex gap-2 mt-4">
          <button onClick={() => setTodayTotalMinutes((t) => t + 300)} className="bg-green-700 px-3 py-1 rounded">+5 min today</button>
        </div>
      </section>
    </div>
  );
}
