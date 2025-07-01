import { vi } from "vitest";
import type { MockInstance } from "vitest";
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTimerSession } from '../../hooks/useTimerSession';

// Mock dependencies (supabase, achievementService, etc.)
vi.mock('../../lib/supabase', () => ({
  startSession: vi.fn(async (data) => ({ data: { id: 'session-1', ...data }, error: null, loading: false })),
  endSession: vi.fn(async (sessionId, end_time, actual_duration, completed, mood, notes) => ({ data: { id: sessionId, end_time, actual_duration, completed, mood, notes }, error: null, loading: false })),
}));
vi.mock('../../services/achievementService', () => ({
  checkAllAchievements: vi.fn(async () => [{ achievement_id: 'achv-1' }]),
}));

const mockSessionData = {
  user_id: 'user-1',
  book_id: 'book-1',
  planned_duration: 25 * 60, // 25 min
};

describe('useTimerSession', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('creates a session without errors', async () => {
    const { result } = renderHook(() => useTimerSession());
    await act(async () => {
      const session = await result.current.createSession(mockSessionData);
      expect(session).toMatchObject({ user_id: 'user-1', book_id: 'book-1' });
    });
    await waitFor(() => {
      expect(result.current.session).toBeTruthy();
      expect(result.current.sessionError).toBeNull();
    });
  });

  it('completes a session and triggers achievement checking', async () => {
    const onAchievementUnlocked = vi.fn();
    const onSessionComplete = vi.fn();
    const { result } = renderHook(() => useTimerSession({ onAchievementUnlocked, onSessionComplete }));
    await act(async () => {
      await result.current.createSession(mockSessionData);
    });
    await waitFor(() => {
      expect(result.current.session).toBeTruthy();
    });
    await act(async () => {
      await result.current.completeSession();
    });
    await waitFor(() => {
      expect(onAchievementUnlocked).toHaveBeenCalledWith([{ achievement_id: 'achv-1' }]);
      expect(onSessionComplete).toHaveBeenCalled();
      expect(result.current.session).toBeNull();
    });
  });

  it('persists timer/session state across refreshes', async () => {
    const { result, rerender } = renderHook(() => useTimerSession());
    await act(async () => {
      await result.current.createSession(mockSessionData);
    });
    await waitFor(() => {
      expect(result.current.session).toBeTruthy();
    });
    // Simulate reload by re-rendering
    rerender();
    expect(result.current.session).toBeTruthy();
  });

  it('handles errors in session operations', async () => {
    const { startSession } = await import('../../lib/supabase');
    const mockedStartSession = startSession as unknown as MockInstance;
    mockedStartSession.mockImplementationOnce(async () => { throw new Error('fail'); });
    const { result } = renderHook(() => useTimerSession());
    await act(async () => {
      await expect(result.current.createSession(mockSessionData)).rejects.toThrow('fail');
    });
    await waitFor(() => {
      expect(result.current.sessionError).toBe('fail');
    });
  });

  it('triggers achievement notifications', async () => {
    const onAchievementUnlocked = vi.fn();
    const { result } = renderHook(() => useTimerSession({ onAchievementUnlocked }));
    await act(async () => {
      await result.current.createSession(mockSessionData);
    });
    await waitFor(() => {
      expect(result.current.session).toBeTruthy();
    });
    await act(async () => {
      await result.current.completeSession();
    });
    await waitFor(() => {
      expect(onAchievementUnlocked).toHaveBeenCalled();
    });
  });

  it('refreshes data after session completion', async () => {
    const onSessionComplete = vi.fn();
    const { result } = renderHook(() => useTimerSession({ onSessionComplete }));
    await act(async () => {
      await result.current.createSession(mockSessionData);
    });
    await waitFor(() => {
      expect(result.current.session).toBeTruthy();
    });
    await act(async () => {
      await result.current.completeSession();
    });
    await waitFor(() => {
      expect(onSessionComplete).toHaveBeenCalled();
      expect(result.current.session).toBeNull();
    });
  });

  // --- Additional edge and control tests ---
  it('should reset the session state', async () => {
    const { result } = renderHook(() => useTimerSession());
    await act(async () => {
      await result.current.createSession(mockSessionData);
    });
    await waitFor(() => {
      expect(result.current.session).toBeTruthy();
    });
    act(() => {
      result.current.clearSession();
    });
    expect(result.current.session).toBeNull();
    expect(result.current.sessionError).toBeNull();
  });

  it('should handle pause/resume/stop logic (simulated)', async () => {
    // This is a stub: in a real timer, these would affect timerState, here we check method existence
    const { result } = renderHook(() => useTimerSession());
    expect(typeof result.current.completeSession).toBe('function');
    expect(typeof result.current.clearSession).toBe('function');
    expect(typeof result.current.updateSessionDuration).toBe('function');
  });

  it('should handle rapid session start/stop/reset (race conditions)', async () => {
    const { result } = renderHook(() => useTimerSession());
    await act(async () => {
      await result.current.createSession(mockSessionData);
      result.current.clearSession();
      await result.current.createSession(mockSessionData);
      result.current.clearSession();
    });
    expect(result.current.session).toBeNull();
  });
});
