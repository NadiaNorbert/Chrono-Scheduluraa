"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchGoals, fetchGoal, createGoal, updateGoal, deleteGoal,
  addMilestone, updateMilestone, deleteMilestone,
} from "@/lib/goals";
import type { GoalCreate, GoalUpdate, MilestoneCreate, MilestoneUpdate, GoalStatus } from "@/types/goals";

export const goalKeys = {
  all:    ()               => ["goals"] as const,
  lists:  ()               => ["goals", "list"] as const,
  list:   (s?: GoalStatus) => ["goals", "list", s] as const,
  detail: (id: string)     => ["goals", "detail", id] as const,
};

export function useGoals(status?: GoalStatus) {
  return useQuery({
    queryKey: goalKeys.list(status),
    queryFn:  () => fetchGoals(status),
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn:  () => fetchGoal(id),
    enabled:  !!id,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: GoalCreate) => createGoal(p),
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: goalKeys.lists() });
      toast.success("Goal created", { description: g.title });
    },
    onError: () => toast.error("Failed to create goal."),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GoalUpdate }) =>
      updateGoal(id, payload),
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: goalKeys.lists() });
      qc.setQueryData(goalKeys.detail(g.id), g);
    },
    onError: () => toast.error("Failed to update goal."),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: goalKeys.lists() });
      toast.success("Goal deleted");
    },
    onError: () => toast.error("Failed to delete goal."),
  });
}

export function useToggleMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, msId, isDone }: { goalId: string; msId: string; isDone: boolean }) =>
      updateMilestone(goalId, msId, { isDone }),
    onSuccess: (goal) => {
      qc.invalidateQueries({ queryKey: goalKeys.lists() });
      qc.setQueryData(goalKeys.detail(goal.id), goal);
    },
    onError: () => toast.error("Failed to update milestone."),
  });
}

export function useAddMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, payload }: { goalId: string; payload: MilestoneCreate }) =>
      addMilestone(goalId, payload),
    onSuccess: (goal) => {
      qc.invalidateQueries({ queryKey: goalKeys.lists() });
      qc.setQueryData(goalKeys.detail(goal.id), goal);
    },
    onError: () => toast.error("Failed to add milestone."),
  });
}

export function useDeleteMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, msId }: { goalId: string; msId: string }) =>
      deleteMilestone(goalId, msId),
    onSuccess: (goal) => {
      qc.invalidateQueries({ queryKey: goalKeys.lists() });
      qc.setQueryData(goalKeys.detail(goal.id), goal);
    },
    onError: () => toast.error("Failed to delete milestone."),
  });
}
