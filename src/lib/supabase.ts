import { createClient } from '@supabase/supabase-js'

// Types for your schema
export type Book = {
  id: string
  user_id: string
  title: string
  author: string
  cover_url: string | null
  cover_color: string | null
  rating: number | null
  reading_status: 'want_to_read' | 'currently_reading' | 'finished'
  total_reading_time: number | null
}

export type ReadingSession = {
  id: string
  user_id: string
  book_id: string
  start_time: string
  end_time: string | null
  planned_duration: number | null
  actual_duration: number | null
  session_type: 'focused' | 'open'
  notes: string | null
  completed: boolean
  mood: string | null
}

type Profile = {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
}

// Environment variables (should be set in .env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Book Service Functions
import type { Result, SupabaseError } from '../types/Result';

export async function getBooks(userId: string): Promise<Result<Book[]>> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { userId }, from: 'getBooks' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data: data ?? [], error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { userId }, from: 'getBooks' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function addBook(book: Omit<Book, 'id'>): Promise<Result<Book>> {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert([book])
      .select()
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { book }, from: 'addBook' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { book }, from: 'addBook' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function updateBookStatus(bookId: string, reading_status: Book['reading_status']): Promise<Result<Book>> {
  try {
    const { data, error } = await supabase
      .from('books')
      .update({ reading_status })
      .eq('id', bookId)
      .select()
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { bookId, reading_status }, from: 'updateBookStatus' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { bookId, reading_status }, from: 'updateBookStatus' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function updateBookRating(bookId: string, rating: number): Promise<Result<Book>> {
  try {
    const { data, error } = await supabase
      .from('books')
      .update({ rating })
      .eq('id', bookId)
      .select()
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { bookId, rating }, from: 'updateBookRating' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { bookId, rating }, from: 'updateBookRating' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

// Reading Session Functions
export async function startSession(session: Omit<ReadingSession, 'id' | 'end_time' | 'actual_duration' | 'completed'>): Promise<Result<ReadingSession>> {
  try {
    const { data, error } = await supabase
      .from('reading_sessions')
      .insert([{ ...session, end_time: null, actual_duration: null, completed: false }])
      .select()
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { session }, from: 'startSession' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { session }, from: 'startSession' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function endSession(
  sessionId: string,
  end_time: string,
  actual_duration: number,
  completed: boolean,
  mood?: string,
  notes?: string
): Promise<Result<ReadingSession>> {
  try {
    const updateObj: any = { end_time, actual_duration, completed };
    if (mood !== undefined) updateObj.mood = mood;
    if (notes !== undefined) updateObj.notes = notes;
    const { data, error } = await supabase
      .from('reading_sessions')
      .update(updateObj)
      .eq('id', sessionId)
      .select()
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { sessionId, end_time, actual_duration, completed, mood, notes }, from: 'endSession' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { sessionId, end_time, actual_duration, completed, mood, notes }, from: 'endSession' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function getRecentSessions(userId: string, limit = 10): Promise<Result<ReadingSession[]>> {
  try {
    const { data, error } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit);
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { userId, limit }, from: 'getRecentSessions' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data: data ?? [], error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { userId, limit }, from: 'getRecentSessions' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

// Achievement & Goal Types
import type {
  Achievement,
  UserAchievement,
  UserGoal,
  AchievementProgress
} from '../types/achievements';

// Achievement Service Functions
export async function getAchievements(): Promise<Result<Achievement[]>> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, from: 'getAchievements' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data: data ?? [], error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', from: 'getAchievements' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function getUserAchievements(userId: string): Promise<Result<UserAchievement[]>> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievement_id(*)')
      .eq('user_id', userId);
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { userId }, from: 'getUserAchievements' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data: data ?? [], error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { userId }, from: 'getUserAchievements' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<Result<UserAchievement>> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{ user_id: userId, achievement_id: achievementId }])
      .select()
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { userId, achievementId }, from: 'unlockAchievement' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { userId, achievementId }, from: 'unlockAchievement' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function getAchievementProgress(userId: string): Promise<Result<AchievementProgress[]>> {
  try {
    const { data, error } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { userId }, from: 'getAchievementProgress' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data: data ?? [], error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { userId }, from: 'getAchievementProgress' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function updateAchievementProgress(userId: string, achievementKey: string, progress: { current_progress: number, target_progress: number, progress_data?: any }): Promise<Result<AchievementProgress>> {
  try {
    const upsertPayload = {
      user_id: userId,
      achievement_key: achievementKey,
      current_progress: progress.current_progress,
      target_progress: progress.target_progress,
      ...(progress.progress_data ? { progress_data: progress.progress_data } : {}),
      last_updated: new Date().toISOString(),
    };
    console.log('[achievement_progress upsert payload]', upsertPayload);
    const { data, error } = await supabase
      .from('achievement_progress')
      .upsert([
        upsertPayload
      ], { onConflict: 'user_id,achievement_key' })
      .select()
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { userId, achievementKey, progress }, from: 'updateAchievementProgress' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { userId, achievementKey, progress }, from: 'updateAchievementProgress' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

// Goal Service Functions
export async function getUserGoals(userId: string): Promise<Result<UserGoal[]>> {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { userId }, from: 'getUserGoals' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data: data ?? [], error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { userId }, from: 'getUserGoals' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function createUserGoal(goalData: Omit<UserGoal, 'id' | 'created_at' | 'updated_at'>): Promise<Result<UserGoal>> {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .insert([{ ...goalData }])
      .select()
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { goalData }, from: 'createUserGoal' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { goalData }, from: 'createUserGoal' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function updateGoalProgress(goalId: string, newProgress: number): Promise<Result<UserGoal>> {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .update({ current_value: newProgress, updated_at: new Date().toISOString() })
      .eq('id', goalId)
      .select()
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { goalId, newProgress }, from: 'updateGoalProgress' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { goalId, newProgress }, from: 'updateGoalProgress' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

// Profile Functions
export async function getProfile(userId: string): Promise<Result<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { userId }, from: 'getProfile' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { userId }, from: 'getProfile' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Result<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) {
      const err: SupabaseError = { message: error.message, code: error.code, context: { userId, updates }, from: 'updateProfile' };
      console.error('[SupabaseError]', err);
      return { ok: false, data: null, error: err };
    }
    return { ok: true, data, error: null };
  } catch (error: any) {
    const err: SupabaseError = { message: error.message || 'Unknown error', context: { userId, updates }, from: 'updateProfile' };
    console.error('[SupabaseError]', err);
    return { ok: false, data: null, error: err };
  }
}
