import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { EnrichedAchievement } from './useAchievements';
import { useTimer } from './useTimer';
import { useTimerSession } from './useTimerSession';
import { useTimerData } from './useTimerData';
import { useTimerKeyboardShortcuts } from './useTimerKeyboardShortcuts';
import { usePageVisibility } from './usePageVisibility';
import { useTimerPersistence } from './useTimerPersistence';

export function useReadingTimer() {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [achievementState, setAchievementState] = useState<{
    unlocked: EnrichedAchievement[];
    showConfetti: boolean;
  }>({
    unlocked: [],
    showConfetti: false,
  });

  // All the hooks
  const { books, loadingBooks, error: dataError, todayTotal, refreshData } = useTimerData();
  
  const timer = useTimer({
    onComplete: () => setAchievementState(prev => ({ ...prev, showConfetti: true })),
  });

  const sessionManager = useTimerSession({
    onSessionComplete: refreshData,
    onAchievementUnlocked: (achievements) => {
      setAchievementState({ unlocked: achievements, showConfetti: true });
    },
  });

  const onStateRestore = useCallback((state: Partial<{ selectedBook?: string; duration?: number; }>) => {
    if (state.selectedBook) setSelectedBook(state.selectedBook);
    if (state.duration) timer.setDuration(state.duration);
  }, [setSelectedBook, timer.setDuration]);

  const { clearPersistedState } = useTimerPersistence({
    userId: user?.id,
    selectedBook,
    duration: timer.duration,
    timerState: timer.timerState,
    remaining: timer.remaining,
    session: sessionManager.session,
    onStateRestore,
  });

  useTimerKeyboardShortcuts({
    timerState: timer.timerState,
    pauseTimer: timer.pauseTimer,
    resumeTimer: timer.resumeTimer,
    stopTimer: timer.stopTimer,
  });

  usePageVisibility({
    timerState: timer.timerState,
    pauseTimer: timer.pauseTimer,
    resumeTimer: timer.resumeTimer,
  });

  // Auto-select first book
  useEffect(() => {
    if (books.length > 0 && !selectedBook) {
      setSelectedBook(books[0].id);
    }
  }, [books, selectedBook]);

  // Update session duration
  useEffect(() => {
    if (sessionManager.session && timer.timerState !== 'idle') {
      const actualDuration = (timer.duration * 60) - timer.remaining;
      if (sessionManager.session.actual_duration !== actualDuration) {
        sessionManager.updateSessionDuration(actualDuration);
      }
    }
  }, [timer.remaining, timer.duration, timer.timerState, sessionManager]);

  const startSession = useCallback(async () => {
    if (!selectedBook || !user?.id) return;

    try {
      await sessionManager.createSession({
        user_id: user.id,
        book_id: selectedBook,
        planned_duration: timer.duration,
      });
      timer.startTimer();
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  }, [selectedBook, user?.id, timer, sessionManager]);

  const stopSession = useCallback(async () => {
    const confirmed = window.confirm('End session early? Your progress will be saved.');
    if (confirmed) {
      timer.stopTimer();
    }
  }, [timer]);

  const completeSession = useCallback(async (sessionData: {
    mood?: string;
    notes?: string;
    pagesRead?: number;
  }) => {
    try {
      await sessionManager.completeSession(sessionData);
      timer.resetTimer();
      clearPersistedState();
      setAchievementState({ unlocked: [], showConfetti: false });
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw error;
    }
  }, [sessionManager, timer, clearPersistedState]);

  return {
    // Book data and selection
    books,
    loadingBooks,
    dataError,
    todayTotal,
    selectedBook,
    setSelectedBook,

    // Timer state and controls
    ...timer,

    // Session state and errors
    session: sessionManager.session,
    sessionLoading: sessionManager.sessionLoading,
    sessionError: sessionManager.sessionError,

    // Achievement state
    achievementState,

    // Actions
    startSession,
    stopSession,
    completeSession,

    // Computed values
    currentSessionSeconds: sessionManager.session
      ? (timer.duration * 60) - timer.remaining
      : 0,
    startDisabled:
      !selectedBook ||
      sessionManager.sessionLoading ||
      loadingBooks ||
      books.length === 0,
  };

}
