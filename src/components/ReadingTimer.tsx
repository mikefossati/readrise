import React, { useEffect } from 'react';
import AppLayout from './layout/AppLayout';
import { useEnhancedTimer } from '../hooks/useEnhancedTimer';
import { TimerSetup } from './timer/TimerSetup';
import { ActiveTimer } from './timer/ActiveTimer';
import { SessionCompleteModal } from './SessionCompleteModal';

const ReadingTimer: React.FC = () => {
  // --- Ambient Sound State ---
  const [sound, setSound] = React.useState<string>(() => localStorage.getItem('readrise_last_sound') || 'none');
  const [volume, setVolume] = React.useState<number>(() => {
    const v = localStorage.getItem('readrise_last_volume');
    return v ? Number(v) : 50;
  });
  const {
    timerState,
    selectedBook,
    duration,
    remaining,
    progress,
    books,
    loadingBooks,
    currentSession,
    setSelectedBook,
    setDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    completeSession,
    startingSession,
    error,
    clearError,
    readingStats,
  } = useEnhancedTimer();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
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
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [timerState, pauseTimer, resumeTimer, stopTimer]);

  // Show completion modal
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);
  useEffect(() => {
    if (timerState === 'completed') {
      setShowCompletionModal(true);
    }
  }, [timerState]);

  const handleCompleteSession = async (sessionData: any) => {
    await completeSession(sessionData);
    setShowCompletionModal(false);
  };


  return (
    <AppLayout currentPage="timer">
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Error Display */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 text-red-400 text-center">
                {error}
                <button 
                  onClick={clearError}
                  className="ml-4 text-red-300 hover:text-red-100 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Timer States */}
          {(timerState === 'setup' || timerState === 'ready') && (
            <TimerSetup
              books={books}
              selectedBook={selectedBook}
              onBookSelect={setSelectedBook}
              duration={duration}
              onDurationChange={setDuration}
              onStart={startTimer}
              loadingBooks={loadingBooks}
              startingSession={startingSession}
              readingStats={readingStats}
              error={error}
              sound={sound}
              setSound={setSound}
              volume={volume}
              setVolume={setVolume}
            />
          )}

          {(timerState === 'running' || timerState === 'paused') && selectedBook ? (
            <ActiveTimer
              book={selectedBook}
              duration={duration}
              remaining={remaining}
              progress={progress}
              isRunning={timerState === 'running'}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onStop={stopTimer}
              onReset={resetTimer}
              sound={sound}
              volume={volume}
              setVolume={setVolume}
            />
          ) : null}

          {/* Completion Modal */}
          {showCompletionModal && selectedBook && currentSession && (
            <SessionCompleteModal
              open={showCompletionModal}
              bookTitle={selectedBook.title}
              mood=""
              notes=""
              onMoodChange={() => {}}
              onNotesChange={() => {}}
              onStartAnother={() => handleCompleteSession({})}
              onGoLibrary={() => window.location.href = '/library'}
              onGoDashboard={() => window.location.href = '/dashboard'}
              onClose={() => handleCompleteSession({})}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ReadingTimer;
