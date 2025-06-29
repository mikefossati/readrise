import { useEffect } from 'react';

type TimerState = 'idle' | 'running' | 'paused' | 'finished';

interface UsePageVisibilityProps {
  timerState: TimerState;
  pauseTimer: () => void;
  resumeTimer: () => void;
  enabled?: boolean;
}

export function usePageVisibility({
  timerState,
  pauseTimer,
  resumeTimer,
  enabled = true,
}: UsePageVisibilityProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden && timerState === 'running') {
        pauseTimer();
      } else if (!document.hidden && timerState === 'paused') {
        // Optional: auto-resume when tab becomes visible again
        // resumeTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerState, pauseTimer, resumeTimer, enabled]);
}
