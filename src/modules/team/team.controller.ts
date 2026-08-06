import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema,
  changeTeamLeadSchema,
} from "../../validators/team.validation";
import {
  createTeamService,
  getWorkspaceTeamsService,
  getTeamByIdService,
  updateTeamService,
  deleteTeamService,
  addTeamMemberService,
  removeTeamMemberService,
  changeTeamLeadService,
} from "./team.service";

export const createTeamController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const data = createTeamSchema.parse(req.body);
    const team = await createTeamService(workspaceId, req.user!.id, data);
    logger.info(`Team "${team.name}" created in workspace ${workspaceId}.`);
    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Team created successfully.",
      team,
    );
  },
);

export const getWorkspaceTeamsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const teams = await getWorkspaceTeamsService(workspaceId);
    logger.info(`Fetched ${teams.length} teams from workspace ${workspaceId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Teams fetched successfully.",
      teams,
    );
  },
);

export const getTeamByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const team = await getTeamByIdService(req.team!);
    logger.info(`Fetched team ${team._id}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Team fetched successfully.",
      team,
    );
  },
);

export const updateTeamController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { teamId } = req.params;
    const data = updateTeamSchema.parse(req.body);
    const team = await updateTeamService(teamId, data);
    logger.info(`Updated team ${teamId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Team updated successfully.",
      team,
    );
  },
);

export const deleteTeamController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { teamId } = req.params;
    await deleteTeamService(teamId);
    logger.info(`Deleted team ${teamId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Team deleted successfully.",
      null,
    );
  },
);

export const addTeamMemberController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { teamId } = req.params;
    const { userId } = addTeamMemberSchema.parse(req.body);
    const team = await addTeamMemberService(teamId, userId);
    logger.info(`User ${userId} added to team ${teamId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Member added successfully.",
      team,
    );
  },
);

export const removeTeamMemberController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { teamId, userId } = req.params;
    const team = await removeTeamMemberService(teamId, userId);
    logger.info(`User ${userId} removed from team ${teamId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Member removed successfully.",
      team,
    );
  },
);

export const changeTeamLeadController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { teamId } = req.params;
    const { leadId } = changeTeamLeadSchema.parse(req.body);
    const team = await changeTeamLeadService(teamId, leadId);
    logger.info(`Changed lead of team ${teamId} to ${leadId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Team lead changed successfully.",
      team,
    );
  },
);
