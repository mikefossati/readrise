import React from 'react';
import { useTimer } from '../../hooks/useTimer';

export const TimerHookTest: React.FC = () => {
  const timer = useTimer({
    onComplete: () => console.log('Timer completed!'),
    onTick: (remaining) => console.log('Remaining:', remaining),
  });

  return (
    <div className="p-4">
      <h2>Timer Hook Test</h2>
      <p>State: {timer.timerState}</p>
      <p>Remaining: {timer.remaining}</p>
      <p>Duration: {timer.duration}</p>
      <p>Progress: {(timer.progress * 100).toFixed(1)}%</p>
      
      <div className="space-x-2 mt-4">
        <button onClick={timer.startTimer}>Start</button>
        <button onClick={timer.pauseTimer}>Pause</button>
        <button onClick={timer.resumeTimer}>Resume</button>
        <button onClick={timer.stopTimer}>Stop</button>
        <button onClick={timer.resetTimer}>Reset</button>
        <button onClick={() => timer.setDuration(5)}>Set 5min</button>
      </div>
    </div>
  );
};
