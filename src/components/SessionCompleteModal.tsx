import React from 'react';
import { Button } from './ui/button';

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
  audioEnabled: boolean;
  onAudioToggle: () => void;
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
  onMoodChange,
  onNotesChange,
  onStartAnother,
  onGoLibrary,
  onGoDashboard,
  onClose,
  achievement,
  showConfetti,
  audioEnabled,
  onAudioToggle,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-xl shadow-xl p-8 w-full max-w-md relative">
        {/* Confetti/celebration effect placeholder */}
        {showConfetti && <div className="absolute inset-0 pointer-events-none">{/* Confetti would go here */}</div>}
        <h2 className="text-2xl font-bold text-center text-white mb-2">Session Complete!</h2>
        <div className="text-center text-lg text-gray-200 mb-2">{bookTitle}</div>
        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-slate-700/60 rounded-lg px-4 py-2">
            <span className="text-gray-400">Planned:</span> <span className="text-white font-bold">{plannedMinutes} min</span>
          </div>
          <div className="bg-slate-700/60 rounded-lg px-4 py-2">
            <span className="text-gray-400">Actual:</span> <span className="text-white font-bold">{actualMinutes} min</span>
          </div>
        </div>
        {/* Mood selector */}
        <div className="mb-3">
          <div className="text-gray-300 mb-1">How was your session?</div>
          <div className="flex gap-2 justify-center">
            {MOODS.map(m => (
              <button
                key={m.value}
                className={`text-2xl px-2 py-1 rounded-lg border-2 transition-all ${mood === m.value ? 'border-yellow-400 bg-yellow-300/10' : 'border-transparent hover:border-slate-600'}`}
                onClick={() => onMoodChange(m.value)}
                aria-label={m.label}
              >{m.label.split(' ')[0]}</button>
            ))}
          </div>
        </div>
        {/* Notes textarea */}
        <div className="mb-3">
          <textarea
            className="w-full rounded-lg bg-slate-700/60 border border-slate-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            placeholder="Optional notes about this session..."
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
          />
        </div>
        {/* Audio notification toggle */}
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" id="audio-toggle" checked={audioEnabled} onChange={onAudioToggle} />
          <label htmlFor="audio-toggle" className="text-gray-300 cursor-pointer">Play sound on completion</label>
        </div>
        {/* Achievement notification */}
        {achievement && (
          <div className="mb-2 text-center text-green-400 font-semibold animate-bounce">🏆 {achievement}</div>
        )}
        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <Button onClick={onStartAnother} variant="default">Start Another Session</Button>
          <Button onClick={onGoLibrary} variant="secondary">Go to Library</Button>
          <Button onClick={onGoDashboard} variant="secondary">View Dashboard</Button>
        </div>
        <button className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl" onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>
  );
};
