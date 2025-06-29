import { faker } from '@faker-js/faker';
import { createReadingSession, createAchievement, createUserAchievement, createBook } from './factories';
import * as supabase from '../../lib/supabase';
import { vi } from 'vitest';

vi.mock('../../lib/supabase', () => ({
  getAchievements: vi.fn(),
  getUserAchievements: vi.fn(),
  getRecentSessions: vi.fn(),
  getBooks: vi.fn(),
  getAchievementProgress: vi.fn(),
  updateAchievementProgress: vi.fn(),
  unlockAchievement: vi.fn(),
}));

// Date utilities for streak/achievement tests
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

// Build array of consecutive sessions for streak tests
export function buildConsecutiveSessions(startDate: string, count: number): ReturnType<typeof createReadingSession>[] {
  return Array.from({ length: count }, (_, i) =>
    createReadingSession({ start_time: addDays(startDate, i) + 'T12:00:00.000Z' })
  );
}

// Reset all mock data (example for supabase mocks)
export function resetAllMocks() {
  // Import and reset supabase mocks
  try {
    const supabaseMocks = require('../mocks/supabase');
    supabaseMocks.resetSupabaseMocks();
  } catch {}
}

/**
 * DRY helper for mocking all required Supabase functions for achievementService tests.
 * Usage:
 *   setupSupabaseMocks({
 *     achievements, userAchievements, unlockedAchievement, sessions, books, achievementProgress, updateAchievementProgress
 *   })
 */
export function setupSupabaseMocks({
  achievements = [],
  userAchievements = [],
  unlockedAchievement = null,
  sessions = [],
  books = [],
  achievementProgress = [],
  updateAchievementProgress = [],
}: {
  achievements?: any[],
  userAchievements?: any[],
  unlockedAchievement?: any,
  sessions?: any[],
  books?: any[],
  achievementProgress?: any[],
  updateAchievementProgress?: any[],
}) {
  (supabase.getAchievements as vi.Mock).mockResolvedValue({ data: achievements });
  (supabase.getUserAchievements as vi.Mock).mockResolvedValue({ data: userAchievements });
  (supabase.getRecentSessions as vi.Mock).mockResolvedValue({ data: sessions });
  (supabase.getBooks as vi.Mock).mockResolvedValue({ data: books });
  (supabase.getAchievementProgress as vi.Mock).mockResolvedValue({ data: achievementProgress });
  (supabase.updateAchievementProgress as vi.Mock).mockResolvedValue({ data: updateAchievementProgress });
  if (unlockedAchievement) {
    (supabase.unlockAchievement as vi.Mock).mockImplementation(() => Promise.resolve({ data: unlockedAchievement }));
  } else {
    (supabase.unlockAchievement as vi.Mock).mockResolvedValue({ data: null });
  }
}

// Custom assertion helpers (example)
export function expectAchievementUnlocked(achievements: any[], achievementId: string) {
  const found = achievements.some(a => a.achievement_id === achievementId);
  if (!found) {
    throw new Error(
      `Expected unlocked achievements to include achievement_id: ${achievementId}\nActual unlocked: ${JSON.stringify(achievements, null, 2)}`
    );
  }
  expect(found).toBe(true);
}
