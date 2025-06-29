import { useState, useCallback } from "react";
import { startSession, endSession } from "../lib/supabase";
import type { ReadingSession } from "../lib/supabase";
import * as achievementService from "../services/achievementService";

interface UseTimerSessionOptions {
  onSessionComplete?: (session: ReadingSession) => void;
  onAchievementUnlocked?: (achievements: any[]) => void;
}

interface UseTimerSessionReturn {
  session: ReadingSession | null;
  sessionLoading: boolean;
  sessionError: string | null;
  createSession: (data: {
    user_id: string;
    book_id: string;
    planned_duration: number;
  }) => Promise<ReadingSession>;
  updateSessionDuration: (actualDuration: number) => void;
  completeSession: (opts?: { 
    mood?: string; 
    notes?: string;
    pagesRead?: number;
  }) => Promise<void>;
  clearSession: () => void;
}

export function useTimerSession(options: UseTimerSessionOptions = {}): UseTimerSessionReturn {
  const { onSessionComplete, onAchievementUnlocked } = options;
  
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const createSession = useCallback(async (data: {
    user_id: string;
    book_id: string;
    planned_duration: number;
  }): Promise<ReadingSession> => {
    setSessionLoading(true);
    setSessionError(null);
    
    try {
      const now = new Date().toISOString();
      const res = await startSession({
        user_id: data.user_id,
        book_id: data.book_id,
        start_time: now,
        planned_duration: data.planned_duration,
        session_type: 'focused',
        notes: null,
        mood: null,
      });
      
      if (res.error) {
        throw new Error(res.error);
      }
      
      if (!res.data) {
        throw new Error('Failed to create session - no data returned');
      }
      
      const newSession = res.data;
      setSession(newSession);
      return newSession;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      setSessionError(errorMessage);
      throw error;
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const updateSessionDuration = useCallback((actualDuration: number) => {
    if (session) {
      setSession(prev => {
        if (!prev) return null;
        if (prev.actual_duration === actualDuration) return prev;
        return { ...prev, actual_duration: actualDuration };
      });
    }
  }, [session]);

  const completeSession = useCallback(async (opts?: { 
    mood?: string; 
    notes?: string;
    pagesRead?: number;
  }) => {
    if (!session) {
      throw new Error('No active session to complete');
    }
    
    setSessionLoading(true);
    setSessionError(null);
    
    try {
      const endTime = new Date().toISOString();
      const actualDuration = session.actual_duration || 0;
      const completed = actualDuration > 0;
      
      // Update session in database
      const res = await endSession(
        session.id, 
        endTime, 
        actualDuration, 
        completed, 
        opts?.mood, 
        opts?.notes
      );
      
      if (res.error) {
        throw new Error(res.error);
      }
      
      const completedSession = res.data || session;
      
      // Check for achievements
      try {
        const unlockedAchievements = await achievementService.checkAllAchievements(
          session.user_id, 
          completedSession
        );
        
        if (unlockedAchievements.length > 0) {
          onAchievementUnlocked?.(unlockedAchievements);
        }
      } catch (achievementError) {
        console.error('Achievement checking failed:', achievementError);
        // Don't throw - achievement failure shouldn't break session completion
      }
      
      // Trigger completion callback
      onSessionComplete?.(completedSession);
      
      // Clear the session from state
      setSession(null);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete session';
      setSessionError(errorMessage);
      throw error;
    } finally {
      setSessionLoading(false);
    }
  }, [session, onSessionComplete, onAchievementUnlocked]);

  const clearSession = useCallback(() => {
    setSession(null);
    setSessionError(null);
  }, []);

  return {
    session,
    sessionLoading,
    sessionError,
    createSession,
    updateSessionDuration,
    completeSession,
    clearSession,
  };
}