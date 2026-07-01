/**
 * Goal type contracts — mirrors backend Pydantic schemas.
 */

export type GoalStatus = "active" | "completed" | "paused" | "abandoned";

export interface Milestone {
  id:         string;
  goalId:     string;
  userId:     string;
  title:      string;
  isDone:     boolean;
  dueDate:    string | null;  // YYYY-MM-DD
  orderIndex: number;
  createdAt:  string;
}

export interface Goal {
  id:          string;
  userId:      string;
  title:       string;
  description: string | null;
  status:      GoalStatus;
  targetDate:  string | null;  // YYYY-MM-DD
  color:       string | null;
  icon:        string | null;
  progress:    number;         // 0–100
  createdAt:   string;
  updatedAt:   string;
  milestones:  Milestone[];
}

export interface GoalCreate {
  title:       string;
  description?: string | null;
  status?:     GoalStatus;
  targetDate?: string | null;
  color?:      string | null;
  icon?:       string | null;
  milestones?: { title: string; dueDate?: string | null; orderIndex?: number }[];
}

export interface GoalUpdate {
  title?:       string;
  description?: string | null;
  status?:      GoalStatus;
  targetDate?:  string | null;
  color?:       string | null;
  icon?:        string | null;
  progress?:    number;
}

export interface MilestoneCreate {
  title:      string;
  dueDate?:   string | null;
  orderIndex?: number;
}

export interface MilestoneUpdate {
  title?:      string;
  isDone?:     boolean;
  dueDate?:    string | null;
  orderIndex?: number;
}

export interface GoalListResponse {
  items: Goal[];
  total: number;
}
