import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId.");

export const createLabelSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required.").max(50),
    color: z.string().optional().default("#6366F1"),
    workspace: objectIdSchema,
    project: objectIdSchema.optional(),
  }),
});

export const getWorkspaceLabelsSchema = z.object({
  params: z.object({
    workspaceId: objectIdSchema,
  }),
});

export const deleteLabelSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    id: z.string().min(1),
  }),
});
