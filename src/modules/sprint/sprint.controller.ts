import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import {
  sprintIdParamSchema,
  updateSprintSchema,
} from "../../validators/sprint.validator";
import {
  getSprintByIdService,
  updateSprintService,
  deleteSprintService,
  startSprintService,
  completeSprintService,
  getTasksBySprintService,
} from "./sprint.service";

export const getSprintByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { sprintId } = sprintIdParamSchema.parse({
      params: req.params,
    }).params;
    const sprint = await getSprintByIdService(sprintId);
    logger.info(`Sprint ${sprintId} fetched successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Sprint fetched successfully.",
      sprint,
    );
  },
);

export const updateSprintController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { sprintId } = sprintIdParamSchema.parse({
      params: req.params,
    }).params;
    const body = updateSprintSchema.parse(req.body);
    const sprint = await updateSprintService(sprintId, body, userId);
    logger.info(`Sprint ${sprintId} updated successfully by user ${userId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Sprint updated successfully.",
      sprint,
    );
  },
);

export const deleteSprintController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { sprintId } = sprintIdParamSchema.parse({
      params: req.params,
    }).params;
    const sprint = await deleteSprintService(sprintId, userId);
    logger.info(`Sprint ${sprintId} deleted successfully by user ${userId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Sprint deleted successfully.",
      sprint,
    );
  },
);

export const startSprintController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { sprintId } = sprintIdParamSchema.parse({
      params: req.params,
    }).params;
    const sprint = await startSprintService(sprintId, userId);
    logger.info(`Sprint ${sprintId} started successfully by user ${userId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Sprint started successfully.",
      sprint,
    );
  },
);

export const completeSprintController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { sprintId } = sprintIdParamSchema.parse({
      params: req.params,
    }).params;
    const sprint = await completeSprintService(sprintId, userId);
    logger.info(`Sprint ${sprintId} completed successfully by user ${userId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Sprint completed successfully.",
      sprint,
    );
  },
);

export const getTasksBySprintController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { sprintId } = sprintIdParamSchema.parse({
      params: req.params,
    }).params;
    const result = await getTasksBySprintService(sprintId);
    logger.info(`Tasks for sprint ${sprintId} fetched successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Sprint tasks fetched successfully.",
      result,
    );
  },
);
