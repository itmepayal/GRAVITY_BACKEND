import { z } from "zod";
import { Types } from "mongoose";

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid id.",
});

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  lead: objectId,
  color: z.string().trim().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  color: z.string().trim().optional(),
});

export const addTeamMemberSchema = z.object({
  userId: objectId,
});

export const changeTeamLeadSchema = z.object({
  leadId: objectId,
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
