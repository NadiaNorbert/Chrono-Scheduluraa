"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useCreateHabit, useUpdateHabit } from "@/hooks/useHabits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type { Habit } from "@/types/habits";

const ICONS = ["💪", "📚", "🏃", "💧", "🧘", "🍎", "😴", "✍️", "🎯", "🌿"];
const COLORS = [
  { value: "primary", label: "Teal",   cls: "bg-primary" },
  { value: "orange",  label: "Orange", cls: "bg-orange-500" },
  { value: "blue",    label: "Blue",   cls: "bg-blue-500" },
  { value: "purple",  label: "Purple", cls: "bg-purple-500" },
  { value: "red",     label: "Red",    cls: "bg-red-500" },
  { value: "teal",    label: "Teal2",  cls: "bg-teal-500" },
];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const schema = z.object({
  title:       z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  frequency:   z.enum(["daily", "weekly", "monthly"]).default("daily"),
  targetDays:  z.array(z.number()).default([]),
  color:       z.string().default("primary"),
  icon:        z.string().default("💪"),
});
type FormValues = z.infer<typeof schema>;

interface HabitFormModalProps {
  habit?: Habit;
  open: boolean;
  onClose: () => void;
}

export function HabitFormModal({ habit, open, onClose }: HabitFormModalProps) {
  const isEdit      = !!habit;
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const isPending   = createHabit.isPending || updateHabit.isPending;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: habit
        ? { title: habit.title, description: habit.description ?? "", frequency: habit.frequency,
            targetDays: habit.targetDays, color: habit.color ?? "primary", icon: habit.icon ?? "💪" }
        : { title: "", description: "", frequency: "daily", targetDays: [], color: "primary", icon: "💪" },
    });

  useEffect(() => {
    reset(habit
      ? { title: habit.title, description: habit.description ?? "", frequency: habit.frequency,
          targetDays: habit.targetDays, color: habit.color ?? "primary", icon: habit.icon ?? "💪" }
      : { title: "", description: "", frequency: "daily", targetDays: [], color: "primary", icon: "💪" }
    );
  }, [habit, reset]);

  const frequency  = watch("frequency");
  const targetDays = watch("targetDays");
  const icon       = watch("icon");
  const color      = watch("color");

  function toggleDay(d: number) {
    const curr = targetDays ?? [];
    setValue("targetDays", curr.includes(d) ? curr.filter((x) => x !== d) : [...curr, d]);
  }

  async function onSubmit(values: FormValues) {
    if (isEdit && habit) {
      await updateHabit.mutateAsync({ id: habit.id, payload: values });
    } else {
      await createHabit.mutateAsync(values);
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit habit" : "New habit"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Icon picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((i) => (
                <button
                  key={i} type="button" onClick={() => setValue("icon", i)}
                  className={`text-xl p-1 rounded-lg cursor-pointer transition-all ${icon === i ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
            <Input placeholder="e.g. Morning exercise" aria-invalid={!!errors.title} {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Frequency</label>
            <select
              className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              {...register("frequency")}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Target days (weekly only) */}
          {frequency === "weekly" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">On which days?</label>
              <div className="flex gap-1.5">
                {DAY_NAMES.map((d, i) => (
                  <button
                    key={i} type="button" onClick={() => toggleDay(i)}
                    className={`flex-1 rounded-lg py-1 text-xs font-medium cursor-pointer transition-all ${
                      targetDays?.includes(i)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value} type="button" onClick={() => setValue("color", c.value)}
                  className={`size-6 rounded-full cursor-pointer transition-all ${c.cls} ${
                    color === c.value ? "ring-2 ring-offset-2 ring-foreground/40" : ""
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes</label>
            <Input placeholder="Optional description" {...register("description")} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isEdit ? "Save" : "Create habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
