"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MapPin, Clock } from "lucide-react";
import { useCreateEvent, useUpdateEvent } from "@/hooks/useCalendar";
import { useCalendarStore } from "@/store/calendarStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type { CalendarEvent } from "@/types/calendar";

const schema = z.object({
  title:       z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional().or(z.literal("")),
  start:       z.string().min(1, "Start time is required"),
  end:         z.string().min(1, "End time is required"),
  allDay:      z.boolean().default(false),
  colorTag:    z.string().optional(),
  location:    z.string().max(300).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const COLOR_OPTIONS = [
  { value: "primary", label: "Teal",   dot: "bg-primary" },
  { value: "blue",    label: "Blue",   dot: "bg-blue-500" },
  { value: "purple",  label: "Purple", dot: "bg-purple-500" },
  { value: "pink",    label: "Pink",   dot: "bg-pink-500" },
  { value: "orange",  label: "Orange", dot: "bg-orange-500" },
  { value: "red",     label: "Red",    dot: "bg-red-500" },
];

interface EventFormModalProps {
  event?: CalendarEvent;
  open: boolean;
  onClose: () => void;
}

export function EventFormModal({ event, open, onClose }: EventFormModalProps) {
  const isEdit      = !!event;
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const slotStart   = useCalendarStore((s) => s.slotStart);
  const slotEnd     = useCalendarStore((s) => s.slotEnd);
  const isPending   = createEvent.isPending || updateEvent.isPending;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaults(event, slotStart, slotEnd),
  });

  useEffect(() => {
    reset(getDefaults(event, slotStart, slotEnd));
  }, [event, slotStart, slotEnd, reset]);

  const allDay = watch("allDay");

  async function onSubmit(values: FormValues) {
    const payload = {
      title:       values.title,
      description: values.description || null,
      start:       new Date(values.start).toISOString(),
      end:         new Date(values.end).toISOString(),
      allDay:      values.allDay,
      colorTag:    values.colorTag || null,
      location:    values.location || null,
    };
    if (isEdit && event) {
      await updateEvent.mutateAsync({ id: event.id, payload });
    } else {
      await createEvent.mutateAsync(payload);
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit event" : "New event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
            <Input placeholder="Event title" aria-invalid={!!errors.title} {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* All day toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" className="rounded" {...register("allDay")} />
            All day
          </label>

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1">
                <Clock className="size-3.5 text-muted-foreground" /> Start
              </label>
              <Input
                type={allDay ? "date" : "datetime-local"}
                className="text-sm"
                aria-invalid={!!errors.start}
                {...register("start")}
              />
              {errors.start && <p className="text-xs text-destructive">{errors.start.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">End</label>
              <Input
                type={allDay ? "date" : "datetime-local"}
                className="text-sm"
                aria-invalid={!!errors.end}
                {...register("end")}
              />
              {errors.end && <p className="text-xs text-destructive">{errors.end.message}</p>}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="size-3.5 text-muted-foreground" /> Location
            </label>
            <Input placeholder="Optional location" {...register("location")} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              rows={2}
              placeholder="Optional notes…"
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              {...register("description")}
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <label key={c.value} className="flex items-center gap-1 cursor-pointer text-xs text-muted-foreground">
                  <input type="radio" value={c.value} {...register("colorTag")} className="sr-only" />
                  <span className={`size-5 rounded-full border-2 border-transparent hover:border-foreground/30 ${c.dot} cursor-pointer`} title={c.label} />
                </label>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isEdit ? "Save changes" : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function getDefaults(event?: CalendarEvent, slotStart?: string | null, slotEnd?: string | null): FormValues {
  if (event) {
    return {
      title:       event.title,
      description: event.description ?? "",
      start:       toDatetimeLocal(event.start),
      end:         toDatetimeLocal(event.end),
      allDay:      event.allDay,
      colorTag:    event.colorTag ?? "primary",
      location:    event.location ?? "",
    };
  }
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60_000);
  return {
    title:       "",
    description: "",
    start:       slotStart ? toDatetimeLocal(slotStart) : toDatetimeLocal(now.toISOString()),
    end:         slotEnd   ? toDatetimeLocal(slotEnd)   : toDatetimeLocal(later.toISOString()),
    allDay:      false,
    colorTag:    "primary",
    location:    "",
  };
}
