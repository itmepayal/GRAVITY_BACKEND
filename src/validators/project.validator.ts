import { z } from "zod";

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId.");

export const PROJECT_STATUSES = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
  "archived",
] as const;

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters long.")
      .max(100, "Project name must not exceed 100 characters."),

    description: z
      .string()
      .trim()
      .max(1000, "Description must not exceed 1000 characters.")
      .optional()
      .default(""),

    color: z
      .string()
      .trim()
      .regex(hexColorRegex, "Color must be a valid HEX color (e.g. #6366F1).")
      .optional()
      .default("#6366F1"),

    status: z.enum(PROJECT_STATUSES).optional().default("planning"),

    progress: z
      .number()
      .min(0, "Progress must be at least 0.")
      .max(100, "Progress cannot exceed 100.")
      .optional()
      .default(0),

    isArchived: z.boolean().optional().default(false),

    archivedAt: z
      .string()
      .datetime("Archived date must be a valid ISO date.")
      .optional(),

    startDate: z
      .string()
      .datetime("Start date must be a valid ISO date.")
      .optional(),

    dueDate: z
      .string()
      .datetime("Due date must be a valid ISO date.")
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.dueDate) return true;
      return new Date(data.startDate) <= new Date(data.dueDate);
    },
    {
      path: ["dueDate"],
      message: "Due date must be greater than or equal to start date.",
    },
  );

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters long.")
      .max(100, "Project name must not exceed 100 characters.")
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, "Description must not exceed 1000 characters.")
      .optional(),

    color: z
      .string()
      .trim()
      .regex(hexColorRegex, "Color must be a valid HEX color (e.g. #6366F1).")
      .optional(),

    status: z.enum(PROJECT_STATUSES).optional(),

    progress: z
      .number()
      .min(0, "Progress must be at least 0.")
      .max(100, "Progress cannot exceed 100.")
      .optional(),

    isArchived: z.boolean().optional(),

    archivedAt: z
      .string()
      .datetime("Archived date must be a valid ISO date.")
      .optional(),

    startDate: z
      .string()
      .datetime("Start date must be a valid ISO date.")
      .optional(),

    dueDate: z
      .string()
      .datetime("Due date must be a valid ISO date.")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update.",
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.dueDate) return true;
      return new Date(data.startDate) <= new Date(data.dueDate);
    },
    {
      path: ["dueDate"],
      message: "Due date must be greater than or equal to start date.",
    },
  );

export const addProjectMemberSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user id."),

  roleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid role id."),
});

export const updateProjectMemberRoleSchema = z.object({
  roleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid role id."),
});

export const projectIdParamSchema = z.object({
  params: z.object({
    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid project id."),
  }),
});

export const workspaceProjectParamSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid workspace id."),

    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid project id."),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
export type UpdateProjectMemberRoleInput = z.infer<
  typeof updateProjectMemberRoleSchema
>;

export type ProjectIdParamInput = z.infer<
  typeof projectIdParamSchema
>["params"];
export type WorkspaceProjectParamInput = z.infer<
  typeof workspaceProjectParamSchema
>["params"];

export const getProjectTasksSchema = z.object({
  params: z.object({
    projectId: objectIdSchema,
  }),

  query: z.object({
    status: z
      .enum([
        "todo",
        "in_progress",
        "in_review",
        "testing",
        "completed",
        "blocked",
      ])
      .optional(),

    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),

    assignee: objectIdSchema.optional(),

    isArchived: z.enum(["true", "false"]).optional(),
  }),
});

export type GetProjectTasksQuery = z.infer<
  typeof getProjectTasksSchema
>["query"];
