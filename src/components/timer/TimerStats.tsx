import React from 'react';
import { Clock, Calendar } from 'lucide-react';

interface TimerStatsProps {
  currentSessionMinutes: number;
  todayTotalMinutes: number;
  isActive?: boolean;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

export const TimerStats: React.FC<TimerStatsProps> = ({
  currentSessionMinutes,
  todayTotalMinutes,
  isActive = false,
}) => {
  return (
    <div className="flex flex-col items-center gap-3 text-sm text-gray-300">
      {/* Current session */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-purple-400" />
        <span>Current session:</span>
        <span className={`font-mono font-semibold ${isActive ? 'text-blue-400' : 'text-white'}`}>
          {formatDuration(currentSessionMinutes)}
        </span>
      </div>

      {/* Today's total */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-green-400" />
        <span>Today's total:</span>
        <span className="font-mono font-semibold text-white">
          {formatDuration(todayTotalMinutes)}
        </span>
      </div>

      {/* Keyboard shortcut hints */}
      <div className="text-xs text-gray-500 text-center mt-2">
        <div>Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Space</kbd> to pause/resume</div>
        <div>Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Esc</kbd> to stop</div>
      </div>
    </div>
  );
};
