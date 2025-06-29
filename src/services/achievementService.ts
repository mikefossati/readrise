import {
  getAchievements,
  getUserAchievements,
  unlockAchievement as unlockAchievementDb,
  getAchievementProgress as getAchievementProgressDb,
  updateAchievementProgress as updateAchievementProgressDb,
  getBooks,
  getRecentSessions,
} from '../lib/supabase';
import type {
  Achievement,
  UserAchievement,
  AchievementProgress,
  UserGoal,
  AchievementCriteria,
} from '../types/achievements';
import type { ReadingSession, Book } from '../lib/supabase';

// --- User Stats Type ---
export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  booksFinished: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionLength: number;
}

// --- Main Achievement Checker ---
export async function checkAllAchievements(userId: string, sessionData?: ReadingSession): Promise<UserAchievement[]> {
  console.log('[AchievementService] Starting achievement check for user:', userId);
  
  // Batched fetch for all needed data
  let achievements: Achievement[] = [];
  let userAchievements: UserAchievement[] = [];
  let progress: AchievementProgress[] = [];
  let sessions: ReadingSession[] = [];
  let books: Book[] = [];
  const unlocked: UserAchievement[] = [];

  try {
    const [achievementsRes, userAchievementsRes, progressRes, sessionsRes, booksRes] = await Promise.all([
      getAchievements(),
      getUserAchievements(userId),
      getAchievementProgressDb(userId),
      getRecentSessions(userId, 90 * 3), // 90 days max
      getBooks(userId),
    ]);

    if (!achievementsRes.data || !userAchievementsRes.data || !progressRes.data || !sessionsRes.data || !booksRes.data) {
      console.error('[AchievementService] Failed to fetch achievement data - some responses were null');
      return [];
    }

    achievements = achievementsRes.data;
    userAchievements = userAchievementsRes.data;
    progress = progressRes.data;
    sessions = sessionsRes.data.filter(s => s.completed);
    books = booksRes.data;

  } catch (e) {
    console.error('[AchievementService] Data fetch error:', e);
    return [];
  }

  // Create maps for efficient lookups
  const achievementMap = new Map<string, Achievement>();
  achievements.forEach(a => achievementMap.set(a.key, a));

  // Get already unlocked achievement keys - FIXED: properly map from user achievements
  const unlockedKeys = new Set<string>();
  userAchievements.forEach(ua => {
    // Find the achievement by ID to get the key
    const achievement = achievements.find(a => a.id === ua.achievement_id);
    if (achievement) {
      unlockedKeys.add(achievement.key);
    }
  });

  console.log('[AchievementService] Already unlocked achievement keys:', Array.from(unlockedKeys));

  const progressMap = new Map(progress.map(p => [p.achievement_key, p]));

  // Calculate streaks (with timezone and edge case handling)
  const { current: currentStreak } = calculateStreaks(sessions);

  // Helper: only update progress if changed significantly
  function progressChanged(key: string, newValue: number): boolean {
    const prev = progressMap.get(key)?.current_progress;
    return prev === undefined || Math.abs(prev - newValue) >= 1;
  }

  // Unlock batching
  const unlockBatch: (() => Promise<UserAchievement | null>)[] = [];
  const progressBatch: (() => Promise<AchievementProgress | null>)[] = [];

  // Check all achievements
  console.log('[AchievementService] Checking achievements...');
  for (const ach of achievements) {
    // Skip if already unlocked
    if (unlockedKeys.has(ach.key)) {
      continue;
    }

    const { type, target } = ach.criteria as any;
    console.log('[AchievementService] Checking achievement:', ach.key, 'type:', type, 'target:', target);
    console.log('[AchievementService] Achievement criteria full:', ach.criteria);

    try {
      switch (type) {
        case 'session_count': {
          const totalSessions = sessions.length;
          console.log('[AchievementService] Session count check:', totalSessions, '>=', target, '?', totalSessions >= target);
          console.log('[AchievementService] Sessions details:', sessions.length, 'total,', sessions.filter(s => s.completed).length, 'completed');
          if (totalSessions >= target) {
            console.log('[AchievementService] ✅ Scheduling unlock for session_count:', ach.key);
            unlockBatch.push(() => unlockAchievement(userId, ach.key, ach));
          } else {
            console.log('[AchievementService] ❌ Not unlocking session_count:', ach.key, '- need', target, 'have', totalSessions);
          }
          if (progressChanged(ach.key, totalSessions)) {
            progressBatch.push(() => updateAchievementProgress(userId, ach.key, { 
              current_progress: Math.min(totalSessions, target), 
              target_progress: target 
            }));
          }
          break;
        }
        case 'single_session_minutes': {
          const lastSession = sessionData || sessions[0];
          if (lastSession && lastSession.actual_duration && lastSession.actual_duration >= target) {
            console.log('[AchievementService] Scheduling unlock for single_session_minutes:', ach.key);
            unlockBatch.push(() => unlockAchievement(userId, ach.key, ach));
          }
          break;
        }
        case 'total_reading_minutes': {
          const totalMinutes = sessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0);
          console.log('[AchievementService] Total minutes check:', totalMinutes, '>=', target, '?', totalMinutes >= target);
          console.log('[AchievementService] Sessions with durations:', sessions.map(s => s.actual_duration));
          if (totalMinutes >= target) {
            console.log('[AchievementService] ✅ Scheduling unlock for total_reading_minutes:', ach.key);
            unlockBatch.push(() => unlockAchievement(userId, ach.key, ach));
          } else {
            console.log('[AchievementService] ❌ Not unlocking total_reading_minutes:', ach.key, '- need', target, 'have', totalMinutes);
          }
          if (progressChanged(ach.key, totalMinutes)) {
            progressBatch.push(() => updateAchievementProgress(userId, ach.key, { 
              current_progress: Math.min(totalMinutes, target), 
              target_progress: target 
            }));
          }
          break;
        }
        case 'books_completed': {
          const booksFinished = books.filter(b => b.reading_status === 'finished').length;
          console.log('[AchievementService] Books completed check:', booksFinished, '>=', target, '?', booksFinished >= target);
          console.log('[AchievementService] Books statuses:', books.map(b => b.reading_status));
          if (booksFinished >= target) {
            console.log('[AchievementService] ✅ Scheduling unlock for books_completed:', ach.key);
            unlockBatch.push(() => unlockAchievement(userId, ach.key, ach));
          } else {
            console.log('[AchievementService] ❌ Not unlocking books_completed:', ach.key, '- need', target, 'have', booksFinished);
          }
          if (progressChanged(ach.key, booksFinished)) {
            progressBatch.push(() => updateAchievementProgress(userId, ach.key, { 
              current_progress: Math.min(booksFinished, target), 
              target_progress: target 
            }));
          }
          break;
        }
        case 'consecutive_days': {
          console.log('[AchievementService] Consecutive days check:', currentStreak, '>=', target, '?', currentStreak >= target);
          console.log('[AchievementService] Session dates for streak:', sessions.map(s => s.start_time?.slice(0, 10)));
          if (currentStreak >= target) {
            console.log('[AchievementService] ✅ Scheduling unlock for consecutive_days:', ach.key);
            unlockBatch.push(() => unlockAchievement(userId, ach.key, ach));
          } else {
            console.log('[AchievementService] ❌ Not unlocking consecutive_days:', ach.key, '- need', target, 'have', currentStreak);
          }
          if (progressChanged(ach.key, currentStreak)) {
            progressBatch.push(() => updateAchievementProgress(userId, ach.key, { 
              current_progress: Math.min(currentStreak, target), 
              target_progress: target 
            }));
          }
          break;
        }
        case 'pages_read': {
          // Not implemented: requires session pages input
          break;
        }
        case 'goal_complete': {
          // Not implemented: requires goal tracking
          break;
        }
        default: {
          console.warn('[AchievementService] Unknown achievement type:', type);
          break;
        }
      }
    } catch (err) {
      console.error('[AchievementService] Achievement check error:', ach.key, err);
    }
  }

  console.log('[AchievementService] Processing', unlockBatch.length, 'potential unlocks');

  // Run unlocks and progress updates in parallel
  const unlockResults = await Promise.allSettled(unlockBatch.map(async (fn, idx) => {
    try {
      const res = await fn();
      console.log(`[AchievementService] Unlock result [${idx}]:`, res);
      return res;
    } catch (error) {
      console.error(`[AchievementService] Unlock error [${idx}]:`, error);
      return null;
    }
  }));

  unlockResults.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      unlocked.push(result.value);
    }
  });

  // Process progress updates
  await Promise.allSettled(progressBatch.map(fn => fn()));

  console.log('[AchievementService] Final unlocked achievements:', unlocked.length);
  return unlocked;
}

// --- Utility: Streak Calculation (timezone/edge-case safe) ---
export function calculateStreaks(sessions: ReadingSession[]): { current: number, longest: number } {
  if (!sessions.length) return { current: 0, longest: 0 };

  // Get unique dates (UTC), sorted chronologically (oldest first)
  const uniqueDates = Array.from(
    new Set(sessions.map(s => s.start_time.slice(0, 10)))
  ).sort();

  let longestStreak = 0;
  let currentStreak = 0;

  // Calculate longest streak in history
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate current streak (from today backwards)
  const today = new Date().toISOString().slice(0, 10);
  const latestDate = uniqueDates[uniqueDates.length - 1];

  if (latestDate === today) {
    currentStreak = 1;
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const prevDate = new Date(uniqueDates[i]);
      const nextDate = new Date(uniqueDates[i + 1]);
      const dayDiff = (nextDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  return { current: currentStreak, longest: longestStreak };
}

// --- Robust unlockAchievement with cache and retry ---
async function unlockAchievement(userId: string, achievementKey: string, achievement?: Achievement): Promise<UserAchievement | null> {
  try {
    let ach = achievement;
    
    // If achievement not provided, fetch it
    if (!ach) {
      const achievementsRes = await getAchievements();
      ach = achievementsRes.data?.find(a => a.key === achievementKey);
    }
    
    if (!ach) {
      console.error('[AchievementService] Achievement not found:', achievementKey);
      return null;
    }

    console.log('[AchievementService] Unlocking achievement:', achievementKey, 'for user:', userId);
    const res = await unlockAchievementDb(userId, ach.id);
    
    if (res.data) {
      console.log('[AchievementService] Successfully unlocked:', achievementKey);
      return res.data;
    } else {
      console.warn('[AchievementService] No data returned from unlock:', achievementKey);
      return null;
    }
  } catch (err) {
    console.error('[AchievementService] unlockAchievement error:', achievementKey, err);
    return null;
  }
}

// --- Additional helper functions ---
export async function calculateUserStats(userId: string): Promise<UserStats> {
  console.log('[AchievementService] calculateUserStats for user:', userId);
  
  const [sessionsRes, booksRes] = await Promise.all([
    getRecentSessions(userId, 90), // Consistent limit
    getBooks(userId)
  ]);

  if (!sessionsRes.data || !booksRes.data) {
    console.error('[AchievementService] Failed to fetch user stats - null data');
    throw new Error('Failed to fetch user stats');
  }

  console.log('[AchievementService] Raw sessions:', sessionsRes.data.length);
  console.log('[AchievementService] Raw books:', booksRes.data.length);

  const sessions = sessionsRes.data.filter(s => s.completed);
  console.log('[AchievementService] Completed sessions:', sessions.length);
  console.log('[AchievementService] Session details:', sessions.map(s => ({ 
    completed: s.completed, 
    duration: s.actual_duration 
  })));

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0);
  const booksFinished = booksRes.data.filter(b => b.reading_status === 'finished').length;

  console.log('[AchievementService] Stats calculation:');
  console.log('- totalSessions:', totalSessions);
  console.log('- totalMinutes:', totalMinutes);
  console.log('- booksFinished:', booksFinished);

  // Use the correct streak calculation
  const { current: currentStreak, longest: longestStreak } = calculateStreaks(sessions);
  const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  const stats = { 
    totalSessions, 
    totalMinutes, 
    booksFinished, 
    currentStreak, 
    longestStreak, 
    averageSessionLength 
  };

  console.log('[AchievementService] Final stats:', stats);
  return stats;
}

export async function isAchievementUnlocked(userId: string, achievementKey: string): Promise<boolean> {
  const achievementsRes = await getAchievements();
  if (!achievementsRes.data) return false;

  const achievement = achievementsRes.data.find(a => a.key === achievementKey);
  if (!achievement) return false;

  const unlockedRes = await getUserAchievements(userId);
  if (!unlockedRes.data) return false;

  return unlockedRes.data.some(a => a.achievement_id === achievement.id);
}

export async function getUnlockedAchievements(userId: string): Promise<UserAchievement[]> {
  const res = await getUserAchievements(userId);
  return res.data || [];
}

export async function updateAchievementProgress(
  userId: string, 
  achievementKey: string, 
  progress: { current_progress: number, target_progress: number, progress_data?: any }
): Promise<AchievementProgress | null> {
  try {
    const res = await updateAchievementProgressDb(userId, achievementKey, progress);
    return res.data ?? null;
  } catch (error) {
    console.error('[AchievementService] Failed to update progress:', achievementKey, error);
    return null;
  }
}

export async function getAchievementProgress(userId: string): Promise<AchievementProgress[]> {
  const res = await getAchievementProgressDb(userId);
  // Defensive: ensure the result is an array of AchievementProgress
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}