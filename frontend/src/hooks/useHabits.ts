"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchHabits, createHabit, updateHabit, deleteHabit,
  logHabit, unlogHabit, fetchHabitLogs,
} from "@/lib/habits";
import type { HabitCreate, HabitUpdate } from "@/types/habits";

export const habitKeys = {
  all:   ()         => ["habits"] as const,
  lists: ()         => ["habits", "list"] as const,
  list:  (a: boolean) => ["habits", "list", a] as const,
  logs:  (id: string) => ["habits", "logs", id] as const,
};

export function useHabits(activeOnly = true) {
  return useQuery({
    queryKey: habitKeys.list(activeOnly),
    queryFn:  () => fetchHabits(activeOnly),
  });
}

export function useHabitLogs(habitId: string, days = 90) {
  return useQuery({
    queryKey: habitKeys.logs(habitId),
    queryFn:  () => fetchHabitLogs(habitId, days),
    enabled:  !!habitId,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: HabitCreate) => createHabit(p),
    onSuccess: (h) => {
      qc.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success("Habit created", { description: h.title });
    },
    onError: () => toast.error("Failed to create habit."),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: HabitUpdate }) =>
      updateHabit(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success("Habit updated");
    },
    onError: () => toast.error("Failed to update habit."),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success("Habit deleted");
    },
    onError: () => toast.error("Failed to delete habit."),
  });
}

export function useToggleHabitLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, loggedDate, isLogged }: {
      id: string; loggedDate: string; isLogged: boolean;
    }) => isLogged ? unlogHabit(id, loggedDate) : logHabit(id, loggedDate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitKeys.lists() });
    },
    onError: () => toast.error("Failed to update habit log."),
  });
}
