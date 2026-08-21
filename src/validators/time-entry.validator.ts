import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId.");

export const createTimeEntrySchema = z.object({
  body: z.object({
    workspace: objectIdSchema,
    project: objectIdSchema,
    task: objectIdSchema,
    description: z.string().optional(),
    durationMinutes: z.number().min(1, "Duration must be at least 1 minute."),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    date: z.string().optional(),
  }),
});

export const getWorkspaceTimeEntriesSchema = z.object({
  params: z.object({
    workspaceId: objectIdSchema,
  }),
  query: z.object({
    taskId: objectIdSchema.optional(),
    userId: objectIdSchema.optional(),
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("20"),
  }),
});
