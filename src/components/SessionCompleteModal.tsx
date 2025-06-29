import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Trophy } from 'lucide-react';

export interface SessionCompleteModalProps {
  open: boolean;
  bookTitle: string;
  plannedMinutes: number;
  actualMinutes: number;
  mood: string;
  notes: string;
  onMoodChange: (mood: string) => void;
  onNotesChange: (notes: string) => void;
  onStartAnother: () => void;
  onGoLibrary: () => void;
  onGoDashboard: () => void;
  onClose: () => void;
  achievement?: string;
  showConfetti?: boolean;
  focusQuality?: 'perfect' | 'paused' | 'resumed';
  streakDay?: number | null;
  nextMilestoneMinutes?: number | null;
  bestSession?: boolean;
  pagesRead?: number | '';
  onPagesReadChange?: (pages: number | '') => void;
  todayTotalMinutes?: number;
}

const MOODS = [
  { value: 'great', label: '😊 Great' },
  { value: 'good', label: '🙂 Good' },
  { value: 'okay', label: '😐 Okay' },
  { value: 'tired', label: '😴 Tired' },
  { value: 'distracted', label: '😵 Distracted' },
];

export const SessionCompleteModal: React.FC<SessionCompleteModalProps> = ({
  open,
  bookTitle,
  plannedMinutes,
  actualMinutes,
  mood,
  notes,
  onGoLibrary,
  onGoDashboard,
  onMoodChange,
  onNotesChange,
  onStartAnother,
  onClose,
  achievement,
  showConfetti,
  focusQuality,
  streakDay,
  nextMilestoneMinutes,
  bestSession,
  pagesRead,
  onPagesReadChange,
  todayTotalMinutes,
}) => {
  // Keyboard: close on Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);
  const { width, height } = useWindowSize();
  const [confettiActive, setConfettiActive] = useState(false);
  const confettiTimeout = useRef<NodeJS.Timeout | null>(null);
  // Motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (showConfetti && !prefersReducedMotion) {
      setConfettiActive(true);
      if (confettiTimeout.current) clearTimeout(confettiTimeout.current);
      confettiTimeout.current = setTimeout(() => setConfettiActive(false), 3500);
    } else {
      setConfettiActive(false);
    }
    return () => {
      if (confettiTimeout.current) clearTimeout(confettiTimeout.current);
    };
  }, [showConfetti, prefersReducedMotion]);

  // Confetti config based on achievement
  let confettiProps = {
    numberOfPieces: 120,
    gravity: 0.25,
    colors: ['#facc15', '#38bdf8', '#a78bfa', '#f472b6', '#f87171', '#34d399', '#fbbf24'],
    recycle: false,
    wind: 0.01,
    tweenDuration: 3500,
  };
  if (achievement && achievement.toLowerCase().includes('first')) {
    confettiProps = {
      ...confettiProps,
      numberOfPieces: 250,
      gravity: 0.23,
      colors: ['#fde68a', '#fbbf24', '#f59e42', '#fffde4', '#facc15'],
    };
  } else if (achievement && achievement.toLowerCase().includes('streak')) {
    confettiProps = {
      ...confettiProps,
      numberOfPieces: 180,
      gravity: 0.22,
      colors: ['#ffd700', '#fffbe7', '#facc15', '#fbbf24', '#fffde4'],
    };
  } else if (achievement && achievement.toLowerCase().includes('minute')) {
    confettiProps = {
      ...confettiProps,
      numberOfPieces: 180,
      gravity: 0.18,
      colors: ['#60a5fa', '#a78bfa', '#fbbf24', '#facc15', '#34d399'],
    };
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-xl shadow-xl p-8 w-full max-w-md relative">
        {/* Confetti effect */}
        {confettiActive && !prefersReducedMotion && (
          <Confetti
            width={width}
            height={height}
            {...confettiProps}
            className="absolute inset-0 pointer-events-none z-10"
          />
        )}
        <h2 className="text-2xl font-bold text-center text-white mb-2">Session Complete!</h2>
        <div className="text-center text-lg text-gray-200 mb-2">{bookTitle}</div>
        {/* Session statistics */}
        <div className="mb-4 space-y-2">
          {/* Completion percentage */}
          {plannedMinutes > 0 && (
            <div className="text-center text-yellow-300">
              Completion: <span className="font-bold">{Math.round(100 * Math.min(actualMinutes / plannedMinutes, 1))}%</span>
              {actualMinutes < plannedMinutes && <span className="ml-2 text-xs text-orange-300">(Stopped early)</span>}
            </div>
          )}
          {/* Focus quality */}
          {typeof focusQuality !== 'undefined' && (
            <div className="text-center">
              Focus Quality: {focusQuality === 'perfect' ? <span className="text-green-400 font-semibold">Perfect</span> : focusQuality === 'paused' ? <span className="text-yellow-400 font-semibold">Paused</span> : <span className="text-blue-400 font-semibold">Resumed</span>}
            </div>
          )}
          {/* Streak info */}
          {streakDay && streakDay > 1 && (
            <div className="text-center text-pink-300">Day {streakDay} of your streak!</div>
          )}
          {/* Next milestone */}
          {nextMilestoneMinutes && nextMilestoneMinutes > 0 && (
            <div className="text-center text-purple-300">{nextMilestoneMinutes} min to next reading goal!</div>
          )}
          {/* Session comparison */}
          {bestSession && (
            <div className="text-center text-green-300 font-bold">Your best session this week!</div>
          )}
          {/* Pages read input */}
          {typeof onPagesReadChange === 'function' && (
            <div className="flex justify-center items-center gap-2">
              <label htmlFor="pages-read" className="text-gray-300">Pages read:</label>
              <input
                id="pages-read"
                type="number"
                min={0}
                className="w-16 rounded bg-slate-700/60 border border-slate-600 text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={pagesRead ?? ''}
                onChange={e => onPagesReadChange(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                placeholder="0"
              />
            </div>
          )}
          {/* Total reading time today */}
          {todayTotalMinutes !== undefined && todayTotalMinutes !== null && (
            <div className="text-center text-cyan-300">Total today: <span className="font-bold">{todayTotalMinutes} min</span></div>
          )}
        </div>
        {/* Mood selector */}
        <div className="mb-3">
          <div className="text-gray-300 mb-1">How was your session?</div>
          <div className="flex gap-2 justify-center">
            {MOODS.map(m => (
              <Button
                key={m.value}
                size="sm"
                variant={mood === m.value ? 'default' : 'secondary'}
                onClick={() => onMoodChange(m.value)}
                className="px-3"
              >
                {m.label}
              </Button>
            ))}
          </div>
          <textarea
            className="w-full rounded bg-slate-700/60 border border-slate-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
            placeholder="Session notes (optional)"
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
          />
        </div>
        {/* Quick actions */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Button onClick={onStartAnother} variant="default">Start Another</Button>
          <Button onClick={onGoLibrary} variant="secondary">Go to Library</Button>
          <Button onClick={onGoDashboard} variant="secondary">View Dashboard</Button>
        </div>
        {/* Achievement notification */}
        {achievement && (
          <div className="mb-2 flex items-center justify-center gap-2 text-green-400 font-semibold animate-bounce">
            <Trophy className="inline-block w-6 h-6 text-yellow-400 drop-shadow" aria-label="Trophy" />
            <span>{achievement}</span>
          </div>
        )}
        <button className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl" onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>
  );
};
