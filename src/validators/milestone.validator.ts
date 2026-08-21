import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId.");

export const milestoneStatuses = [
  "upcoming",
  "in_progress",
  "completed",
  "missed",
] as const;

export const createMilestoneSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().optional(),
    workspace: objectIdSchema,
    project: objectIdSchema,
    sprint: objectIdSchema.optional(),
    status: z.enum(milestoneStatuses).optional().default("upcoming"),
    startDate: z.string(),
    dueDate: z.string(),
    color: z.string().optional().default("#F59E0B"),
  }),
});

export const updateMilestoneSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(milestoneStatuses).optional(),
    progress: z.number().min(0).max(100).optional(),
    color: z.string().optional(),
  }),
});

export const getProjectMilestonesSchema = z.object({
  params: z.object({
    projectId: objectIdSchema,
  }),
});
