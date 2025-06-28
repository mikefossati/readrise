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

type ReadingSession = {
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

export async function endSession(sessionId: string, end_time: string, actual_duration: number, completed: boolean): Promise<{ data: ReadingSession | null, error: string | null, loading: boolean }> {
  try {
    const { data, error } = await supabase
      .from('reading_sessions')
      .update({ end_time, actual_duration, completed })
      .eq('id', sessionId)
      .select()
      .single()
    return { data, error: error?.message ?? null, loading: false }
  } catch (error: any) {
    return { data: null, error: error.message, loading: false }
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
