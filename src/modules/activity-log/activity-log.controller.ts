import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { AppResponse } from "../../utils/response/app.response";
import {
  createActivityLogService,
  getActivityLogsService,
} from "./activity-log.service";
import { ActivityAction, ActivityEntityType } from "../../models/activity-log.model";
import {
  createActivityLogSchema,
  getEntityActivityLogsSchema,
  getWorkspaceActivityLogsSchema,
} from "../../validators/activity-log.validator";
import { Types } from "mongoose";

/**
 * @desc Get activity logs for a specific workspace
 * @route GET /api/v1/activity-logs/workspace/:workspaceId
 * @access Private
 */
export const getWorkspaceActivityLogsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { params, query } = getWorkspaceActivityLogsSchema.parse({
      params: req.params,
      query: req.query,
    });

    const result = await getActivityLogsService({
      workspaceId: params.workspaceId,
      entityType: query.entityType as ActivityEntityType,
      entityId: query.entityId,
      action: query.action as ActivityAction,
      actor: query.actor,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    });

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Workspace activity logs fetched successfully",
      result.logs,
      result.pagination,
    );
  },
);

/**
 * @desc Get activity logs for a specific entity (Task, Project, etc.)
 * @route GET /api/v1/activity-logs/entity/:entityType/:entityId
 * @access Private
 */
export const getEntityActivityLogsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { params, query } = getEntityActivityLogsSchema.parse({
      params: req.params,
      query: req.query,
    });

    const result = await getActivityLogsService({
      entityType: params.entityType as ActivityEntityType,
      entityId: params.entityId,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    });

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Entity activity logs fetched successfully",
      result.logs,
      result.pagination,
    );
  },
);

/**
 * @desc Manually create an activity log entry
 * @route POST /api/v1/activity-logs
 * @access Private
 */
export const createActivityLogController = asyncHandler(
  async (req: Request, res: Response) => {
    const { body } = createActivityLogSchema.parse({
      body: req.body,
    });
    const actorId = req.user!.id;

    const activity = await createActivityLogService({
      ...body,
      actor: new Types.ObjectId(actorId),
    });

    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Activity log created successfully",
      activity,
    );
  },
);
