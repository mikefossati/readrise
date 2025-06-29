import { useEffect } from 'react';

type TimerState = 'idle' | 'running' | 'paused' | 'finished';

interface UseTimerKeyboardShortcutsProps {
  timerState: TimerState;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  enabled?: boolean;
}

export function useTimerKeyboardShortcuts({
  timerState,
  pauseTimer,
  resumeTimer,
  stopTimer,
  enabled = true,
}: UseTimerKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if no input is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (timerState === 'running') {
            pauseTimer();
          } else if (timerState === 'paused') {
            resumeTimer();
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (timerState === 'running' || timerState === 'paused') {
            stopTimer();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timerState, pauseTimer, resumeTimer, stopTimer, enabled]);
}
