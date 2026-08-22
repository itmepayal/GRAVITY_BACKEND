import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { AppResponse } from "../../utils/response/app.response";
import {
  createMilestoneService,
  deleteMilestoneService,
  getProjectMilestonesService,
  updateMilestoneService,
} from "./milestone.service";
import {
  createMilestoneSchema,
  getProjectMilestonesSchema,
  updateMilestoneSchema,
} from "../../validators/milestone.validator";

export const createMilestoneController = asyncHandler(
  async (req: Request, res: Response) => {
    const { body } = createMilestoneSchema.parse({
      body: req.body,
    });
    const userId = req.user!.id;

    const milestone = await createMilestoneService({
      ...body,
      startDate: new Date(body.startDate),
      dueDate: new Date(body.dueDate),
      createdBy: userId,
    });

    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Milestone created successfully",
      milestone,
    );
  },
);

export const getProjectMilestonesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { params } = getProjectMilestonesSchema.parse({
      params: req.params,
    });

    const milestones = await getProjectMilestonesService(params.projectId);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Project milestones fetched successfully",
      milestones,
    );
  },
);

export const updateMilestoneController = asyncHandler(
  async (req: Request, res: Response) => {
    const { params, body } = updateMilestoneSchema.parse({
      params: req.params,
      body: req.body,
    });

    const milestone = await updateMilestoneService(params.id, body);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Milestone updated successfully",
      milestone,
    );
  },
);

export const deleteMilestoneController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteMilestoneService(id);

    AppResponse.success(res, StatusCodes.OK, "Milestone deleted successfully");
  },
);
