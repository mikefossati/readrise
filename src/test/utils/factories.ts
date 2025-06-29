import { faker } from '@faker-js/faker';
import type { ReadingSession, Book } from '../../lib/supabase';
import type { Achievement, UserAchievement, AchievementCriteria } from '../../types/achievements';

// Factory for ReadingSession with optional date override
export function createReadingSession(overrides: Partial<ReadingSession> = {}): ReadingSession {
  const now = overrides.start_time || faker.date.recent().toISOString();
  const base: ReadingSession = {
    id: faker.string.uuid(),
    user_id: faker.string.uuid(),
    book_id: faker.string.uuid(),
    start_time: now,
    end_time: overrides.end_time || null,
    planned_duration: overrides.planned_duration ?? faker.number.int({ min: 10, max: 120 }),
    actual_duration: overrides.actual_duration ?? faker.number.int({ min: 5, max: 120 }),
    session_type: overrides.session_type || 'focused',
    notes: overrides.notes ?? null, // always string or null
    completed: overrides.completed ?? false,
    mood: overrides.mood ?? null,
  };
  // Spread any other overrides (except notes, completed, mood which are handled above)
  return { ...base, ...overrides, notes: base.notes, completed: base.completed, mood: base.mood };

}

// Factory for session on specific date (YYYY-MM-DD)
export function createSession(dateStr: string, overrides: Partial<ReadingSession> = {}): ReadingSession {
  const iso = dateStr + 'T12:00:00.000Z';
  return createReadingSession({ start_time: iso, ...overrides });
}

// Factory for Achievement
export function createAchievement(key: string, type: AchievementCriteria['type'], target: number, overrides: Partial<Achievement> = {}): Achievement {
  return {
    id: faker.string.uuid(),
    key,
    title: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    criteria: { type, target },
    ...overrides,
  } as Achievement;
}

// Factory for UserAchievement
// Factory for UserAchievement
// Accepts achievementId and achievementKey for full compatibility with service logic
export function createUserAchievement(
  achievementId: string,
  overrides: Partial<UserAchievement> = {}
): UserAchievement {
  return {
    id: overrides.id ?? faker.string.uuid(),
    user_id: overrides.user_id ?? faker.string.uuid(),
    achievement_id: achievementId,
    unlocked_at: overrides.unlocked_at ?? faker.date.recent().toISOString(),
    ...overrides,
  };
}


// Factory for Book
export function createBook(overrides: Partial<Book> = {}): Book {
  return {
    id: faker.string.uuid(),
    user_id: faker.string.uuid(),
    title: faker.lorem.words(2),
    author: faker.person.fullName(),
    reading_status: 'want_to_read',
    cover_url: faker.image.urlPicsumPhotos(),
    cover_color: overrides.cover_color ?? null,
    rating: overrides.rating ?? null,
    total_reading_time: overrides.total_reading_time ?? null,
    ...overrides,
  };
}

// Helper: Generate array of sessions for streaks, etc.
export function generateSessionsForStreak(startDate: string, days: number, gap: number = 0): ReadingSession[] {
  const sessions: ReadingSession[] = [];
  let date = new Date(startDate);
  for (let i = 0; i < days; i++) {
    sessions.push(createSession(date.toISOString().slice(0, 10)));
    date.setDate(date.getDate() + 1 + gap);
  }
  return sessions;
}
