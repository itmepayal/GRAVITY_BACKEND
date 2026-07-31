import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  checkTaskAccess,
  checkTaskCreateAccess,
} from "../../middlewares/task.middleware";
import {
  checkBoardAccess,
  requireBoardPermission,
} from "../../middlewares/board.middleware";
import { requirePermission } from "../../middlewares/project.middleware";
import {
  createTaskController,
  getAllTasksOfBoardController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  archiveTaskController,
} from "./task.controller";
import { upload } from "../../middlewares/multer.middleware";

const taskRouter = express.Router();

taskRouter.post(
  "/",
  authenticate,
  upload.array("attachments"),
  checkTaskCreateAccess,
  requireBoardPermission("task:create"),
  createTaskController,
);
taskRouter.get(
  "/boards/:boardId/tasks",
  authenticate,
  checkBoardAccess,
  requireBoardPermission("task:view"),
  getAllTasksOfBoardController,
);
taskRouter.get(
  "/:taskId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:view"),
  getTaskByIdController,
);
taskRouter.patch(
  "/:taskId",
  authenticate,
  upload.array("attachments", 10),
  checkTaskAccess,
  requirePermission("task:update"),
  updateTaskController,
);
taskRouter.delete(
  "/:taskId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:delete"),
  deleteTaskController,
);
taskRouter.patch(
  "/:taskId/archive",
  authenticate,
  checkTaskAccess,
  requirePermission("task:archive"),
  archiveTaskController,
);

export default taskRouter;
