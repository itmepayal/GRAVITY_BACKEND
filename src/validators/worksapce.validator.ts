import { z } from "zod";

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters long.")
    .max(100, "Workspace name must not exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters.")
    .optional()
    .default(""),

  color: z
    .string()
    .trim()
    .regex(hexColorRegex, "Color must be a valid HEX color (e.g. #6366F1).")
    .optional()
    .default("#6366F1"),

  icon: z
    .string()
    .trim()
    .max(50, "Icon must not exceed 50 characters.")
    .optional()
    .default(""),

  isPrivate: z.boolean().optional().default(false),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const addWorkspaceMemberSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  roleId: z.string().min(1, "Role is required."),
});

export const updateWorkspaceMemberRoleSchema = z.object({
  roleId: z.string().min(1, "Role is required."),
});

export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>;
export type UpdateWorkspaceMemberRoleInput = z.infer<
  typeof updateWorkspaceMemberRoleSchema
>;

export const updateWorkspaceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Workspace name must be at least 2 characters long.")
      .max(100, "Workspace name must not exceed 100 characters.")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description must not exceed 500 characters.")
      .optional(),

    color: z
      .string()
      .trim()
      .regex(hexColorRegex, "Color must be a valid HEX color (e.g. #6366F1).")
      .optional(),

    icon: z
      .string()
      .trim()
      .max(50, "Icon must not exceed 50 characters.")
      .optional(),

    isPrivate: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update.",
  });

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
