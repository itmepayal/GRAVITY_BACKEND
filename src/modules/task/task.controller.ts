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
  moveTaskSchema,
  assigneeTaskSchema,
  addSubTaskSchema,
  deleteSubTaskSchema,
  updateSubTaskSchema,
  addCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  addWatcherSchema,
  removeWatcherSchema,
  addAttachmentSchema,
  removeAttachmentSchema,
  updateActualHoursSchema,
} from "../../validators/task.validator";
import {
  createTaskService,
  getTaskByIdService,
  getAllTasksOfBoardService,
  updateTaskService,
  deleteTaskService,
  archiveTaskService,
  assignTaskService,
  moveTaskService,
  addSubTaskService,
  updateSubTaskService,
  deleteSubTaskService,
  addCommentService,
  updateCommentService,
  deleteCommentService,
  addWatcherService,
  removeWatcherService,
  addAttachmentService,
  removeAttachmentService,
  updateActualHoursService,
} from "./task.service";
import { uploadToCloudinary } from "../../config/cloudinary.config";
import { IAttachment } from "../../models/task.model";
import { BadRequestError } from "../../utils/errors/app.error";

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
          const resourceType =
            file.mimetype === "application/pdf" ? "raw" : "image";

          const uploaded = await uploadToCloudinary(
            file.path,
            "tasks",
            resourceType,
          );

          return {
            fileName: file.originalname,
            fileUrl: uploaded.url,
            publicId: uploaded.publicId,
            fileType: file.mimetype,
            fileSize: file.size,
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

export const moveTaskController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { params, body } = moveTaskSchema.parse({
      params: req.params,
      body: req.body,
    });
    const task = await moveTaskService(params.taskId, body);
    logger.info(`Task ${params.taskId} moved successfully.`);
    AppResponse.success(res, StatusCodes.OK, "Task moved successfully.", task);
  },
);

export const assignTaskController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { params, body } = assigneeTaskSchema.parse({
      params: req.params,
      body: req.body,
    });
    const task = await assignTaskService(params.taskId, body.assignee);
    logger.info(
      `Task ${params.taskId} ${body.assignee ? "assigned" : "unassigned"} successfully.`,
    );
    AppResponse.success(
      res,
      StatusCodes.OK,
      `Task ${body.assignee ? "assigned" : "unassigned"} successfully.`,
      task,
    );
  },
);

export const addSubTaskController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { params, body } = addSubTaskSchema.parse({
      params: req.params,
      body: req.body,
    });

    const task = await addSubTaskService(params.taskId, body.title);

    logger.info(`Subtask added to task ${params.taskId}.`);

    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Subtask added successfully.",
      task,
    );
  },
);

export const updateSubTaskController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { params, body } = updateSubTaskSchema.parse({
      params: req.params,
      body: req.body,
    });

    const task = await updateSubTaskService(
      params.taskId,
      params.subtaskId,
      body,
    );

    logger.info(`Subtask updated successfully.`);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Subtask updated successfully.",
      task,
    );
  },
);

export const deleteSubTaskController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { taskId, subtaskId } = deleteSubTaskSchema.parse({
      params: req.params,
    }).params;

    const task = await deleteSubTaskService(taskId, subtaskId);

    logger.info(`Subtask deleted successfully.`);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Subtask deleted successfully.",
      task,
    );
  },
);

export const addCommentController = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { params, body } = addCommentSchema.parse({
    params: req.params,
    body: req.body,
  });
  const task = await addCommentService(params.taskId, userId, body.message);
  logger.info(`Comment added to task ${params.taskId}.`);
  AppResponse.success(
    res,
    StatusCodes.CREATED,
    "Comment added successfully.",
    task,
  );
});

export const updateCommentController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const { params, body } = updateCommentSchema.parse({
      params: req.params,
      body: req.body,
    });

    const task = await updateCommentService(
      params.taskId,
      params.commentId,
      userId,
      body.message,
    );

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Comment updated successfully.",
      task,
    );
  },
);

export const deleteCommentController = asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const { taskId, commentId } = deleteCommentSchema.parse({
    params: req.params,
  }).params;

  const task = await deleteCommentService(taskId, commentId, userId);

  AppResponse.success(
    res,
    StatusCodes.OK,
    "Comment deleted successfully.",
    task,
  );
});

export const addWatcherController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { params, body } = addWatcherSchema.parse({
      params: req.params,
      body: req.body,
    });
    const task = await addWatcherService(params.taskId, body.userId);
    logger.info(`Watcher ${body.userId} added to task ${params.taskId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Watcher added successfully.",
      task,
    );
  },
);

export const removeWatcherController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { taskId, userId } = removeWatcherSchema.parse({
      params: req.params,
    }).params;
    const task = await removeWatcherService(taskId, userId);
    logger.info(`Watcher ${userId} removed from task ${taskId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Watcher removed successfully.",
      task,
    );
  },
);

export const addAttachmentController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const { taskId } = addAttachmentSchema.parse({
      params: req.params,
    }).params;

    const files = req.files as Express.Multer.File[];

    if (!files?.length) {
      throw new BadRequestError("Attachment is required.");
    }

    const attachments: IAttachment[] = [];

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
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedBy: new Types.ObjectId(userId),
        uploadedAt: new Date(),
      } as any);
    }

    const task = await addAttachmentService(taskId, attachments);

    logger.info(`Attachment added to task ${taskId}.`);

    AppResponse.success(
      res,
      StatusCodes.CREATED,
      "Attachment uploaded successfully.",
      task,
    );
  },
);

export const removeAttachmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const { taskId, attachmentId } = removeAttachmentSchema.parse({
      params: req.params,
    }).params;

    const task = await removeAttachmentService(taskId, attachmentId);

    AppResponse.success(
      res,
      StatusCodes.OK,
      "Attachment removed successfully.",
      task,
    );
  },
);

export const updateActualHoursController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = taskIdParamSchema.parse({
      params: req.params,
    }).params;
    const { actualHours } = updateActualHoursSchema.parse(req.body);
    const task = await updateActualHoursService(taskId, actualHours);
    logger.info(`Actual hours updated for task ${taskId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Actual hours updated successfully.",
      task,
    );
  },
);
