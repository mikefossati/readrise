import { useState, useEffect, useRef, useCallback } from "react";

type TimerState = 'idle' | 'running' | 'paused' | 'finished';

interface UseTimerOptions {
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

interface UseTimerReturn {
  timerState: TimerState;
  remaining: number;
  duration: number;
  setDuration: (duration: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  progress: number; // 0-1 for progress ring
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { onComplete, onTick } = options;
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remaining, setRemaining] = useState<number>(0);
  const [duration, setDuration] = useState<number>(25);
  const workerRef = useRef<Worker | null>(null);

  // Calculate progress for UI
  const progress = duration > 0 ? (remaining / (duration * 60)) : 1;

  // Only clean up worker on unmount/change
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const startTimer = useCallback(() => {
    // Clean up any existing worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setRemaining(duration * 60);
    setTimerState('running');
    // Create and start worker
    const worker = new Worker(new URL('../components/timerWorker.js', import.meta.url));
    workerRef.current = worker;
    worker.postMessage({ type: 'START', payload: { duration: duration * 60 } });
    worker.onmessage = (e: MessageEvent) => {
      const { type, payload } = e.data;
      if (type === 'TICK') {
        setRemaining(payload.remaining);
        onTick?.(payload.remaining);
      }
      if (type === 'DONE') {
        setTimerState('finished');
        onComplete?.();
      }
    };
  }, [duration, onComplete, onTick]);

  const pauseTimer = useCallback(() => {
    setTimerState('paused');
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'PAUSE' });
    }
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState('running');
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESUME' });
    }
  }, []);

  const stopTimer = useCallback(() => {
    setTimerState('finished');
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'STOP' });
    }
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState('idle');
    setRemaining(0);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    timerState,
    remaining,
    duration,
    setDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    progress,
  };
}