/**
 * Task API service — all HTTP calls for the Tasks module.
 *
 * Every function talks to /api/v1/tasks.
 * Components never call apiClient directly; they use these functions via hooks.
 */

import { apiClient } from "@/lib/api";
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  TaskListParams,
} from "@/types/scheduler";

const BASE = "/api/v1/tasks";

/** Convert frontend camelCase params to snake_case query string for the API. */
function buildParams(params: TaskListParams): Record<string, string | number> {
  const q: Record<string, string | number> = {};
  if (params.filterBy)  q.filter_by  = params.filterBy;
  if (params.priority)  q.priority   = params.priority;
  if (params.search)    q.search     = params.search;
  if (params.page)      q.page       = params.page;
  if (params.pageSize)  q.page_size  = params.pageSize;
  return q;
}

/** Convert snake_case API response to camelCase frontend type. */
function mapTask(raw: Record<string, unknown>): Task {
  return {
    id:               raw.id as string,
    userId:           raw.user_id as string,
    title:            raw.title as string,
    description:      (raw.description as string | null) ?? null,
    priority:         raw.priority as Task["priority"],
    dueAt:            (raw.due_at as string | null) ?? null,
    estimatedMinutes: (raw.estimated_minutes as number | null) ?? null,
    completedAt:      (raw.completed_at as string | null) ?? null,
    tags:             (raw.tags as string[]) ?? [],
    createdAt:        raw.created_at as string,
    updatedAt:        raw.updated_at as string,
  };
}

export async function fetchTasks(params: TaskListParams = {}): Promise<TaskListResponse> {
  const res = await apiClient.get(BASE, { params: buildParams(params) });
  const d = res.data;
  return {
    items:    (d.items as Record<string, unknown>[]).map(mapTask),
    total:    d.total as number,
    page:     d.page as number,
    pageSize: d.page_size as number,
    hasMore:  d.has_more as boolean,
  };
}

export async function fetchTask(id: string): Promise<Task> {
  const res = await apiClient.get(`${BASE}/${id}`);
  return mapTask(res.data as Record<string, unknown>);
}

export async function createTask(payload: TaskCreate): Promise<Task> {
  const body = {
    title:              payload.title,
    description:        payload.description ?? null,
    priority:           payload.priority ?? "medium",
    due_at:             payload.dueAt ?? null,
    estimated_minutes:  payload.estimatedMinutes ?? null,
    tags:               payload.tags ?? [],
  };
  const res = await apiClient.post(BASE, body);
  return mapTask(res.data as Record<string, unknown>);
}

export async function updateTask(id: string, payload: TaskUpdate): Promise<Task> {
  const body: Record<string, unknown> = {};
  if (payload.title              !== undefined) body.title              = payload.title;
  if (payload.description        !== undefined) body.description        = payload.description;
  if (payload.priority           !== undefined) body.priority           = payload.priority;
  if (payload.dueAt              !== undefined) body.due_at             = payload.dueAt;
  if (payload.estimatedMinutes   !== undefined) body.estimated_minutes  = payload.estimatedMinutes;
  if (payload.completedAt        !== undefined) body.completed_at       = payload.completedAt;
  if (payload.tags               !== undefined) body.tags               = payload.tags;
  const res = await apiClient.patch(`${BASE}/${id}`, body);
  return mapTask(res.data as Record<string, unknown>);
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function toggleTaskComplete(id: string): Promise<Task> {
  const res = await apiClient.post(`${BASE}/${id}/toggle`);
  return mapTask(res.data as Record<string, unknown>);
}
