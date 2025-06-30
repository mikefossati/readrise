import type { Book, ReadingSession } from '../lib/supabase';

// Return total number of books
export function getTotalBooks(books: Book[]): number {
  return books.length;
}

// Return number of books added this month (created_at >= first day of month)
export function getBooksThisMonth(books: Book[], now: Date): number {
  // Compare by year and month string (UTC-agnostic)
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return books.filter(b => {
    const created = (b as any).created_at;
    if (!created) return false;
    const createdYM = String(created).slice(0, 7); // 'YYYY-MM'
    return createdYM === ym;
  }).length;
}

// Return total reading minutes for today (local time)
export function getTodayMinutes(sessions: ReadingSession[], now: Date): number {
  const todayStr = getLocalDateString(now);
  return sessions.filter(s => {
    const dt = new Date(s.start_time);
    return getLocalDateString(dt) === todayStr;
  }).reduce((sum, s) => sum + Math.round((s.actual_duration || durationFromTimes(s)) / 60), 0);
}

// Helper: get duration in seconds from start_time/end_time
function durationFromTimes(s: ReadingSession): number {
  if (s.start_time && s.end_time) {
    return Math.round((new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 1000);
  }
  return 0;
}

// Return current streak (consecutive days with sessions, local time)
export function getCurrentStreak(sessions: ReadingSession[], now: Date): number {
  function getLocalDateString(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const sessionLocalDates = Array.from(new Set(
    sessions.map(s => {
      const dt = new Date(s.start_time);
      return getLocalDateString(dt);
    })
  )).sort().reverse();
  let streak = 0;
  let d = new Date(now);
  const todayStr = getLocalDateString(d);
  for (let i = 0; i < sessionLocalDates.length; i++) {
    if (i === 0 && sessionLocalDates[i] !== todayStr) break;
    if (sessionLocalDates[i] === getLocalDateString(d)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Return weekly reading goal progress (total minutes this week, percent)
// Week starts on Monday (ISO standard)
export function getWeeklyGoalProgress(sessions: ReadingSession[], now: Date, weeklyGoal: number): { minutes: number, percent: number } {
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  // getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
  const diff = (day === 0 ? -6 : 1 - day); // If Sunday, go back 6 days; else, back to Monday
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0,0,0,0);
  const weekStartStr = getLocalDateString(weekStart);
  let minutes = sessions.filter(s => {
    const dt = new Date(s.start_time);
    return getLocalDateString(dt) >= weekStartStr;
  }).reduce((sum, s) => sum + Math.round((s.actual_duration || durationFromTimes(s)) / 60), 0);
  let percent = weeklyGoal > 0 ? Math.round((minutes / weeklyGoal) * 100) : 0;
  return { minutes, percent };
}

// Helper: get local date string
function getLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
