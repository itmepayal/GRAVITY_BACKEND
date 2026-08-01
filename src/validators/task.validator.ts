import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId.");

const subTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Subtask title is required.")
    .max(200, "Subtask title cannot exceed 200 characters."),
  completed: z.boolean().optional().default(false),
});

const commentSchema = z.object({
  user: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user id."),
  message: z
    .string()
    .trim()
    .min(1, "Comment is required.")
    .max(1000, "Comment cannot exceed 1000 characters."),
});

export const archiveTaskSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
  }),
  body: z.object({
    isArchived: z.boolean().optional(),
  }),
});

export const boardIdParamSchema = z.object({
  params: z.object({
    boardId: objectIdSchema,
  }),
});

export const taskListQuerySchema = z.object({
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
    isArchived: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => val === "true"),
  }),
});

const attachmentSchema = z.object({
  fileName: z.string().min(1, "File name is required."),
  fileUrl: z.string().url("Invalid file URL."),
  fileType: z.string().min(1, "File type is required."),
  fileSize: z.number().positive("File size must be greater than 0."),
  uploadedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user id."),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
  }),
});

export const moveTaskSchema = z.object({
  params: taskIdParamSchema.shape.params,
  body: z.object({
    column: z.string().min(1, "Column is required"),
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
  }),
});
export type MoveTaskSchemaType = z.infer<typeof moveTaskSchema>;

export const assigneeTaskSchema = z.object({
  params: taskIdParamSchema.shape.params,
  body: z.object({
    assignee: z.string().nullable().optional(),
  }),
});
export type AssigneeTaskSchemaType = z.infer<typeof assigneeTaskSchema>;

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(200, "Task title cannot exceed 200 characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters.")
    .optional()
    .default(""),
  board: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid board id."),
  project: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid project id."),
  workspace: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid workspace id."),
  sprint: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid sprint id.")
    .optional(),
  column: z.string().trim().min(1, "Column is required.").max(100),
  assignee: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid assignee id.")
    .optional(),
  watchers: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/))
    .optional()
    .default([]),
  status: z
    .enum([
      "todo",
      "in_progress",
      "in_review",
      "testing",
      "completed",
      "blocked",
    ])
    .optional()
    .default("todo"),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional()
    .default("medium"),
  tags: z.array(z.string().trim()).optional().default([]),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z
    .number()
    .min(0, "Estimated hours cannot be negative.")
    .optional()
    .default(0),
  actualHours: z
    .number()
    .min(0, "Actual hours cannot be negative.")
    .optional()
    .default(0),
  subtasks: z.array(subTaskSchema).optional().default([]),
  comments: z.array(commentSchema).optional().default([]),
  attachments: z.array(attachmentSchema).optional().default([]),
});

export type CreateTaskSchemaType = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
  }),
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    column: z.string().trim().min(1).max(100).optional(),
    assignee: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .nullable()
      .optional(),
    watchers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
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
    tags: z.array(z.string()).optional(),
    dueDate: z.coerce.date().nullable().optional(),
    estimatedHours: z.number().min(0).optional(),
    actualHours: z.number().min(0).optional(),
    subtasks: z.array(subTaskSchema).optional(),
    isArchived: z.boolean().optional(),
  }),
});

export type UpdateTaskSchemaType = z.infer<typeof updateTaskSchema>;

export const addSubTaskSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
  }),
  body: z.object({
    title: z.string().trim().min(1).max(200),
  }),
});

export const updateSubTaskSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
    subtaskId: objectIdSchema,
  }),
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    completed: z.boolean().optional(),
  }),
});

export const deleteSubTaskSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
    subtaskId: objectIdSchema,
  }),
});

export const addCommentSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
  }),
  body: z.object({
    message: z.string().trim().min(1).max(1000),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
    commentId: objectIdSchema,
  }),
  body: z.object({
    message: z.string().trim().min(1).max(1000),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
    commentId: objectIdSchema,
  }),
});

export const addWatcherSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
  }),
  body: z.object({
    userId: objectIdSchema,
  }),
});

export const removeWatcherSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
    userId: objectIdSchema,
  }),
});

export const addAttachmentSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
  }),
});

export const removeAttachmentSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
    attachmentId: objectIdSchema,
  }),
});
