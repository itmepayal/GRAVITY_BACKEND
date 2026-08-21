import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { AppResponse } from "../../utils/response/app.response";
import {
  createTimeEntryService,
  deleteTimeEntryService,
  getWorkspaceTimeEntriesService,
} from "./time-entry.service";
import {
  createTimeEntrySchema,
  getWorkspaceTimeEntriesSchema,
} from "../../validators/time-entry.validator";

export const createTimeEntryController = asyncHandler(
  async (req: Request, res: Response) => {
    const { body } = createTimeEntrySchema.parse({
      body: req.body,
    });
    const userId = req.user!.id;

    const entry = await createTimeEntryService({
      ...body,
      user: userId,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      date: body.date ? new Date(body.date) : undefined,
    });

    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Time entry created successfully",
      entry,
    );
  },
);

export const getWorkspaceTimeEntriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { params, query } = getWorkspaceTimeEntriesSchema.parse({
      params: req.params,
      query: req.query,
    });

    const result = await getWorkspaceTimeEntriesService(
      params.workspaceId,
      query.taskId,
      query.userId,
      Number(query.page) || 1,
      Number(query.limit) || 20,
    );

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Time entries fetched successfully",
      result.entries,
      result.pagination,
    );
  },
);

export const deleteTimeEntryController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteTimeEntryService(id);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Time entry deleted successfully",
    );
  },
);
