import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { Book, ReadingSession } from '../../lib/supabase';
// User type is not exported from supabase, define a minimal mock type
export type User = { id: string; email: string; };


export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    ...overrides,
  } as User;
}

export function createMockBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-1',
    title: 'Test Book',
    author: 'Author',
    reading_status: 'currently_reading',
    ...overrides,
  } as Book;
}

export function createMockSession(overrides: Partial<ReadingSession> = {}): ReadingSession {
  return {
    id: 'session-1',
    user_id: 'user-1',
    book_id: 'book-1',
    planned_duration: 1500,
    actual_duration: 0,
    completed: false,
    start_time: new Date().toISOString(),
    ...overrides,
  } as ReadingSession;
}

export function renderWithProviders(ui: ReactElement, options?: Record<string, any>) {
  // Optionally wrap with context/providers here
  return render(ui, options);
}
