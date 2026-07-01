/**
 * Zod schema for the task create / edit form.
 * Mirrors the backend TaskCreate / TaskUpdate validation rules.
 */

import { z } from "zod";

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(500, "Title must be 500 characters or less"),

  description: z
    .string()
    .max(5000, "Description must be 5000 characters or less")
    .optional()
    .or(z.literal("")),

  priority: z.enum(["high", "medium", "low"]).default("medium"),

  dueAt: z
    .string()
    .optional()
    .or(z.literal("")),

  estimatedMinutes: z
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(1)
    .max(1440)
    .optional()
    .nullable(),

  tags: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
