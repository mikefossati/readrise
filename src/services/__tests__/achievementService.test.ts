/// <reference types="vitest" />
import { vi } from 'vitest';
import type { MockInstance } from 'vitest';
// --- CRITICAL: MOCK SUPABASE MODULE ---
import * as supabase from '../../lib/supabase';

vi.mock('../../lib/supabase', async () => {
  const actual = await vi.importActual<typeof supabase>('../../lib/supabase');
  return {
    ...actual,
    getAchievements: vi.fn(),
    getUserAchievements: vi.fn(),
    unlockAchievement: vi.fn(),
    getAchievementProgress: vi.fn(),
    updateAchievementProgress: vi.fn(),
    getBooks: vi.fn(),
    getRecentSessions: vi.fn(),
  };
});


import * as achievementService from '../achievementService';
import { createReadingSession, createAchievement, createUserAchievement } from '../../test/utils/factories';
import { addDays, buildConsecutiveSessions, resetAllMocks, expectAchievementUnlocked, setupSupabaseMocks } from '../../test/utils/testHelpers';

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  resetAllMocks();
});

// --- STREAK CALCULATION TESTS ---
describe('calculateStreaks', () => {
  it('calculates a 7-day consecutive streak ending today', async () => {
    // Use today as the last session date
    const today = new Date().toISOString().slice(0, 10);
    const sessions = buildConsecutiveSessions(addDays(today, -6), 7); // 7 days ending today
    const { current, longest } = achievementService.calculateStreaks(sessions);
    expect(current).toBe(7);
    expect(longest).toBeGreaterThanOrEqual(7);
  });

  it('returns 0 streak if no session today', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const sessions = buildConsecutiveSessions(addDays(today, -7), 6); // last session not today
    const { current } = achievementService.calculateStreaks(sessions);
    expect(current).toBe(0);
  });

  // Add more streak edge cases here
});

// --- ACHIEVEMENT CHECKING TESTS ---
describe('checkAllAchievements', () => {
  it('unlocks achievement for session_count', async () => {
    // Mock achievement data with correct key and criteria
    const achievement = createAchievement('session_count', 'session_count', 10);
    setupSupabaseMocks({
      achievements: [achievement],
      userAchievements: [],
      unlockedAchievement: createUserAchievement(achievement.id, { achievement_id: achievement.id }),
      sessions: Array.from({ length: 10 }, () => ({ ...createReadingSession(), completed: true })),
      books: [],
      achievementProgress: [],
      updateAchievementProgress: [],
    });

    // Explicitly mock all required supabase functions to ensure correct return shapes
    (supabase.getAchievements as unknown as MockInstance).mockResolvedValue({ ok: true, data: [achievement], error: null });
    (supabase.getUserAchievements as unknown as MockInstance).mockResolvedValue({ ok: true, data: [], error: null });
    (supabase.getAchievementProgress as unknown as MockInstance).mockResolvedValue({ ok: true, data: [], error: null });
    (supabase.getRecentSessions as unknown as MockInstance).mockResolvedValue({ ok: true, data: Array.from({ length: 10 }, () => ({ ...createReadingSession(), completed: true })), error: null });
    (supabase.getBooks as unknown as MockInstance).mockResolvedValue({ ok: true, data: [], error: null });
    (supabase.unlockAchievement as unknown as MockInstance).mockResolvedValue({ ok: true, data: createUserAchievement(achievement.id, { achievement_id: achievement.id }), error: null });
    (supabase.updateAchievementProgress as unknown as MockInstance).mockResolvedValue({ ok: true, data: null, error: null });

    const unlocked = await achievementService.checkAllAchievements('user-1');
    expect(supabase.unlockAchievement).toHaveBeenCalled();
    expectAchievementUnlocked(unlocked, achievement.id);
  });

  // Add more achievement type tests here
});

// --- ERROR HANDLING TESTS ---
describe('Error handling', () => {
  it('handles API failure gracefully', async () => {
    (supabase.getAchievements as unknown as MockInstance).mockRejectedValue(new Error('API error'));
    (supabase.getUserAchievements as unknown as MockInstance).mockResolvedValue({ data: null });
    const result = await achievementService.getUnlockedAchievements('user-1');
    expect(result).toEqual([]);
  });
});

// --- PERFORMANCE TESTS ---
describe('Performance', () => {
  it('handles large session datasets efficiently', async () => {
    const sessions = Array.from({ length: 1000 }, () => createReadingSession());
    // You may want to time or memory profile this in real tests
    const { current, longest } = achievementService.calculateStreaks(sessions);
    expect(longest).toBeGreaterThanOrEqual(current);
  });
});

// --- EDGE CASES ---
describe('Edge Cases', () => {
  it('returns empty if no achievements configured', async () => {
    (supabase.getAchievements as unknown as MockInstance).mockResolvedValue({ data: [] });
    const result = await achievementService.getUnlockedAchievements('user-1');
    expect(result).toEqual([]);
  });
  // More edge cases can be added
});
