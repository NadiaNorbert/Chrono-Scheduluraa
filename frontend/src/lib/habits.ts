/**
 * Habit API service — all HTTP calls for the Habits module.
 */

import { apiClient } from "@/lib/api";
import type { Habit, HabitCreate, HabitUpdate, HabitLog, HabitListResponse } from "@/types/habits";

const BASE = "/api/v1/habits";

function mapHabit(r: Record<string, unknown>): Habit {
  return {
    id:          r.id as string,
    userId:      r.user_id as string,
    title:       r.title as string,
    description: (r.description as string | null) ?? null,
    frequency:   r.frequency as Habit["frequency"],
    targetDays:  (r.target_days as number[]) ?? [],
    color:       (r.color as string | null) ?? null,
    icon:        (r.icon as string | null) ?? null,
    isActive:    Boolean(r.is_active),
    createdAt:   r.created_at as string,
    updatedAt:   r.updated_at as string,
    currentStreak:       (r.current_streak as number) ?? 0,
    longestStreak:       (r.longest_streak as number) ?? 0,
    completionsThisWeek: (r.completions_this_week as number) ?? 0,
    loggedToday:         Boolean(r.logged_today),
  };
}

function mapLog(r: Record<string, unknown>): HabitLog {
  return {
    id:         r.id as string,
    habitId:    r.habit_id as string,
    userId:     r.user_id as string,
    loggedDate: r.logged_date as string,
    note:       (r.note as string | null) ?? null,
    createdAt:  r.created_at as string,
  };
}

export async function fetchHabits(activeOnly = true): Promise<HabitListResponse> {
  const res = await apiClient.get(BASE, { params: { active_only: activeOnly } });
  return {
    items: (res.data.items as Record<string, unknown>[]).map(mapHabit),
    total: res.data.total as number,
  };
}

export async function createHabit(payload: HabitCreate): Promise<Habit> {
  const body = {
    title:       payload.title,
    description: payload.description ?? null,
    frequency:   payload.frequency ?? "daily",
    target_days: payload.targetDays ?? [],
    color:       payload.color ?? null,
    icon:        payload.icon ?? null,
  };
  const res = await apiClient.post(BASE, body);
  return mapHabit(res.data as Record<string, unknown>);
}

export async function updateHabit(id: string, payload: HabitUpdate): Promise<Habit> {
  const body: Record<string, unknown> = {};
  if (payload.title       !== undefined) body.title       = payload.title;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.frequency   !== undefined) body.frequency   = payload.frequency;
  if (payload.targetDays  !== undefined) body.target_days = payload.targetDays;
  if (payload.color       !== undefined) body.color       = payload.color;
  if (payload.icon        !== undefined) body.icon        = payload.icon;
  if (payload.isActive    !== undefined) body.is_active   = payload.isActive;
  const res = await apiClient.patch(`${BASE}/${id}`, body);
  return mapHabit(res.data as Record<string, unknown>);
}

export async function deleteHabit(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function logHabit(id: string, loggedDate: string, note?: string): Promise<HabitLog> {
  const res = await apiClient.post(`${BASE}/${id}/log`, { logged_date: loggedDate, note: note ?? null });
  return mapLog(res.data as Record<string, unknown>);
}

export async function unlogHabit(id: string, loggedDate: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}/log/${loggedDate}`);
}

export async function fetchHabitLogs(id: string, days = 90): Promise<HabitLog[]> {
  const res = await apiClient.get(`${BASE}/${id}/logs`, { params: { days } });
  return (res.data as Record<string, unknown>[]).map(mapLog);
}
