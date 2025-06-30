// Types for analytics engine foundation

export type InsightTypes =
  | 'streak'
  | 'consistency'
  | 'reading_time'
  | 'peak_hours'
  | 'genre_preference'
  | 'session_length'
  | 'custom';

export type AnalyticsTimeframe = 'daily' | 'weekly' | 'monthly';

export interface ReadingAnalytics {
  userId: string;
  date: string; // ISO date
  totalMinutes: number;
  sessionCount: number;
  booksRead: number;
  genresRead: Record<string, number>; // genre -> count
  averageSessionLength: number;
  peakReadingHour: number | null;
  streakDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface Insight {
  type: InsightTypes;
  message: string;
  data?: any;
  generatedAt: string;
}
