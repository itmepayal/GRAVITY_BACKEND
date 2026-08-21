import { z } from "zod";

export const VALID_PERMISSIONS = [
  // Workspace
  "workspace:view",
  "workspace:update",
  "workspace:delete",

  // Project
  "project:create",
  "project:view",
  "project:update",
  "project:delete",

  // Members
  "member:add",
  "member:update",
  "member:remove",

  // Boards
  "board:create",
  "board:view",
  "board:update",
  "board:delete",

  // Sprints
  "sprint:create",
  "sprint:view",
  "sprint:update",
  "sprint:delete",

  // Tasks
  "task:create",
  "task:view",
  "task:update",
  "task:delete",
  "task:archive",
  "task:assign",
  "task:manage_comments",
  "task:watch",
  "task:attachment",
  "task:hours",

  // Teams
  "team:create",
  "team:view",
  "team:update",
  "team:delete",
  "team:members:add",
  "team:members:remove",
  "team:lead:change",
] as const;

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters.")
    .max(50, "Role name cannot exceed 50 characters."),

  permissions: z
    .array(z.enum(VALID_PERMISSIONS))
    .min(1, "At least one permission is required."),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters.")
    .max(50, "Role name cannot exceed 50 characters.")
    .optional(),

  permissions: z
    .array(z.enum(VALID_PERMISSIONS))
    .min(1, "At least one permission is required.")
    .optional(),
});

export const getRolesParamSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid workspace id."),
  }),
});

export const roleIdParamSchema = z.object({
  params: z.object({
    roleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid role id."),
  }),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type GetRolesParamInput = z.infer<typeof getRolesParamSchema>["params"];
export type RoleIdParamSchema = z.infer<typeof roleIdParamSchema>["params"];
