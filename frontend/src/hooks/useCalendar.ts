"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchEvents, createEvent, updateEvent, deleteEvent,
} from "@/lib/calendar";
import type { EventListParams, EventCreate, EventUpdate } from "@/types/calendar";

export const calendarKeys = {
  all:    ()                   => ["events"] as const,
  lists:  ()                   => ["events", "list"] as const,
  list:   (p: EventListParams) => ["events", "list", p] as const,
  detail: (id: string)         => ["events", "detail", id] as const,
};

/** Fetch events for a date range. Falls back gracefully when backend is offline. */
export function useEvents(params: EventListParams = {}) {
  return useQuery({
    queryKey: calendarKeys.list(params),
    queryFn:  () => fetchEvents(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventCreate) => createEvent(payload),
    onSuccess: (event) => {
      qc.invalidateQueries({ queryKey: calendarKeys.lists() });
      toast.success("Event created", { description: event.title });
    },
    onError: () => toast.error("Failed to create event."),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EventUpdate }) =>
      updateEvent(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.lists() });
      toast.success("Event updated");
    },
    onError: () => toast.error("Failed to update event."),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.lists() });
      toast.success("Event deleted");
    },
    onError: () => toast.error("Failed to delete event."),
  });
}
