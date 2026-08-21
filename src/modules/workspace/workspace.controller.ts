import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import {
  createWorkspaceService,
  getUserWorkspacesService,
  getWorkspaceByIdService,
  deleteWorkspaceService,
  updateWorkspaceService,
  removeWorkspaceMemberService,
  updateWorkspaceMemberRoleService,
  createProjectService,
  getWorkspaceProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
  getWorkspaceRolesService,
  createWorkspaceRoleService,
} from "./workspace.service";
import {
  createWorkspaceSchema,
  updateWorkspaceMemberRoleSchema,
  updateWorkspaceSchema,
} from "../../validators/workspace.validator";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../../validators/project.validator";
import {
  createRoleSchema,
  getRolesParamSchema,
} from "../../validators/role.validator";

export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const validatedData = createWorkspaceSchema.parse(req.body);
    const workspace = await createWorkspaceService(userId, validatedData);
    logger.info(
      `Workspace "${workspace.name}" created successfully by user ${userId}.`,
    );
    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Workspace created successfully.",
      workspace,
    );
  },
);

export const getUserWorkspacesController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const workspaces = await getUserWorkspacesService(userId);
    logger.info(`Fetched ${workspaces.length} workspaces for user ${userId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Workspaces fetched successfully.",
      workspaces,
    );
  },
);

export const getWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const userId = req.user!.id;
    const workspace = await getWorkspaceByIdService(workspaceId, userId);
    logger.info(`Workspace ${workspaceId} fetched successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Workspace fetched successfully.",
      workspace,
    );
  },
);

export const updateWorkspaceController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const userId = req.user!.id;
    const validatedData = updateWorkspaceSchema.parse(req.body);
    const workspace = await updateWorkspaceService(
      workspaceId,
      userId,
      validatedData,
    );
    logger.info(`Workspace ${workspaceId} updated successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Workspace updated successfully.",
      workspace,
    );
  },
);

export const deleteWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user!.id;
    await deleteWorkspaceService(workspaceId, userId);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Workspace deleted successfully.",
      null,
    );
  },
);

export const updateWorkspaceMemberRoleController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, userId } = req.params;
    const currentUserId = req.user!.id;
    const { roleId } = updateWorkspaceMemberRoleSchema.parse(req.body);
    const workspace = await updateWorkspaceMemberRoleService(
      workspaceId,
      currentUserId,
      userId,
      roleId,
    );
    logger.info(`Role of user ${userId} updated in workspace ${workspaceId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Member role updated successfully.",
      workspace,
    );
  },
);

export const removeWorkspaceMemberController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, userId } = req.params;
    const currentUserId = req.user!.id;
    const workspace = await removeWorkspaceMemberService(
      workspaceId,
      currentUserId,
      userId,
    );
    logger.info(
      `User ${userId} removed from workspace ${workspaceId} by user ${currentUserId}.`,
    );
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Member removed successfully.",
      workspace,
    );
  },
);

export const createProjectController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const ownerId = req.user!.id;
    const validatedData = createProjectSchema.parse(req.body);
    const project = await createProjectService(
      workspaceId,
      ownerId,
      validatedData,
    );
    logger.info(
      `Project "${project.name}" created successfully in workspace ${workspaceId}.`,
    );
    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Project created successfully.",
      project,
    );
  },
);

export const getWorkspaceProjectsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const userId = req.user!.id;
    const projects = await getWorkspaceProjectsService(workspaceId, userId);
    logger.info(
      `Fetched ${projects.length} projects from workspace ${workspaceId}.`,
    );
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Projects fetched successfully.",
      projects,
    );
  },
);

export const getProjectByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, projectId } = req.params;
    const project = await getProjectByIdService(workspaceId, projectId);
    logger.info(`Project ${projectId} fetched successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Project fetched successfully.",
      project,
    );
  },
);

export const updateProjectController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, projectId } = req.params;
    const validatedData = updateProjectSchema.parse(req.body);
    const project = await updateProjectService(
      workspaceId,
      projectId,
      validatedData,
    );
    logger.info(`Project ${projectId} updated successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Project updated successfully.",
      project,
    );
  },
);

export const deleteProjectController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, projectId } = req.params;
    await deleteProjectService(workspaceId, projectId);
    logger.info(`Project ${projectId} deleted successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Project deleted successfully.",
      null,
    );
  },
);

export const getWorkspaceRolesController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = getRolesParamSchema.parse({
      params: req.params,
    }).params;
    const roles = await getWorkspaceRolesService(workspaceId);
    logger.info(`Fetched ${roles.length} roles from workspace ${workspaceId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Workspace roles fetched successfully.",
      roles,
    );
  },
);

export const createWorkspaceRoleController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = getRolesParamSchema.parse({
      params: req.params,
    }).params;
    const roleData = createRoleSchema.parse(req.body);
    const role = await createWorkspaceRoleService(workspaceId, roleData);
    logger.info(
      `Role "${role.name}" created successfully in workspace ${workspaceId}.`,
    );
    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Role created successfully.",
      role,
    );
  },
);
