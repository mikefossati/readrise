import React from 'react';

interface AchievementBadgeProps {
  icon: string;
  tier?: 'bronze' | 'silver' | 'gold';
  unlocked?: boolean;
  size?: number;
}

const tierRing: Record<string, string> = {
  bronze: 'ring-amber-600',
  silver: 'ring-slate-400',
  gold: 'ring-yellow-400',
};

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ icon, tier = 'bronze', unlocked = false, size = 48 }) => {
  const ring = tierRing[tier] || 'ring-purple-500';
  const opacity = unlocked ? 'opacity-100' : 'opacity-40 grayscale';
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-slate-800 ring-4 ${ring} ${opacity}`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
      title={unlocked ? 'Unlocked' : 'Locked'}
    >
      <span>{icon}</span>
    </div>
  );
};

export default AchievementBadge;
