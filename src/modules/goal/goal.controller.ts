import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import {
  createGoalSchema,
  updateGoalSchema,
  getWorkspaceGoalsQuerySchema,
} from "../../validators/goal.validator";
import {
  createGoalService,
  getWorkspaceGoalsService,
  getGoalByIdService,
  updateGoalService,
  deleteGoalService,
  linkTaskToGoalService,
  unlinkTaskFromGoalService,
} from "./goal.service";

export const createGoalController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const userId = req.user!.id;
    const data = createGoalSchema.parse(req.body);
    const goal = await createGoalService(workspaceId, userId, data);
    logger.info(`Goal "${goal.title}" created in workspace ${workspaceId}.`);
    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Goal created successfully.",
      goal,
    );
  },
);

export const getWorkspaceGoalsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const query = getWorkspaceGoalsQuerySchema.parse(req.query);
    const goals = await getWorkspaceGoalsService(workspaceId, query);
    logger.info(`Fetched ${goals.length} goals for workspace ${workspaceId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Goals fetched successfully.",
      goals,
    );
  },
);

export const getGoalByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const goal = await getGoalByIdService(req.goal!);
    logger.info(`Goal ${req.goal!._id} fetched successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Goal fetched successfully.",
      goal,
    );
  },
);

export const updateGoalController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { goalId } = req.params;
    const data = updateGoalSchema.parse(req.body);
    const goal = await updateGoalService(goalId, data);
    logger.info(`Goal ${goalId} updated successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Goal updated successfully.",
      goal,
    );
  },
);

export const deleteGoalController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { goalId } = req.params;
    await deleteGoalService(goalId);
    logger.info(`Goal ${goalId} deleted successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Goal deleted successfully.",
      null,
    );
  },
);

export const linkTaskToGoalController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { goalId, taskId } = req.params;
    const goal = await linkTaskToGoalService(goalId, taskId);
    logger.info(`Task ${taskId} linked to goal ${goalId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Task linked to goal successfully.",
      goal,
    );
  },
);

export const unlinkTaskFromGoalController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { goalId, taskId } = req.params;
    const goal = await unlinkTaskFromGoalService(goalId, taskId);
    logger.info(`Task ${taskId} unlinked from goal ${goalId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Task unlinked from goal successfully.",
      goal,
    );
  },
);
