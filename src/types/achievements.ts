// Types for achievements, goals, and progress in ReadRise

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon?: string;
  category: string;
  criteria: AchievementCriteria;
  points?: number;
  tier?: 'bronze' | 'silver' | 'gold' | string;
  is_active?: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress_data?: any;
  achievement?: Achievement;
}

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AchievementProgress {
  id: string;
  user_id: string;
  achievement_key: string;
  current_progress: number;
  target_progress: number;
  progress_data?: any;
  last_updated: string;
}

export interface GoalProgress {
  goal: UserGoal;
  progress: number;
  percent: number;
  completed: boolean;
}

// Flexible criteria type for different achievement types
// Discriminated union for all supported achievement criteria types
export type AchievementCriteria =
  | { type: 'session_count'; target: number }
  | { type: 'single_session_minutes'; target: number }
  | { type: 'total_reading_minutes'; target: number }
  | { type: 'books_completed'; target: number }
  | { type: 'consecutive_days'; target: number }
  | { type: 'pages_read'; target: number }
  | { type: 'goal_complete'; target: number }
  | { type: string; target: number; [key: string]: any }; // fallback for custom types

