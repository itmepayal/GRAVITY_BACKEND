import { Request, Response, NextFunction } from "express";
import Task from "../models/task.model";
import { NotFoundError } from "../utils/errors/app.error";
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
    const { board } = req.body;
    if (!board) {
      throw new NotFoundError("Board is required to create a task.");
    }

    req.params.boardId = board;
    return checkBoardAccess(req, res, next);
  } catch (error) {
    next(error);
  }
};
