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
export async function getBooks(userId: string): Promise<{ data: Book[] | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
    return { data, error: error?.message ?? null, loading: false }
  } catch (error: any) {
    return { data: null, error: error.message, loading: false }
  }
}

export async function addBook(book: Omit<Book, 'id'>): Promise<{ data: Book | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert([book])
      .select()
      .single()
    return { data, error: error?.message ?? null, loading: false }
  } catch (error: any) {
    return { data: null, error: error.message, loading: false }
  }
}

export async function updateBookStatus(bookId: string, reading_status: Book['reading_status']): Promise<{ data: Book | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('books')
      .update({ reading_status })
      .eq('id', bookId)
      .select()
      .single()
    return { data, error: error?.message ?? null, loading: false }
  } catch (error: any) {
    return { data: null, error: error.message, loading: false }
  }
}

export async function updateBookRating(bookId: string, rating: number): Promise<{ data: Book | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('books')
      .update({ rating })
      .eq('id', bookId)
      .select()
      .single()
    return { data, error: error?.message ?? null, loading: false }
  } catch (error: any) {
    return { data: null, error: error.message, loading: false }
  }
}

// Reading Session Functions
export async function startSession(session: Omit<ReadingSession, 'id' | 'end_time' | 'actual_duration' | 'completed'>): Promise<{ data: ReadingSession | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('reading_sessions')
      .insert([{ ...session, end_time: null, actual_duration: null, completed: false }])
      .select()
      .single()
    return { data, error: error?.message ?? null, loading: false }
  } catch (error: any) {
    return { data: null, error: error.message, loading: false }
  }
}

export async function endSession(
  sessionId: string,
  end_time: string,
  actual_duration: number,
  completed: boolean,
  mood?: string,
  notes?: string
): Promise<{ data: ReadingSession | null, error: string | null, loading: boolean }> {
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
    return { data, error: error?.message ?? null, loading: false };
  } catch (error: any) {
    return { data: null, error: error.message, loading: false };
  }
}

export async function getRecentSessions(userId: string, limit = 10): Promise<{ data: ReadingSession[] | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit)
    return { data, error: error?.message ?? null, loading: false }
  } catch (error: any) {
    return { data: null, error: error.message, loading: false }
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
export async function getAchievements(): Promise<{ data: Achievement[] | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);
    return { data, error: error?.message ?? null, loading: false };
  } catch (error: any) {
    return { data: null, error: error.message, loading: false };
  }
}

export async function getUserAchievements(userId: string): Promise<{ data: UserAchievement[] | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievement_id(*)')
      .eq('user_id', userId);
    return { data, error: error?.message ?? null, loading: false };
  } catch (error: any) {
    return { data: null, error: error.message, loading: false };
  }
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<{ data: UserAchievement | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{ user_id: userId, achievement_id: achievementId }])
      .select()
      .single();
    return { data, error: error?.message ?? null, loading: false };
  } catch (error: any) {
    return { data: null, error: error.message, loading: false };
  }
}

export async function getAchievementProgress(userId: string): Promise<{ data: AchievementProgress[] | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('user_id', userId);
    return { data, error: error?.message ?? null, loading: false };
  } catch (error: any) {
    return { data: null, error: error.message, loading: false };
  }
}

export async function updateAchievementProgress(userId: string, achievementKey: string, progress: { current_progress: number, target_progress: number, progress_data?: any }): Promise<{ data: AchievementProgress | null, error: string | null, loading: boolean }> {
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
    return { data, error: error?.message ?? null, loading: false };
  } catch (error: any) {
    return { data: null, error: error.message, loading: false };
  }
}

// Goal Service Functions
export async function getUserGoals(userId: string): Promise<{ data: UserGoal[] | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    return { data, error: error?.message ?? null, loading: false };
  } catch (error: any) {
    return { data: null, error: error.message, loading: false };
  }
}

export async function createUserGoal(goalData: Omit<UserGoal, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: UserGoal | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .insert([{ ...goalData }])
      .select()
      .single();
    return { data, error: error?.message ?? null, loading: false };
  } catch (error: any) {
    return { data: null, error: error.message, loading: false };
  }
}

export async function updateGoalProgress(goalId: string, newProgress: number): Promise<{ data: UserGoal | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .update({ current_value: newProgress, updated_at: new Date().toISOString() })
      .eq('id', goalId)
      .select()
      .single();
    return { data, error: error?.message ?? null, loading: false };
  } catch (error: any) {
    return { data: null, error: error.message, loading: false };
  }
}

// Profile Functions
export async function getProfile(userId: string): Promise<{ data: Profile | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error: error?.message ?? null, loading: false }
  } catch (error: any) {
    return { data: null, error: error.message, loading: false }
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<{ data: Profile | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error: error?.message ?? null, loading: false }
  } catch (error: any) {
    return { data: null, error: error.message, loading: false }
  }
}
