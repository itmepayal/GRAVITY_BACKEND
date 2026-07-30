import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import {
  taskIdParamSchema,
  createTaskSchema,
} from "../../validators/task.validator";
import { createTaskService, getTaskByIdService } from "./task.service";
import { uploadToCloudinary } from "../../config/cloudinary.config";

export const createTaskController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const body = createTaskSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    const attachments = [];

    if (files?.length) {
      for (const file of files) {
        const resourceType =
          file.mimetype === "application/pdf" ? "raw" : "image";

        const uploaded = await uploadToCloudinary(
          file.path,
          "tasks",
          resourceType,
        );

        attachments.push({
          fileName: file.originalname,
          fileUrl: uploaded.url,
          publicId: uploaded.publicId,
          fileType: file.mimetype,
          fileSize: file.size,
          uploadedBy: userId,
        });
      }
    }
    const task = await createTaskService(userId, {
      ...body,
      attachments,
    });
    logger.info(`Task ${task.id} created successfully.`);
    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Task created successfully.",
      task,
    );
  },
);

export const getTaskByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = taskIdParamSchema.parse({
      params: req.params,
    }).params;
    const task = await getTaskByIdService(taskId);
    logger.info(`Task ${taskId} fetched successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Task fetched successfully.",
      task,
    );
  },
);
