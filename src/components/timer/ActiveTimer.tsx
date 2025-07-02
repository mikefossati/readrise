import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Pause, Square, RotateCcw, BookOpen } from 'lucide-react';
import type { Book } from '../../lib/supabase';
import { useAmbientAudio } from '../../hooks/useAmbientAudio';
import { useSoundSrc } from './useSoundSrc';
import { Slider } from './Slider';

interface ActiveTimerProps {
  book: Book;
  duration: number; // in minutes
  remaining: number; // in seconds
  progress: number; // 0-1
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  sound: string;
  volume: number;
  setVolume: (v: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const ActiveTimer: React.FC<ActiveTimerProps> = ({
  book,
  duration,
  remaining,
  progress,
  isRunning,
  onPause,
  onResume,
  onStop,
  onReset,
  sound,
  volume,
  setVolume,
}) => {
  const [muted, setMuted] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const src = useSoundSrc(sound);

  useEffect(() => {
    if (sound === 'none' || !src) {
      setAudioLoading(false);
      setAudioError(null);
      return;
    }
    setAudioLoading(true);
    setAudioError(null);
  }, [src, sound]);

  useAmbientAudio({
    src: muted ? null : src,
    volume: muted ? 0 : volume,
    playing: isRunning && !!src,
    fade: true,
    onError: (e) => {
      setAudioLoading(false);
      setAudioError(e?.message || 'Audio failed to load or play.');
      console.error('Audio error:', e);
    },
  });

  useEffect(() => {
    if (!audioLoading) return;
    if (isRunning && !!src && !muted && !audioError) {
      setAudioLoading(false);
    }
  }, [isRunning, src, muted, audioError, audioLoading]);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Book Info */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-24 bg-slate-700 rounded overflow-hidden flex-shrink-0">
              {book.cover_url ? (
                <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-1">{book.title}</h2>
              {book.author && (
                <p className="text-purple-300 mb-2">{book.author}</p>
              )}
              <Badge 
                variant="outline" 
                className="border-green-500/30 text-green-300"
              >
                Reading Session Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer Display */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 mb-8">
        <CardContent className="p-8">
          <div className="text-center">
            {/* --- Audio Controls --- */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {audioLoading && (
                <div className="flex items-center justify-center gap-2 mb-2 text-purple-300 animate-pulse">
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="#a78bfa" strokeWidth="3" fill="none" /></svg>
                  Loading background sound...
                </div>
              )}
              {audioError && (
                <div className="flex items-center justify-center gap-2 mb-2 text-red-400 bg-red-900/30 border border-red-500/30 rounded px-3 py-1">
                  <span role="img" aria-label="Audio error">⚠️</span>
                  {audioError}
                </div>
              )}
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#a78bfa" strokeWidth="2" /><text x="50%" y="55%" textAnchor="middle" fontSize="10" fill="#a78bfa" fontFamily="monospace">{sound === 'none' ? 'Off' : sound.replace('-', ' ').slice(0, 8)}</text></svg>
                {sound === 'none' ? 'No Sound' : sound.replace('-', ' ')}
              </span>
              <button
                aria-label={muted ? 'Unmute background sound' : 'Mute background sound'}
                className="p-2 rounded hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                onClick={() => setMuted((m) => !m)}
                type="button"
                tabIndex={0}
                title={muted ? 'Unmute background sound' : 'Mute background sound'}
              >
                {muted ? <span role="img" aria-label="Muted">🔇</span> : <span role="img" aria-label="Unmuted">🔊</span>}
              </button>
              <Slider
                min={0}
                max={100}
                step={1}
                value={muted ? 0 : volume}
                onValueChange={(v) => {
                  setVolume(v);
                  if (v === 0) setMuted(true);
                  else setMuted(false);
                }}
                aria-label="Volume"
                className="w-32"
              />
              <span className="w-8 text-right text-gray-400 text-xs">{muted ? 0 : volume}%</span>
            </div>
            {/* Circular Progress */}
            <div className="relative inline-block mb-8">
              <svg width={280} height={280} className="transform -rotate-90">
                {/* Background circle */}
                <circle 
                  cx={140} 
                  cy={140} 
                  r={radius} 
                  fill="none" 
                  stroke="#334155" 
                  strokeWidth={8} 
                />
                
                {/* Progress circle */}
                <circle
                  cx={140}
                  cy={140}
                  r={radius}
                  fill="none"
                  stroke="url(#timer-gradient)"
                  strokeWidth={8}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Time display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-mono font-bold text-white mb-2">
                  {formatTime(remaining)}
                </div>
                <div className="text-gray-400 text-sm">
                  {Math.round((1 - progress) * duration)} of {duration} minutes
                </div>
              </div>
            </div>

            {/* Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
              isRunning 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400' : 'bg-yellow-400'} ${isRunning ? 'animate-pulse' : ''}`}></div>
              {isRunning ? 'Reading in progress' : 'Session paused'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex justify-center gap-4">
            {isRunning ? (
              <Button
                onClick={onPause}
                size="lg"
                variant="outline"
                className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/10"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={onResume}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            )}
            
            <Button
              onClick={onStop}
              size="lg"
              variant="destructive"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Session
            </Button>
            
            <Button
              onClick={onReset}
              size="lg"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>
          
          {/* Keyboard shortcuts hint */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <div className="flex justify-center gap-6">
              <span><kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Space</kbd> Pause/Resume</span>
              <span><kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Esc</kbd> Stop</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
