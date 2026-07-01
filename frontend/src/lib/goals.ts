/**
 * Goals API service — all HTTP calls for the Goals module.
 */
import { apiClient } from "@/lib/api";
import type {
  Goal, GoalCreate, GoalUpdate, GoalListResponse,
  MilestoneCreate, MilestoneUpdate, GoalStatus,
} from "@/types/goals";

const BASE = "/api/v1/goals";

function mapMilestone(r: Record<string, unknown>) {
  return {
    id:         r.id as string,
    goalId:     r.goal_id as string,
    userId:     r.user_id as string,
    title:      r.title as string,
    isDone:     Boolean(r.is_done),
    dueDate:    (r.due_date as string | null) ?? null,
    orderIndex: (r.order_index as number) ?? 0,
    createdAt:  r.created_at as string,
  };
}

function mapGoal(r: Record<string, unknown>): Goal {
  return {
    id:          r.id as string,
    userId:      r.user_id as string,
    title:       r.title as string,
    description: (r.description as string | null) ?? null,
    status:      r.status as GoalStatus,
    targetDate:  (r.target_date as string | null) ?? null,
    color:       (r.color as string | null) ?? null,
    icon:        (r.icon as string | null) ?? null,
    progress:    (r.progress as number) ?? 0,
    createdAt:   r.created_at as string,
    updatedAt:   r.updated_at as string,
    milestones:  ((r.milestones ?? []) as Record<string, unknown>[]).map(mapMilestone),
  };
}

export async function fetchGoals(status?: GoalStatus): Promise<GoalListResponse> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const res = await apiClient.get(BASE, { params });
  return {
    items: (res.data.items as Record<string, unknown>[]).map(mapGoal),
    total: res.data.total as number,
  };
}

export async function fetchGoal(id: string): Promise<Goal> {
  const res = await apiClient.get(`${BASE}/${id}`);
  return mapGoal(res.data as Record<string, unknown>);
}

export async function createGoal(payload: GoalCreate): Promise<Goal> {
  const body = {
    title:       payload.title,
    description: payload.description ?? null,
    status:      payload.status ?? "active",
    target_date: payload.targetDate ?? null,
    color:       payload.color ?? null,
    icon:        payload.icon ?? null,
    milestones:  (payload.milestones ?? []).map((m, i) => ({
      title: m.title, due_date: m.dueDate ?? null, order_index: i,
    })),
  };
  const res = await apiClient.post(BASE, body);
  return mapGoal(res.data as Record<string, unknown>);
}

export async function updateGoal(id: string, payload: GoalUpdate): Promise<Goal> {
  const body: Record<string, unknown> = {};
  if (payload.title       !== undefined) body.title       = payload.title;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.status      !== undefined) body.status      = payload.status;
  if (payload.targetDate  !== undefined) body.target_date = payload.targetDate;
  if (payload.color       !== undefined) body.color       = payload.color;
  if (payload.icon        !== undefined) body.icon        = payload.icon;
  if (payload.progress    !== undefined) body.progress    = payload.progress;
  const res = await apiClient.patch(`${BASE}/${id}`, body);
  return mapGoal(res.data as Record<string, unknown>);
}

export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function addMilestone(goalId: string, payload: MilestoneCreate): Promise<Goal> {
  const body = {
    title: payload.title, due_date: payload.dueDate ?? null,
    order_index: payload.orderIndex ?? 0,
  };
  const res = await apiClient.post(`${BASE}/${goalId}/milestones`, body);
  return mapGoal(res.data as Record<string, unknown>);
}

export async function updateMilestone(
  goalId: string, msId: string, payload: MilestoneUpdate
): Promise<Goal> {
  const body: Record<string, unknown> = {};
  if (payload.title      !== undefined) body.title       = payload.title;
  if (payload.isDone     !== undefined) body.is_done     = payload.isDone;
  if (payload.dueDate    !== undefined) body.due_date    = payload.dueDate;
  if (payload.orderIndex !== undefined) body.order_index = payload.orderIndex;
  const res = await apiClient.patch(`${BASE}/${goalId}/milestones/${msId}`, body);
  return mapGoal(res.data as Record<string, unknown>);
}

export async function deleteMilestone(goalId: string, msId: string): Promise<Goal> {
  const res = await apiClient.delete(`${BASE}/${goalId}/milestones/${msId}`);
  return mapGoal(res.data as Record<string, unknown>);
}
