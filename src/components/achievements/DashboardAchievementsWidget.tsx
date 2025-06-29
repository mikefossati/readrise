import React from 'react';
import { useAchievements } from '../../hooks/useAchievements';
import AchievementStatsWidget from './AchievementStatsWidget';
import AchievementBadge from './AchievementBadge';

const DashboardAchievementsWidget: React.FC<{ userId: string }> = ({ userId }) => {
  const { achievements, loading, error } = useAchievements(userId);

  if (loading) {
    return (
      <div className="p-6 bg-slate-800/60 rounded-2xl min-w-[180px] text-white flex flex-col items-center animate-pulse">
        <div className="w-8 h-8 bg-purple-900/40 rounded-full mb-2" />
        <div className="h-4 w-20 bg-slate-700/50 rounded mb-1" />
        <div className="h-3 w-16 bg-slate-700/40 rounded mb-1" />
      </div>
    );
  }
  if (error) {
    return <div className="p-6 bg-slate-800/60 rounded-2xl text-red-400">Error loading achievements</div>;
  }
  if (!achievements.length) {
    return <div className="p-6 bg-slate-800/60 rounded-2xl text-slate-300">No achievements yet</div>;
  }

  const unlocked = achievements.filter(a => a.unlocked).length;
  const total = achievements.length;
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  const points = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (a.points || 0), 0);

  // Show up to 3 most recently unlocked achievements
  const recentUnlocked = [...achievements]
    .filter(a => a.unlocked && a.unlocked_at)
    .sort((a, b) => (b.unlocked_at || '').localeCompare(a.unlocked_at || ''))
    .slice(0, 3);

  return (
    <div className="flex flex-col items-center gap-3">
      <AchievementStatsWidget unlocked={unlocked} total={total} percent={percent} points={points} />
      <div className="flex gap-2 mt-2">
        {recentUnlocked.length > 0 ? recentUnlocked.map(a => (
          <div key={a.id} className="flex flex-col items-center">
            <AchievementBadge icon={a.icon} tier={['bronze','silver','gold'].includes(a.tier as string) ? a.tier as 'bronze'|'silver'|'gold' : undefined} unlocked size={44} />
            <div className="text-xs text-slate-300 mt-1 max-w-[72px] truncate text-center">{a.title}</div>
          </div>
        )) : <div className="text-xs text-slate-400">No recent unlocks</div>}
      </div>
      <a href="/achievements" className="mt-2 text-purple-300 hover:underline text-xs">View all achievements →</a>
    </div>
  );
};

export default DashboardAchievementsWidget;
