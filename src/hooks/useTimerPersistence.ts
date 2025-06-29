import { useEffect } from 'react';
import type { ReadingSession } from '../lib/supabase';

type TimerState = 'idle' | 'running' | 'paused' | 'finished';

interface TimerStateData {
  userId: string;
  selectedBook: string;
  duration: number;
  timerState: TimerState;
  remaining: number;
  session: ReadingSession | null;
}

interface UseTimerPersistenceProps {
  userId?: string;
  selectedBook: string;
  duration: number;
  timerState: TimerState;
  remaining: number;
  session: ReadingSession | null;
  onStateRestore?: (state: Partial<TimerStateData>) => void;
}

const TIMER_STORAGE_KEY = 'readrise_timer_state';

export function useTimerPersistence({
  userId,
  selectedBook,
  duration,
  timerState,
  remaining,
  session,
  onStateRestore,
}: UseTimerPersistenceProps) {
  
  // Restore timer state on mount
  useEffect(() => {
    if (!userId) return;
    
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const state: TimerStateData = JSON.parse(saved);
        
        // Only restore if it's for the same user
        if (state.userId === userId) {
          onStateRestore?.(state);
        }
      }
    } catch (error) {
      console.error('Failed to restore timer state:', error);
      localStorage.removeItem(TIMER_STORAGE_KEY);
    }
  }, [userId, onStateRestore]);

  // Persist timer state on changes
  useEffect(() => {
    if (!userId) return;

    const stateToSave: TimerStateData = {
      userId,
      selectedBook,
      duration,
      timerState,
      remaining,
      session,
    };

    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to persist timer state:', error);
    }
  }, [userId, selectedBook, duration, timerState, remaining, session]);

  // Clear persisted state
  const clearPersistedState = () => {
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear timer state:', error);
    }
  };

  return { clearPersistedState };
}
