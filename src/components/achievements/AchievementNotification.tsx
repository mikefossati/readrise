import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export interface AchievementToast {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlockedAt?: string;
  onClose?: () => void;
}

interface AchievementNotificationProps {
  notifications: AchievementToast[];
  removeNotification: (id: string) => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ notifications, removeNotification }) => {
  useEffect(() => {
    if (notifications.length > 0) {
      // Confetti burst for new unlock
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.2 },
        zIndex: 9999,
      });
    }
  }, [notifications.length]);

  useEffect(() => {
    if (notifications.length === 0) return;
    // Auto-dismiss after 4s
    const timers = notifications.map(n =>
      setTimeout(() => removeNotification(n.id), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications, removeNotification]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 items-end">
      {notifications.map(n => (
        <div
          key={n.id}
          className="bg-gradient-to-br from-purple-700 via-fuchsia-700 to-slate-900 shadow-2xl rounded-xl px-5 py-4 min-w-[260px] max-w-xs flex items-center gap-3 animate-fade-in"
          role="status"
        >
          <div className="text-3xl mr-2">
            {n.icon}
          </div>
          <div className="flex-1">
            <div className="font-bold text-white text-lg leading-tight">{n.title}</div>
            <div className="text-slate-200 text-sm mb-1">{n.description}</div>
            {n.unlockedAt && <div className="text-xs text-green-300">Unlocked {n.unlockedAt.slice(0, 10)}</div>}
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="ml-2 text-slate-400 hover:text-white text-xl px-1"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default AchievementNotification;
