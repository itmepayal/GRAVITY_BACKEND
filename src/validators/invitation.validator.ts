import { z } from "zod";

export const createEmailInvitationSchema = z.object({
  email: z.string().trim().email("Invalid email address."),
  roleId: z.string().min(1, "roleId is required."),
  expiresInDays: z.number().int().positive().max(30).optional(),
});

export const createInviteLinkSchema = z.object({
  roleId: z.string().min(1, "roleId is required."),
  expiresInDays: z.number().int().positive().max(90).optional(),
});

export const tokenParamSchema = z.object({
  params: z.object({
    token: z.string().min(1),
  }),
});

export const invitationIdParamSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    invitationId: z.string().min(1),
  }),
});

export type CreateEmailInvitationInput = z.infer<
  typeof createEmailInvitationSchema
>;
export type CreateInviteLinkInput = z.infer<typeof createInviteLinkSchema>;
