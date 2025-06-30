import * as dashboardService from '../dashboardService';

describe('dashboardService', () => {
  const now = new Date('2025-06-29T11:00:00-04:00');

  describe('getTotalBooks', () => {
    it('returns 0 for no books', () => {
      expect(dashboardService.getTotalBooks([])).toBe(0);
    });
    it('returns correct count for books', () => {
      expect(dashboardService.getTotalBooks([{ id: '1' } as any, { id: '2' } as any])).toBe(2);
    });
  });

  describe('getBooksThisMonth', () => {
    it('counts books created this month', () => {
      const books = [
        { id: '1', created_at: '2025-06-01T00:00:00Z' },
        { id: '2', created_at: '2025-06-15T12:00:00Z' },
        { id: '3', created_at: '2025-05-31T23:59:59Z' }, // previous month
      ];
      expect(dashboardService.getBooksThisMonth(books as any, now)).toBe(2);
    });
    it('returns 0 if no created_at', () => {
      expect(dashboardService.getBooksThisMonth([{ id: '1' }] as any, now)).toBe(0);
    });
  });

  describe('getTodayMinutes', () => {
    it('sums actual_duration for today', () => {
      const sessions = [
        { start_time: '2025-06-29T09:00:00-04:00', actual_duration: 600 }, // 10m
        { start_time: '2025-06-29T10:00:00-04:00', actual_duration: 1200 }, // 20m
        { start_time: '2025-06-28T10:00:00-04:00', actual_duration: 1800 }, // yesterday
      ];
      expect(dashboardService.getTodayMinutes(sessions as any, now)).toBe(30);
    });
    it('falls back to end_time diff if no actual_duration', () => {
      const sessions = [
        { start_time: '2025-06-29T09:00:00-04:00', end_time: '2025-06-29T09:15:00-04:00' }, // 15m
      ];
      expect(dashboardService.getTodayMinutes(sessions as any, now)).toBe(15);
    });
  });

  describe('getCurrentStreak', () => {
    it('returns correct streak for consecutive days', () => {
      const sessions = [
        { start_time: '2025-06-29T09:00:00-04:00' },
        { start_time: '2025-06-28T10:00:00-04:00' },
        { start_time: '2025-06-27T08:00:00-04:00' },
      ];
      expect(dashboardService.getCurrentStreak(sessions as any, now)).toBe(3);
    });
    it('returns 0 if no session today', () => {
      const sessions = [
        { start_time: '2025-06-28T10:00:00-04:00' },
        { start_time: '2025-06-27T08:00:00-04:00' },
      ];
      expect(dashboardService.getCurrentStreak(sessions as any, now)).toBe(0);
    });
    it('returns streak up to first missing day', () => {
      const sessions = [
        { start_time: '2025-06-29T09:00:00-04:00' },
        { start_time: '2025-06-27T08:00:00-04:00' },
      ];
      expect(dashboardService.getCurrentStreak(sessions as any, now)).toBe(1);
    });
  });

  describe('getWeeklyGoalProgress', () => {
    it('returns correct minutes and percent', () => {
      const sessions = [
        { start_time: '2025-06-23T09:00:00-04:00', actual_duration: 600 }, // Monday
        { start_time: '2025-06-27T10:00:00-04:00', actual_duration: 1800 }, // Friday
        { start_time: '2025-06-29T10:00:00-04:00', actual_duration: 1200 }, // Sunday
      ];
      const res = dashboardService.getWeeklyGoalProgress(sessions as any, now, 60);
      expect(res.minutes).toBe(60);
      expect(res.percent).toBe(100);
    });
    it('returns 0 percent if weeklyGoal is 0', () => {
      const sessions = [
        { start_time: '2025-06-29T10:00:00-04:00', actual_duration: 1200 },
      ];
      const res = dashboardService.getWeeklyGoalProgress(sessions as any, now, 0);
      expect(res.percent).toBe(0);
    });
  });
});
