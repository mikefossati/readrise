import React from 'react';

interface AchievementProgressBarProps {
  current: number;
  target: number;
  tier?: 'bronze' | 'silver' | 'gold';
  unlocked?: boolean;
}

const tierColors: Record<string, string> = {
  bronze: 'bg-amber-600',
  silver: 'bg-slate-400',
  gold: 'bg-yellow-400',
};

const AchievementProgressBar: React.FC<AchievementProgressBarProps> = ({ current, target, tier = 'bronze', unlocked = false }) => {
  const percent = Math.min(100, Math.round((current / target) * 100));
  const barColor = unlocked ? 'bg-green-400' : (tierColors[tier] || 'bg-purple-500');
  return (
    <div className="w-full flex flex-col gap-1">
      <div className="relative w-full h-3 bg-slate-700 rounded overflow-hidden">
        <div
          className={`h-3 transition-all duration-500 ease-out rounded ${barColor}`}
          style={{ width: `${percent}%` }}
          aria-valuenow={current}
          aria-valuemax={target}
          aria-label="Achievement progress"
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{current} / {target}</span>
        <span>{percent}%</span>
      </div>
    </div>
  );
};

export default AchievementProgressBar;
