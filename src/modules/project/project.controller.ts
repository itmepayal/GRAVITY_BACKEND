import {
  addProjectMemberSchema,
  updateProjectMemberRoleSchema,
  getProjectTasksSchema,
} from "../../validators/project.validator";
import {
  addProjectMemberService,
  updateProjectMemberRoleService,
  removeProjectMemberService,
  createBoardService,
  listBoardsService,
  createSprintService,
  getProjectSprintsService,
  getProjectTasksService,
} from "./project.service";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import { createBoardSchema } from "../../validators/board.validator";
import { createSprintSchema } from "../../validators/sprint.validation";

export const addProjectMemberController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const { userId, roleId } = addProjectMemberSchema.parse(req.body);
    const project = await addProjectMemberService(projectId, userId, roleId);
    logger.info(`User ${userId} added to project ${projectId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Member added successfully.",
      project,
    );
  },
);

export const updateProjectMemberRoleController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { projectId, userId } = req.params;
    const { roleId } = updateProjectMemberRoleSchema.parse(req.body);
    const project = await updateProjectMemberRoleService(
      projectId,
      userId,
      roleId,
    );
    logger.info(`Role of user ${userId} updated in project ${projectId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Member role updated successfully.",
      project,
    );
  },
);

export const removeProjectMemberController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { projectId, userId } = req.params;
    const project = await removeProjectMemberService(projectId, userId);
    logger.info(`User ${userId} removed from project ${projectId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Member removed successfully.",
      project,
    );
  },
);

export const createBoardController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const workspaceId = req.project!.workspace.toString();
    const userId = req.user!.id;
    const boardData = createBoardSchema.parse(req.body);
    const board = await createBoardService(
      projectId,
      workspaceId,
      userId,
      boardData,
    );
    logger.info(`Board created in project ${projectId} by user ${userId}.`);
    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Board created successfully.",
      board,
    );
  },
);

export const listBoardsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const boards = await listBoardsService(projectId);
    logger.info(`Boards fetched for project ${projectId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Boards fetched successfully.",
      boards,
    );
  },
);

export const createSprintController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const body = createSprintSchema.parse(req.body);
    const sprint = await createSprintService(body, req.project!, userId);
    logger.info(
      `Sprint created in project ${req.project!._id} by user ${userId}.`,
    );
    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Sprint created successfully.",
      sprint,
    );
  },
);

export const getProjectSprintsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const userId = req.user!.id;
    const sprints = await getProjectSprintsService(projectId);
    logger.info(`Sprints fetched for project ${projectId} by user ${userId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Sprints fetched successfully.",
      sprints,
    );
  },
);

export const getProjectTasksController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { params, query } = getProjectTasksSchema.parse({
      params: req.params,
      query: req.query,
    });
    const tasks = await getProjectTasksService(params.projectId, query);
    logger.info(`Tasks fetched for project ${params.projectId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Project tasks fetched successfully.",
      tasks,
    );
  },
);
