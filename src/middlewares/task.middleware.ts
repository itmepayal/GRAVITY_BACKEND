import { Request, Response, NextFunction } from "express";
import Task from "../models/task.model";
import { ForbiddenError, NotFoundError } from "../utils/errors/app.error";
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
    console.log(req.body.data);
    const data = JSON.parse(req.body.data);

    const { board } = data;

    if (!board) {
      throw new NotFoundError("Board is required to create a task.");
    }

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
