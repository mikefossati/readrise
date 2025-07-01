import { vi } from 'vitest';
import * as supabase from '../../lib/supabase';
import * as achievementService from '../../services/achievementService';
import { createMockSession } from '../../test/utils/testUtils';
import { describe, it, expect, beforeEach } from 'vitest';

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

describe('calculateStreaks', () => {
  it('calculates a 7-day consecutive streak ending today', async () => {
    // Simulate 7 sessions, one per day, ending today
    const today = new Date();
    const sessions = Array.from({ length: 7 }, (_, i) => createMockSession({
      start_time: new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      completed: true
    }));
    const { current, longest } = achievementService.calculateStreaks(sessions);
    expect(current).toBe(7);
    expect(longest).toBeGreaterThanOrEqual(7);
  });

  it('returns 0 streak if no session today', async () => {
    const today = new Date();
    const sessions = Array.from({ length: 6 }, (_, i) => createMockSession({
      start_time: new Date(today.getTime() - (7 - i) * 24 * 60 * 60 * 1000).toISOString(),
      completed: true
    }));
    const { current } = achievementService.calculateStreaks(sessions);
    expect(current).toBe(0);
  });

  it('handles gaps in streaks', async () => {
    const today = new Date();
    // 3 sessions, skip a day, 2 sessions
    const sessions = [
      createMockSession({ start_time: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), completed: true }),
      createMockSession({ start_time: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), completed: true }),
      createMockSession({ start_time: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), completed: true }),
      // skip a day
      createMockSession({ start_time: new Date(today.getTime() - 0 * 24 * 60 * 60 * 1000).toISOString(), completed: true }),
      createMockSession({ start_time: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), completed: true }),
    ];
    const { current } = achievementService.calculateStreaks(sessions);
    expect(current).toBeGreaterThanOrEqual(2);
  });
});

describe('checkAllAchievements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unlocks achievement for session_count', async () => {
    // Mock achievement data with correct key and criteria
    const achievement = { id: 'achv-1', key: 'session_count', criteria: { type: 'session_count', target: 1 } };
    (supabase.getAchievements as any).mockResolvedValue({ ok: true, data: [achievement] });
    (supabase.getBooks as any).mockResolvedValue({ ok: true, data: [] });
    (supabase.getUserAchievements as any).mockResolvedValue({ ok: true, data: [] });
    (supabase.getAchievementProgress as any).mockResolvedValue({ ok: true, data: [] });
    (supabase.getRecentSessions as any).mockResolvedValue({ ok: true, data: [
      { id: 'session-1', user_id: 'user-1', book_id: 'book-1', start_time: new Date().toISOString(), planned_duration: 1500, actual_duration: 1500, completed: true, end_time: new Date().toISOString(), session_type: 'focused', notes: null, mood: null },
      { id: 'session-2', user_id: 'user-1', book_id: 'book-2', start_time: new Date().toISOString(), planned_duration: 1200, actual_duration: 1200, completed: true, end_time: new Date().toISOString(), session_type: 'focused', notes: null, mood: null }
    ] });
    (supabase.unlockAchievement as any).mockImplementation((_userId: string, achievementId: string) => Promise.resolve({ data: { achievement_id: achievementId } }));
    // Provide a minimal ReadingSession mock as second argument
    const session: any = { id: 'session-1', user_id: 'user-1', book_id: 'book-1', start_time: new Date().toISOString(), planned_duration: 1500, actual_duration: 1500, completed: true, end_time: new Date().toISOString(), session_type: 'focused', notes: null, mood: null };
    const unlocked = await achievementService.checkAllAchievements('user-1', session);
    console.log('TEST DEBUG: unlocked for session_count', unlocked);
    expect(unlocked).toEqual([{ achievement_id: 'achv-1' }]);
  });

  it('handles multiple simultaneous unlocks', async () => {
    const achievements = [
      { id: 'achv-2', key: 'session_count', criteria: { type: 'session_count', target: 1 } },
      { id: 'achv-3', key: 'single_session_minutes', criteria: { type: 'single_session_minutes', target: 15 } }
    ];
    (supabase.getAchievements as any).mockResolvedValue({ ok: true, data: achievements });
    (supabase.getBooks as any).mockResolvedValue({ ok: true, data: [] });
    (supabase.getUserAchievements as any).mockResolvedValue({ ok: true, data: [] });
    (supabase.getAchievementProgress as any).mockResolvedValue({ ok: true, data: [] });
    (supabase.getRecentSessions as any).mockResolvedValue({ ok: true, data: [
      // Satisfy session_count (2 completed sessions) and single_session_minutes (actual_duration >= 15)
      { id: 'session-2a', user_id: 'user-1', book_id: 'book-1', start_time: new Date().toISOString(), planned_duration: 900, actual_duration: 900, completed: true, end_time: new Date().toISOString(), session_type: 'focused', notes: null, mood: null },
      { id: 'session-2b', user_id: 'user-1', book_id: 'book-2', start_time: new Date().toISOString(), planned_duration: 900, actual_duration: 20, completed: true, end_time: new Date().toISOString(), session_type: 'focused', notes: null, mood: null }
    ] });
    (supabase.unlockAchievement as any).mockImplementation((_userId: string, achievementId: string) => Promise.resolve({ data: { achievement_id: achievementId } }));
    const session: any = { id: 'session-2', user_id: 'user-1', book_id: 'book-1', start_time: new Date().toISOString(), planned_duration: 900, actual_duration: 900, completed: true, end_time: new Date().toISOString(), session_type: 'focused', notes: null, mood: null };
    const unlocked = await achievementService.checkAllAchievements('user-1', session);
    console.log('TEST DEBUG: unlocked for multiple', unlocked);
    expect(unlocked).toEqual(expect.arrayContaining([
      { achievement_id: 'achv-2' },
      { achievement_id: 'achv-3' }
    ]));
  });

  it('returns empty if no achievements configured', async () => {
    (supabase.getAchievements as any).mockResolvedValue({ ok: true, data: [] });
    const result = await achievementService.getUnlockedAchievements('user-1');
    expect(result).toEqual([]);
  });

  it('handles unlock errors gracefully', async () => {
    const achievement = { id: 'achv-4', key: 'fail_unlock', criteria: { type: 'session_count', target: 1 } };
    (supabase.getAchievements as any).mockResolvedValue({ ok: true, data: [achievement] });
    (supabase.getBooks as any).mockResolvedValue({ ok: true, data: [] });
    (supabase.getUserAchievements as any).mockResolvedValue({ ok: true, data: [] });
    (supabase.getAchievementProgress as any).mockResolvedValue({ ok: true, data: [] });
    (supabase.getRecentSessions as any).mockResolvedValue({ ok: true, data: [
      { id: 'session-3', user_id: 'user-1', book_id: 'book-1', start_time: new Date().toISOString(), planned_duration: 900, actual_duration: 900, completed: true, end_time: new Date().toISOString(), session_type: 'focused', notes: null, mood: null }
    ] });
    (supabase.unlockAchievement as any).mockRejectedValue(new Error('Unlock failed'));
    const session: any = { id: 'session-3', user_id: 'user-1', book_id: 'book-1', start_time: new Date().toISOString(), planned_duration: 900, actual_duration: 900, completed: true, end_time: new Date().toISOString(), session_type: 'focused', notes: null, mood: null };
    await expect(achievementService.checkAllAchievements('user-1', session)).resolves.toEqual([]);
  });
});
