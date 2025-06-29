import { vi } from 'vitest';

export const getAchievements = vi.fn();
export const getUserAchievements = vi.fn();
export const unlockAchievement = vi.fn();
export const getAchievementProgress = vi.fn();
export const updateAchievementProgress = vi.fn();
export const getBooks = vi.fn();
export const getRecentSessions = vi.fn();

export function resetSupabaseMocks() {
  getAchievements.mockReset();
  getUserAchievements.mockReset();
  unlockAchievement.mockReset();
  getAchievementProgress.mockReset();
  updateAchievementProgress.mockReset();
  getBooks.mockReset();
  getRecentSessions.mockReset();
}
