import { Request, Response, NextFunction } from "express";
import Task from "../models/task.model";
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "../utils/errors/app.error";
import { checkBoardAccess } from "./board.middleware";
import { checkProjectAccess } from "./project.middleware";

export const checkTaskAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found.");
    }

    req.task = task;
    req.params.projectId = task.project.toString();

    return checkProjectAccess(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const checkTaskCreateAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let data: any;

    if (req.body?.data !== undefined) {
      try {
        data =
          typeof req.body.data === "string"
            ? JSON.parse(req.body.data)
            : req.body.data;
      } catch {
        throw new BadRequestError("Invalid task data format.");
      }
    } else if (req.body && Object.keys(req.body).length > 0) {
      data = req.body;
    } else {
      throw new BadRequestError("Task data is required.");
    }

    const { board } = data;

    if (!board) {
      throw new NotFoundError("Board is required to create a task.");
    }

    req.body.parsedData = data;
    req.params.boardId = board;

    return checkBoardAccess(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const checkCommentOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;
    const task = req.task;

    if (!task) {
      throw new NotFoundError("Task not found.");
    }

    const comment = task.comments.find(
      (c: any) => c._id.toString() === commentId,
    );

    if (!comment) {
      throw new NotFoundError("Comment not found.");
    }

    const permissions = req.projectPermissions ?? [];
    const isOwner = comment.user.toString() === userId;
    const canManage =
      permissions.includes("*") || permissions.includes("task:manage_comments");

    if (!isOwner && !canManage) {
      throw new ForbiddenError("You can only edit or delete your own comment.");
    }

    req.comment = comment;
    return next();
  } catch (error) {
    next(error);
  }
};
