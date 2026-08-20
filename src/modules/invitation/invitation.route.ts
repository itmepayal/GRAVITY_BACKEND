import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";

import {
  createEmailInvitationController,
  createInviteLinkController,
  getInvitationByTokenController,
  acceptInvitationController,
  rejectInvitationController,
  joinViaInviteCodeController,
  getWorkspaceInvitationsController,
  getMyPendingInvitationsController,
  revokeInvitationController,
} from "./invitation.controller";

const invitationRouter = Router();

/**
 * @swagger
 * /invitations/{token}:
 *   get:
 *     tags: [Invitations]
 *     summary: Get invitation details by token
 *     description: Get invitation information using an invitation token. This endpoint does not require authentication.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Invitation token
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationResponse'
 *       404:
 *         description: Invitation not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
invitationRouter.get("/:token", getInvitationByTokenController);

invitationRouter.use(authenticate);

/**
 * @swagger
 * /invitations/workspaces/{workspaceId}/email:
 *   post:
 *     tags: [Invitations]
 *     summary: Create an email invitation
 *     description: Send an invitation to a user's email address to join a workspace.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmailInvitationRequest'
 *     responses:
 *       201:
 *         description: Email invitation created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationResponse'
 *       400:
 *         description: Invalid invitation data or invitation already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You do not have permission to invite members to this workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Workspace or role not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
invitationRouter.post(
  "/workspaces/:workspaceId/email",
  createEmailInvitationController,
);

/**
 * @swagger
 * /invitations/workspaces/{workspaceId}/link:
 *   post:
 *     tags: [Invitations]
 *     summary: Create a workspace invite link
 *     description: Generate an invitation link that can be used to join a workspace.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInviteLinkRequest'
 *     responses:
 *       201:
 *         description: Invite link created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationResponse'
 *       400:
 *         description: Invalid invitation data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You do not have permission to create an invite link.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Workspace or role not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
invitationRouter.post(
  "/workspaces/:workspaceId/link",
  createInviteLinkController,
);

/**
 * @swagger
 * /invitations/workspaces/{workspaceId}:
 *   get:
 *     tags: [Invitations]
 *     summary: Get workspace invitations
 *     description: Get all invitations created for a workspace.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace invitations fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationsListResponse'
 *       403:
 *         description: You do not have access to this workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Workspace not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
invitationRouter.get(
  "/workspaces/:workspaceId",
  getWorkspaceInvitationsController,
);

/**
 * @swagger
 * /invitations/me/pending:
 *   get:
 *     tags: [Invitations]
 *     summary: Get my pending invitations
 *     description: Get all pending workspace invitations for the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending invitations fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationsListResponse'
 */
invitationRouter.get("/me/pending", getMyPendingInvitationsController);

/**
 * @swagger
 * /invitations/{token}/accept:
 *   post:
 *     tags: [Invitations]
 *     summary: Accept an invitation
 *     description: Accept a pending workspace invitation using its invitation token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Invitation token
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation accepted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationResponse'
 *       400:
 *         description: Invitation is invalid, expired, or no longer pending.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You are not allowed to accept this invitation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Invitation not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
invitationRouter.post("/:token/accept", acceptInvitationController);

/**
 * @swagger
 * /invitations/{token}/reject:
 *   post:
 *     tags: [Invitations]
 *     summary: Reject an invitation
 *     description: Reject a pending workspace invitation using its invitation token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Invitation token
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation rejected successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationResponse'
 *       400:
 *         description: Invitation is invalid, expired, or no longer pending.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You are not allowed to reject this invitation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Invitation not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
invitationRouter.post("/:token/reject", rejectInvitationController);

/**
 * @swagger
 * /invitations/{token}/join:
 *   post:
 *     tags: [Invitations]
 *     summary: Join workspace using invite code
 *     description: Join a workspace using a valid invitation token or invite code.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Invitation token or invite code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined the workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationResponse'
 *       400:
 *         description: Invitation is invalid, expired, or no longer available.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You are not allowed to join this workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Invitation not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
invitationRouter.post("/:token/join", joinViaInviteCodeController);

/**
 * @swagger
 * /invitations/workspaces/{workspaceId}/{invitationId}:
 *   delete:
 *     tags: [Invitations]
 *     summary: Revoke a workspace invitation
 *     description: Revoke a pending invitation so it can no longer be used.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: invitationId
 *         required: true
 *         description: Invitation ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation revoked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *       400:
 *         description: Invitation cannot be revoked.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You do not have permission to revoke this invitation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Workspace or invitation not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
invitationRouter.delete(
  "/workspaces/:workspaceId/:invitationId",
  revokeInvitationController,
);

export default invitationRouter;
