import { Types } from "mongoose";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import {
  taskIdParamSchema,
  createTaskSchema,
  boardIdParamSchema,
  taskListQuerySchema,
  updateTaskSchema,
  archiveTaskSchema,
} from "../../validators/task.validator";
import {
  createTaskService,
  getTaskByIdService,
  getAllTasksOfBoardService,
  updateTaskService,
  deleteTaskService,
  archiveTaskService,
} from "./task.service";
import { uploadToCloudinary } from "../../config/cloudinary.config";
import { IAttachment } from "../../models/task.model";

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

export const getAllTasksOfBoardController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { boardId } = boardIdParamSchema.parse({
      params: req.params,
    }).params;

    const { status, priority, assignee, isArchived } =
      taskListQuerySchema.parse({ query: req.query }).query;

    const tasks = await getAllTasksOfBoardService(boardId, {
      status,
      priority,
      assignee,
      isArchived,
    });

    logger.info(`Tasks for board ${boardId} fetched successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Tasks fetched successfully.",
      tasks,
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

export const updateTaskController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { params, body } = updateTaskSchema.parse({
      params: req.params,
      body: req.body,
    });
    const files = req.files as Express.Multer.File[];
    let attachments: IAttachment[] | undefined;
    if (files?.length) {
      const userId = new Types.ObjectId(req.user!.id);
      attachments = await Promise.all(
        files.map(async (file) => {
          const result = await uploadToCloudinary(file.path);
          return {
            fileName: file.originalname,
            fileUrl: result.url,
            fileType: result.format,
            fileSize: result.bytes,
            uploadedBy: userId,
            uploadedAt: new Date(),
          };
        }),
      );
    }
    const task = await updateTaskService(params.taskId, {
      ...body,
      ...(attachments && { attachments }),
    });
    logger.info(`Task ${params.taskId} updated successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Task updated successfully.",
      task,
    );
  },
);

export const deleteTaskController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = taskIdParamSchema.parse({
      params: req.params,
    }).params;

    await deleteTaskService(taskId);
    logger.info(`Task ${taskId} deleted successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Task deleted successfully.",
      null,
    );
  },
);

export const archiveTaskController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { params, body } = archiveTaskSchema.parse({
      params: req.params,
      body: req.body,
    });
    const { taskId } = params;
    const { isArchived } = body;

    const task = await archiveTaskService(taskId, isArchived);
    logger.info(
      `Task ${taskId} ${task.isArchived ? "archived" : "unarchived"} successfully.`,
    );
    AppResponse.success(
      res,
      StatusCodes.OK,
      `Task ${task.isArchived ? "archived" : "unarchived"} successfully.`,
      task,
    );
  },
);
