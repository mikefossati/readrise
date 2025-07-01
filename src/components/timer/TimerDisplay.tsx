import React from 'react';

/**
 * Visual display for the reading session timer progress.
 *
 * @param remaining - Seconds remaining in the session
 * @param progress - Progress as a value between 0 and 1
 * @param size - Optional, diameter of the timer display in pixels
 *
 * @example
 * <TimerDisplay
 *   remaining={300}
 *   progress={0.5}
 *   size={200}
 * />
 */
interface TimerDisplayProps {
  remaining: number;
  progress: number;
  size?: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  remaining, 
  progress, 
  size = 200 
}) => {
  const radius = (size - 32) / 2; // Account for stroke width
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="block">
        {/* Background circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          fill="none" 
          stroke="#312e81" 
          strokeWidth={16} 
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#timer-gradient)"
          strokeWidth={14}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ 
            transition: 'stroke-dashoffset 0.5s linear',
            transform: 'rotate(-90deg)',
            transformOrigin: 'center'
          }}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        
        {/* Timer text */}
        <text
          x={size / 2}
          y={size / 2 + 8}
          textAnchor="middle"
          fontSize="2.5rem"
          fill="#f3f4f6"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {formatTime(remaining)}
        </text>
      </svg>
    </div>
  );
};
