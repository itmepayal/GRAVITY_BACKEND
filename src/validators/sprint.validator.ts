import { z } from "zod";

export const createSprintSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Sprint name is required.")
      .max(100, "Sprint name cannot exceed 100 characters."),

    goal: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid goal id.")
      .optional()
      .nullable(),

    board: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid board id.")
      .optional(),

    startDate: z.coerce.date({
      message: "Invalid start date.",
    }),

    endDate: z.coerce.date({
      message: "Invalid end date.",
    }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after startDate.",
    path: ["endDate"],
  });

export type CreateSprintInput = z.infer<typeof createSprintSchema>;

export const sprintIdParamSchema = z.object({
  params: z.object({
    sprintId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid sprint id."),
  }),
});

export const updateSprintSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Sprint name is required.")
      .max(100, "Sprint name cannot exceed 100 characters.")
      .optional(),

    goal: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid goal id.")
      .optional()
      .nullable(),

    board: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid board id.")
      .optional()
      .nullable(),

    startDate: z.coerce
      .date({
        message: "Invalid start date.",
      })
      .optional(),

    endDate: z.coerce
      .date({
        message: "Invalid end date.",
      })
      .optional(),
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.endDate > data.startDate,
    {
      message: "End date must be after start date.",
      path: ["endDate"],
    },
  );

export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;
