import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId.");

export const eventTypes = [
  "meeting",
  "deadline",
  "reminder",
  "milestone",
  "other",
] as const;

export const createCalendarEventSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().optional(),
    workspace: objectIdSchema,
    project: objectIdSchema.optional(),
    task: objectIdSchema.optional(),
    type: z.enum(eventTypes).optional().default("other"),
    startTime: z.string(),
    endTime: z.string(),
    isAllDay: z.boolean().optional().default(false),
    attendees: z.array(objectIdSchema).optional().default([]),
    location: z.string().optional(),
    color: z.string().optional().default("#6366F1"),
    reminderMinutesBefore: z.number().optional().default(10),
  }),
});

export const getWorkspaceCalendarEventsSchema = z.object({
  params: z.object({
    workspaceId: objectIdSchema,
  }),
  query: z.object({
    projectId: objectIdSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
