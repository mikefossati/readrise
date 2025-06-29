import React from 'react';
import { Button } from '../ui/button';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

type TimerState = 'idle' | 'running' | 'paused' | 'finished';

interface TimerControlsProps {
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  timerState,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  disabled = false,
  loading = false,
}) => {
  if (timerState === 'idle') {
    return (
      <div className="flex justify-center">
        <Button 
          size="lg" 
          onClick={onStart} 
          disabled={disabled || loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Reading
        </Button>
      </div>
    );
  }

  if (timerState === 'running') {
    return (
      <div className="flex gap-4 justify-center">
        <Button size="lg" variant="secondary" onClick={onPause} disabled={loading}>
          <Pause className="w-5 h-5 mr-2" />
          Pause
        </Button>
        <Button size="lg" variant="destructive" onClick={onStop} disabled={loading}>
          <Square className="w-5 h-5 mr-2" />
          Stop
        </Button>
      </div>
    );
  }

  if (timerState === 'paused') {
    return (
      <div className="flex gap-4 justify-center">
        <Button 
          size="lg" 
          onClick={onResume} 
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          <Play className="w-5 h-5 mr-2" />
          Resume
        </Button>
        <Button size="lg" variant="destructive" onClick={onStop} disabled={loading}>
          <Square className="w-5 h-5 mr-2" />
          Stop
        </Button>
        <Button size="lg" variant="ghost" onClick={onReset} disabled={loading}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    );
  }

  if (timerState === 'finished') {
    return (
      <div className="flex justify-center">
        <Button size="lg" variant="ghost" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Timer
        </Button>
      </div>
    );
  }

  return null;
};
