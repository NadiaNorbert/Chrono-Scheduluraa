/**
 * Habit type contracts — mirrors backend Pydantic schemas.
 */

export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Habit {
  id:          string;
  userId:      string;
  title:       string;
  description: string | null;
  frequency:   HabitFrequency;
  /** 0=Mon … 6=Sun — for weekly habits */
  targetDays:  number[];
  color:       string | null;
  icon:        string | null;
  isActive:    boolean;
  createdAt:   string;
  updatedAt:   string;
  // Computed by backend
  currentStreak:       number;
  longestStreak:       number;
  completionsThisWeek: number;
  loggedToday:         boolean;
}

export interface HabitCreate {
  title:       string;
  description?: string | null;
  frequency?:  HabitFrequency;
  targetDays?: number[];
  color?:      string | null;
  icon?:       string | null;
}

export interface HabitUpdate {
  title?:       string;
  description?: string | null;
  frequency?:   HabitFrequency;
  targetDays?:  number[];
  color?:       string | null;
  icon?:        string | null;
  isActive?:    boolean;
}

export interface HabitLog {
  id:         string;
  habitId:    string;
  userId:     string;
  loggedDate: string;  // YYYY-MM-DD
  note:       string | null;
  createdAt:  string;
}

export interface HabitListResponse {
  items: Habit[];
  total: number;
}
