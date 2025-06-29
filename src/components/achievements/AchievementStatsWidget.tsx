import React from 'react';

interface AchievementStatsWidgetProps {
  unlocked: number;
  total: number;
  percent: number;
  points: number;
}

const AchievementStatsWidget: React.FC<AchievementStatsWidgetProps> = ({ unlocked, total, percent, points }) => {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-800/80 to-slate-900/80 rounded-2xl text-white shadow-lg flex flex-col gap-2 items-center min-w-[180px]">
      <div className="text-xl font-bold">Achievements</div>
      <div className="flex gap-4 text-lg">
        <span className="font-mono text-green-400">{unlocked}</span>
        <span className="text-slate-400">/</span>
        <span className="font-mono text-slate-200">{total}</span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded mt-2 mb-1">
        <div className="h-2 rounded bg-purple-500" style={{ width: `${percent}%` }} />
      </div>
      <div className="text-xs text-slate-400 mb-2">Completion: <span className="font-semibold text-white">{percent}%</span></div>
      <div className="text-sm text-yellow-300 font-semibold">Points: {points}</div>
    </div>
  );
};

export default AchievementStatsWidget;
