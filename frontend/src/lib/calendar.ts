/**
 * Calendar API service — all HTTP calls for the Calendar module.
 * Maps snake_case backend responses to camelCase frontend types.
 */

import { apiClient } from "@/lib/api";
import type {
  CalendarEvent, EventCreate, EventUpdate,
  EventListResponse, EventListParams,
} from "@/types/calendar";

const BASE = "/api/v1/events";

function mapEvent(raw: Record<string, unknown>): CalendarEvent {
  const rec = raw.recurrence as Record<string, unknown> | null;
  return {
    id:          raw.id as string,
    userId:      raw.user_id as string,
    title:       raw.title as string,
    description: (raw.description as string | null) ?? null,
    start:       raw.start_at as string,
    end:         raw.end_at as string,
    allDay:      Boolean(raw.all_day),
    colorTag:    (raw.color_tag as string | null) ?? null,
    location:    (raw.location as string | null) ?? null,
    recurrence:  rec
      ? { frequency: rec.frequency as "daily", interval: rec.interval as number,
          until: rec.until as string | null, count: rec.count as number | null }
      : null,
    createdAt:   raw.created_at as string,
    updatedAt:   raw.updated_at as string,
  };
}

export async function fetchEvents(params: EventListParams = {}): Promise<EventListResponse> {
  const q: Record<string, string | number> = {};
  if (params.start)    q.start     = params.start;
  if (params.end)      q.end       = params.end;
  if (params.page)     q.page      = params.page;
  if (params.pageSize) q.page_size = params.pageSize;

  const res = await apiClient.get(BASE, { params: q });
  const d = res.data;
  return {
    items:    (d.items as Record<string, unknown>[]).map(mapEvent),
    total:    d.total as number,
    page:     d.page as number,
    pageSize: d.page_size as number,
    hasMore:  d.has_more as boolean,
  };
}

export async function fetchEvent(id: string): Promise<CalendarEvent> {
  const res = await apiClient.get(`${BASE}/${id}`);
  return mapEvent(res.data as Record<string, unknown>);
}

export async function createEvent(payload: EventCreate): Promise<CalendarEvent> {
  const body = {
    title:       payload.title,
    description: payload.description ?? null,
    start_at:    payload.start,
    end_at:      payload.end,
    all_day:     payload.allDay ?? false,
    color_tag:   payload.colorTag ?? null,
    location:    payload.location ?? null,
    recurrence:  payload.recurrence ?? null,
  };
  const res = await apiClient.post(BASE, body);
  return mapEvent(res.data as Record<string, unknown>);
}

export async function updateEvent(id: string, payload: EventUpdate): Promise<CalendarEvent> {
  const body: Record<string, unknown> = {};
  if (payload.title       !== undefined) body.title       = payload.title;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.start       !== undefined) body.start_at    = payload.start;
  if (payload.end         !== undefined) body.end_at      = payload.end;
  if (payload.allDay      !== undefined) body.all_day     = payload.allDay;
  if (payload.colorTag    !== undefined) body.color_tag   = payload.colorTag;
  if (payload.location    !== undefined) body.location    = payload.location;
  if (payload.recurrence  !== undefined) body.recurrence  = payload.recurrence;
  const res = await apiClient.patch(`${BASE}/${id}`, body);
  return mapEvent(res.data as Record<string, unknown>);
}

export async function deleteEvent(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
