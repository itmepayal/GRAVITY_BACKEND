import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { AppResponse } from "../../utils/response/app.response";
import {
  createCalendarEventService,
  deleteCalendarEventService,
  getWorkspaceCalendarEventsService,
  updateCalendarEventService,
} from "./calendar-event.service";
import {
  createCalendarEventSchema,
  getWorkspaceCalendarEventsSchema,
} from "../../validators/calendar-event.validator";

export const createCalendarEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const { body } = createCalendarEventSchema.parse({
      body: req.body,
    });
    const userId = req.user!.id;

    const event = await createCalendarEventService({
      ...body,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      createdBy: userId,
    });

    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Calendar event created successfully",
      event,
    );
  },
);

export const getWorkspaceCalendarEventsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { params, query } = getWorkspaceCalendarEventsSchema.parse({
      params: req.params,
      query: req.query,
    });

    const events = await getWorkspaceCalendarEventsService(
      params.workspaceId,
      query.projectId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Calendar events fetched successfully",
      events,
    );
  },
);

export const updateCalendarEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const event = await updateCalendarEventService(id, req.body);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Calendar event updated successfully",
      event,
    );
  },
);

export const deleteCalendarEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteCalendarEventService(id);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Calendar event deleted successfully",
    );
  },
);
