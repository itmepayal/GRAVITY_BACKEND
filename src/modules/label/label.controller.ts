import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { AppResponse } from "../../utils/response/app.response";
import {
  createLabelService,
  deleteLabelService,
  getWorkspaceLabelsService,
} from "./label.service";
import {
  createLabelSchema,
  getWorkspaceLabelsSchema,
} from "../../validators/label.validator";

export const createLabelController = asyncHandler(
  async (req: Request, res: Response) => {
    const { body } = createLabelSchema.parse({
      body: req.body,
    });
    const userId = req.user!.id;

    const label = await createLabelService({
      ...body,
      createdBy: userId,
    });

    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Label created successfully",
      label,
    );
  },
);

export const getWorkspaceLabelsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { params } = getWorkspaceLabelsSchema.parse({
      params: req.params,
    });

    const labels = await getWorkspaceLabelsService(params.workspaceId);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Labels fetched successfully",
      labels,
    );
  },
);

export const deleteLabelController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteLabelService(id);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Label deleted successfully",
    );
  },
);
