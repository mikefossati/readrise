import { useState, useEffect } from 'react';
import { getAchievements, getUserAchievements, getAchievementProgress } from '../lib/supabase';
import type { Achievement, UserAchievement, AchievementProgress } from '../types/achievements';

// Icon mapping for achievement keys
const iconMap: Record<string, string> = {
  first_session: '🎯',
  sessions_5: '📚', sessions_10: '📖', sessions_25: '🏆', sessions_100: '👑',
  minutes_15: '⏱️', minutes_30: '⏰', minutes_60: '🕐', minutes_120: '⏳',
  total_hours_5: '📊', total_hours_10: '📈', total_hours_25: '📉', total_hours_100: '💯',
  streak_3: '🔥', streak_7: '🌟', streak_30: '💎', streak_100: '⚡',
  books_1: '✅', books_5: '🐛', books_10: '📚', books_50: '🏛️',
  sunrise: '🌅', nightowl: '🦉', speedreader: '💨', zenreader: '🧘',
};

export interface EnrichedAchievement extends Achievement {
  unlocked: boolean;
  unlocked_at?: string;
  progress?: { current: number; target: number };
  icon: string;
}

export function useAchievements(userId?: string) {
  const [achievements, setAchievements] = useState<EnrichedAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setAchievements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      getAchievements(),
      getUserAchievements(userId),
      getAchievementProgress(userId),
    ]).then(([achRes, userAchRes, progRes]) => {
      if (achRes.error || userAchRes.error || progRes.error) {
        // Extract error message safely
        const err = achRes.error || userAchRes.error || progRes.error;
        setError(typeof err === 'string' ? err : (err && typeof err.message === 'string' ? err.message : 'Unknown error'));
        setAchievements([]);
        setLoading(false);
        return;
      }
      const allAchievements = achRes.data || [];
      const userAchievements = userAchRes.data || [];
      const progress = progRes.data || [];
      // Map for quick lookup
      const unlockedMap = Object.fromEntries(userAchievements.map(u => [u.achievement_id, u]));
      const progressMap = Object.fromEntries(progress.map(p => [p.achievement_key, p]));
      // Enrich
      const enriched: EnrichedAchievement[] = allAchievements.map(a => {
        const unlocked = Boolean(unlockedMap[a.id]);
        const unlocked_at = unlockedMap[a.id]?.unlocked_at;
        const prog = progressMap[a.key];
        return {
          ...a,
          unlocked,
          unlocked_at,
          progress: prog ? { current: prog.current_progress, target: prog.target_progress } : undefined,
          icon: iconMap[a.key] || '🏆',
        };
      });
      setAchievements(enriched);
      setLoading(false);
    }).catch(e => {
      setError(e.message || String(e));
      setAchievements([]);
      setLoading(false);
    });
  }, [userId]);

  return { achievements, loading, error };
}
