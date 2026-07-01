"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X } from "lucide-react";
import { useCreateGoal, useUpdateGoal } from "@/hooks/useGoals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Goal } from "@/types/goals";

const GOAL_ICONS = ["🎯", "🚀", "💡", "📖", "💪", "🌱", "🏆", "🎨", "🧠", "❤️"];
const GOAL_COLORS = [
  { v: "primary", cls: "bg-primary" },
  { v: "blue",    cls: "bg-blue-500" },
  { v: "purple",  cls: "bg-purple-500" },
  { v: "orange",  cls: "bg-orange-500" },
  { v: "red",     cls: "bg-red-500" },
  { v: "teal",    cls: "bg-teal-500" },
];

const schema = z.object({
  title:       z.string().min(1, "Title is required").max(300),
  description: z.string().max(5000).optional().or(z.literal("")),
  status:      z.enum(["active", "completed", "paused", "abandoned"]).default("active"),
  targetDate:  z.string().optional().or(z.literal("")),
  color:       z.string().default("primary"),
  icon:        z.string().default("🎯"),
});
type FormValues = z.infer<typeof schema>;

interface GoalFormModalProps {
  goal?: Goal;
  open: boolean;
  onClose: () => void;
}

export function GoalFormModal({ goal, open, onClose }: GoalFormModalProps) {
  const isEdit     = !!goal;
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const isPending  = createGoal.isPending || updateGoal.isPending;

  const [milestones, setMilestones] = useState<string[]>(
    goal?.milestones.map((m) => m.title) ?? []
  );
  const [msInput, setMsInput] = useState("");

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: goal
        ? { title: goal.title, description: goal.description ?? "", status: goal.status,
            targetDate: goal.targetDate ?? "", color: goal.color ?? "primary", icon: goal.icon ?? "🎯" }
        : { title: "", description: "", status: "active", targetDate: "", color: "primary", icon: "🎯" },
    });

  useEffect(() => {
    reset(goal
      ? { title: goal.title, description: goal.description ?? "", status: goal.status,
          targetDate: goal.targetDate ?? "", color: goal.color ?? "primary", icon: goal.icon ?? "🎯" }
      : { title: "", description: "", status: "active", targetDate: "", color: "primary", icon: "🎯" }
    );
    setMilestones(goal?.milestones.map((m) => m.title) ?? []);
  }, [goal, reset]);

  const icon  = watch("icon");
  const color = watch("color");

  async function onSubmit(values: FormValues) {
    if (isEdit && goal) {
      await updateGoal.mutateAsync({ id: goal.id, payload: {
        title: values.title, description: values.description || null,
        status: values.status, targetDate: values.targetDate || null,
        color: values.color, icon: values.icon,
      }});
    } else {
      await createGoal.mutateAsync({
        title: values.title, description: values.description || null,
        status: values.status, targetDate: values.targetDate || null,
        color: values.color, icon: values.icon,
        milestones: milestones.map((t, i) => ({ title: t, orderIndex: i })),
      });
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "New goal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Icon */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_ICONS.map((i) => (
                <button key={i} type="button" onClick={() => setValue("icon", i)}
                  className={`text-xl p-1 rounded-lg cursor-pointer ${icon === i ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
            <Input placeholder="What do you want to achieve?" aria-invalid={!!errors.title} {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea rows={2} placeholder="Why is this goal important?"
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              {...register("description")} />
          </div>

          {/* Status + Target date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                {...register("status")}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Target date</label>
              <Input type="date" className="h-8 text-sm" {...register("targetDate")} />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {GOAL_COLORS.map((c) => (
                <button key={c.v} type="button" onClick={() => setValue("color", c.v)}
                  className={`size-6 rounded-full cursor-pointer ${c.cls} ${color === c.v ? "ring-2 ring-offset-2 ring-foreground/40" : ""}`} />
              ))}
            </div>
          </div>

          {/* Milestones (create mode only) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Milestones</label>
              <ul className="space-y-1 mb-1">
                {milestones.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 text-foreground">{m}</span>
                    <button type="button" onClick={() => setMilestones((p) => p.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-destructive cursor-pointer">
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Input value={msInput} onChange={(e) => setMsInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (msInput.trim()) { setMilestones((p) => [...p, msInput.trim()]); setMsInput(""); }}}}
                  placeholder="Add a milestone…" className="h-7 text-xs flex-1" />
                <Button type="button" variant="outline" size="xs"
                  onClick={() => { if (msInput.trim()) { setMilestones((p) => [...p, msInput.trim()]); setMsInput(""); }}}>
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isEdit ? "Save" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
