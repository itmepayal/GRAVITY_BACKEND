import { z } from "zod";
import { Types } from "mongoose";

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid id.",
});

export const createGoalSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  project: objectId.optional(),
  targetDate: z.string().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(1000).optional(),
  status: z
    .enum(["not_started", "in_progress", "completed", "at_risk", "cancelled"])
    .optional(),
  progress: z.number().min(0).max(100).optional(),
  targetDate: z.string().optional(),
});

export const getWorkspaceGoalsQuerySchema = z.object({
  project: objectId.optional(),
  status: z
    .enum(["not_started", "in_progress", "completed", "at_risk", "cancelled"])
    .optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GetWorkspaceGoalsQuery = z.infer<
  typeof getWorkspaceGoalsQuerySchema
>;
