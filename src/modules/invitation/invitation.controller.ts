import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import {
  createEmailInvitationSchema,
  createInviteLinkSchema,
} from "../../validators/invitation.validator";
import {
  createEmailInvitationService,
  createInviteLinkService,
  getInvitationByTokenService,
  acceptInvitationService,
  rejectInvitationService,
  joinViaInviteCodeService,
  getWorkspaceInvitationsService,
  getMyPendingInvitationsService,
  revokeInvitationService,
} from "./invitation.service";

export const createEmailInvitationController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const currentUserId = req.user!.id;
    const { email, roleId, expiresInDays } = createEmailInvitationSchema.parse(
      req.body,
    );

    const invitation = await createEmailInvitationService(
      workspaceId,
      currentUserId,
      email,
      roleId,
      expiresInDays,
    );

    logger.info(`Invitation sent to ${email} for workspace ${workspaceId}.`);
    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Invitation sent successfully.",
      invitation,
    );
  },
);

export const createInviteLinkController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const currentUserId = req.user!.id;
    const { roleId, expiresInDays } = createInviteLinkSchema.parse(req.body);

    const invitation = await createInviteLinkService(
      workspaceId,
      currentUserId,
      roleId,
      expiresInDays,
    );

    logger.info(`Invite link created for workspace ${workspaceId}.`);
    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Invite link created successfully.",
      invitation,
    );
  },
);

export const getInvitationByTokenController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const invitation = await getInvitationByTokenService(token);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Invitation fetched successfully.",
      invitation,
    );
  },
);

export const acceptInvitationController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const currentUserId = req.user!.id;
    const invitation = await acceptInvitationService(token, currentUserId);
    logger.info(
      `Invitation ${invitation._id} accepted by user ${currentUserId}.`,
    );
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Invitation accepted successfully.",
      invitation,
    );
  },
);

export const rejectInvitationController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const currentUserId = req.user!.id;
    const invitation = await rejectInvitationService(token, currentUserId);
    logger.info(
      `Invitation ${invitation._id} rejected by user ${currentUserId}.`,
    );
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Invitation rejected.",
      invitation,
    );
  },
);

export const joinViaInviteCodeController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const currentUserId = req.user!.id;
    const workspace = await joinViaInviteCodeService(token, currentUserId);
    logger.info(
      `User ${currentUserId} joined workspace via invite link ${token}.`,
    );
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Joined workspace successfully.",
      workspace,
    );
  },
);

export const getWorkspaceInvitationsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const currentUserId = req.user!.id;
    const invitations = await getWorkspaceInvitationsService(
      workspaceId,
      currentUserId,
    );
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Invitations fetched successfully.",
      invitations,
    );
  },
);

export const getMyPendingInvitationsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const currentUserId = req.user!.id;
    const invitations = await getMyPendingInvitationsService(currentUserId);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Pending invitations fetched successfully.",
      invitations,
    );
  },
);

export const revokeInvitationController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, invitationId } = req.params;
    const currentUserId = req.user!.id;
    await revokeInvitationService(workspaceId, invitationId, currentUserId);
    logger.info(
      `Invitation ${invitationId} revoked in workspace ${workspaceId}.`,
    );
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Invitation revoked successfully.",
      null,
    );
  },
);
