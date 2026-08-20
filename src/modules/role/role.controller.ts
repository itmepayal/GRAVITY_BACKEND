import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import {
  createRoleSchema,
  getRolesParamSchema,
  roleIdParamSchema,
  updateRoleSchema,
  VALID_PERMISSIONS,
} from "../../validators/role.validation";
import {
  getWorkspaceRolesService,
  createWorkspaceRoleService,
  updateWorkspaceRoleService,
  deleteWorkspaceRoleService,
} from "./role.service";

export const getWorkspaceRolesController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = getRolesParamSchema.parse({
      params: req.params,
    }).params;

    const roles = await getWorkspaceRolesService(workspaceId);

    logger.info(`Roles fetched successfully for workspace ${workspaceId}.`);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Roles fetched successfully.",
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
      `Role ${role.name} created successfully in workspace ${workspaceId}.`,
    );

    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Role created successfully.",
      role,
    );
  },
);

export const getAllPermissionsController = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Permissions list fetched successfully.",
      VALID_PERMISSIONS,
    );
  },
);

export const updateWorkspaceRoleController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = getRolesParamSchema.parse({
      params: req.params,
    }).params;

    const { roleId } = roleIdParamSchema.parse({
      params: req.params,
    }).params;

    const roleData = updateRoleSchema.parse(req.body);

    const role = await updateWorkspaceRoleService(
      workspaceId,
      roleId,
      roleData,
    );

    logger.info(
      `Role ${roleId} updated successfully in workspace ${workspaceId}.`,
    );

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Role updated successfully.",
      role,
    );
  },
);

export const deleteWorkspaceRoleController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = getRolesParamSchema.parse({
      params: req.params,
    }).params;

    const { roleId } = roleIdParamSchema.parse({
      params: req.params,
    }).params;

    await deleteWorkspaceRoleService(workspaceId, roleId);

    logger.info(
      `Role ${roleId} deleted successfully from workspace ${workspaceId}.`,
    );

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Role deleted successfully.",
      null,
    );
  },
);
