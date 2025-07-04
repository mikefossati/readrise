import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Trophy, X } from 'lucide-react';

export interface SessionCompleteModalProps {
  open: boolean;
  bookTitle: string;
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
}) => {
  const { width, height } = useWindowSize();
  const [confettiActive, setConfettiActive] = useState(false);
  const confettiTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keyboard: close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 w-full max-w-lg mx-4 relative">
        
        {/* Confetti effect */}
        {confettiActive && !prefersReducedMotion && (
          <Confetti
            width={width}
            height={height}
            {...confettiProps}
            className="absolute inset-0 pointer-events-none z-10"
          />
        )}

        {/* Close button */}
        <button 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
          <div className="text-lg text-slate-300 leading-tight px-4">
            {bookTitle}
          </div>
        </div>

        {/* Achievement notification */}
        {achievement && (
          <div className="mb-6 flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
            <Trophy className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-yellow-300 font-semibold">{achievement}</span>
          </div>
        )}



        {/* Mood selector */}
        <div className="mb-6">
          <h3 className="text-slate-300 font-medium mb-3 text-center">How was your session?</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {MOODS.map(m => (
              <Button
                key={m.value}
                size="sm"
                variant={mood === m.value ? 'default' : 'secondary'}
                onClick={() => onMoodChange(m.value)}
                className="text-sm py-2 px-2 h-auto"
              >
                {m.label}
              </Button>
            ))}
          </div>
          
          {/* Notes textarea */}
          <textarea
            className="w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-slate-400"
            rows={3}
            placeholder="Session notes (optional)"
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
          />
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onStartAnother} 
            className="w-full h-12 text-base font-semibold"
          >
            Start Another Session
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={onGoLibrary} 
              variant="secondary"
              className="h-10"
            >
              Go to Library
            </Button>
            <Button 
              onClick={onGoDashboard} 
              variant="secondary"
              className="h-10"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};