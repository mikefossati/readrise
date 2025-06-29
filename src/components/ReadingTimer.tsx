import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import AppLayout from './layout/AppLayout';
import { SessionCompleteModal } from './SessionCompleteModal';
import { useReadingTimer } from '../hooks/useReadingTimer';
import {
  TimerDisplay,
  TimerControls,
  BookSelector,
  DurationSelector,
  TimerStats,
} from './timer';

const ReadingTimer: React.FC = () => {
  const navigate = useNavigate();
  const timer = useReadingTimer();

  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [mood, setMood] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [pagesRead, setPagesRead] = useState<number | ''>('');

  // Show modal when timer completes
  useEffect(() => {
    if (timer.timerState === 'finished') {
      setModalOpen(true);
    }
  }, [timer.timerState]);

  // Browser notification with error handling
  useEffect(() => {
    if (timer.timerState === 'finished' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification('Reading session complete!', {
          body: 'Great job! 🎉',
          icon: '/favicon.ico',
        });
      } catch (err) {
        // Ignore notification errors
      }
    }
  }, [timer.timerState]);

  // Handle modal close and session completion
  const handleModalClose = async () => {
    try {
      await timer.completeSession({
        mood,
        notes,
        pagesRead: typeof pagesRead === 'number' ? pagesRead : undefined,
      });
      setModalOpen(false);
      setMood('');
      setPagesRead('');
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  return (
    <AppLayout currentPage="timer">
      <div className="max-w-xl mx-auto my-8">
        <Card className="p-6 bg-gradient-to-br from-slate-900/90 to-purple-900/80 border-0 shadow-xl">
          {/* Book selection */}
          <BookSelector
            books={timer.books}
            selectedBook={timer.selectedBook}
            onBookChange={timer.setSelectedBook}
            disabled={timer.timerState !== 'idle'}
            loading={timer.loadingBooks}
            error={timer.dataError}
          />

          {/* Duration selection only when idle */}
          {timer.timerState === 'idle' && (
            <DurationSelector
              duration={timer.duration}
              onDurationChange={timer.setDuration}
            />
          )}

          {/* Timer display */}
          <div className="my-6">
            <TimerDisplay
              remaining={timer.remaining}
              progress={timer.progress}
              size={200}
            />
          </div>

          {/* Timer controls */}
          <div className="mb-6">
            <TimerControls
              timerState={timer.timerState}
              onStart={timer.startSession}
              onPause={timer.pauseTimer}
              onResume={timer.resumeTimer}
              onStop={timer.stopSession}
              onReset={timer.resetTimer}
              disabled={timer.startDisabled}
              loading={timer.sessionLoading}
            />
          </div>

          {/* Session stats */}
          <TimerStats
            currentSessionMinutes={timer.currentSessionSeconds}
            todayTotalMinutes={timer.todayTotal}
            isActive={timer.timerState === 'running'}
          />

          {/* Error messages */}
          {(timer.dataError || timer.sessionError) && (
            <div className="mt-4 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-sm text-center">
              {timer.dataError || timer.sessionError}
            </div>
          )}
        </Card>
      </div>

      {/* Completion modal */}
      <SessionCompleteModal
        open={modalOpen}
        bookTitle={timer.books.find(b => b.id === timer.session?.book_id)?.title || ''}
        plannedMinutes={timer.session?.planned_duration || 0}
        actualMinutes={Math.floor(timer.currentSessionSeconds / 60)}
        mood={mood}
        notes={notes}
        onMoodChange={setMood}
        onNotesChange={setNotes}
        onStartAnother={handleModalClose}
        onGoLibrary={() => navigate('/library')}
        onGoDashboard={() => navigate('/dashboard')}
        onClose={handleModalClose}
        achievement={timer.achievementState.unlocked[0]?.title}
        showConfetti={timer.achievementState.showConfetti}
        pagesRead={pagesRead}
        onPagesReadChange={setPagesRead}
        todayTotalMinutes={Math.floor(timer.todayTotal / 60)}
      />
    </AppLayout>
  );
};

export default ReadingTimer;
