import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId.");

export const activityActions = [
  "created",
  "updated",
  "deleted",
  "status_changed",
  "assigned",
  "commented",
  "member_added",
  "member_removed",
] as const;

export const activityEntityTypes = [
  "project",
  "task",
  "board",
  "sprint",
  "goal",
  "team",
  "workspace",
] as const;

export const getWorkspaceActivityLogsSchema = z.object({
  params: z.object({
    workspaceId: objectIdSchema,
  }),
  query: z.object({
    entityType: z.enum(activityEntityTypes).optional(),
    entityId: objectIdSchema.optional(),
    action: z.enum(activityActions).optional(),
    actor: objectIdSchema.optional(),
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("20"),
  }),
});

export const getEntityActivityLogsSchema = z.object({
  params: z.object({
    entityType: z.enum(activityEntityTypes),
    entityId: objectIdSchema,
  }),
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("20"),
  }),
});

export const createActivityLogSchema = z.object({
  body: z.object({
    workspace: objectIdSchema,
    action: z.enum(activityActions),
    entityType: z.enum(activityEntityTypes),
    entityId: objectIdSchema,
    entityName: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});
