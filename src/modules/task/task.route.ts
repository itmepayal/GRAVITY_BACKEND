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
  moveTaskController,
  assignTaskController,
  addSubTaskController,
  updateSubTaskController,
  deleteSubTaskController,
  addCommentController,
  deleteCommentController,
  updateCommentController,
  addWatcherController,
  removeWatcherController,
  getMyTasksController,
  updateActualHoursController,
} from "./task.controller";
import { upload } from "../../middlewares/multer.middleware";

const taskRouter = express.Router();

taskRouter.get("/", authenticate, getMyTasksController);
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
taskRouter.patch(
  "/:taskId/move",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  moveTaskController,
);
taskRouter.patch(
  "/:taskId/assignee",
  authenticate,
  checkTaskAccess,
  requirePermission("task:assign"),
  assignTaskController,
);
taskRouter.post(
  "/:taskId/subtasks",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  addSubTaskController,
);
taskRouter.patch(
  "/:taskId/subtasks/:subtaskId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  updateSubTaskController,
);
taskRouter.delete(
  "/:taskId/subtasks/:subtaskId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  deleteSubTaskController,
);
taskRouter.post(
  "/:taskId/comments",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  addCommentController,
);
taskRouter.patch(
  "/:taskId/comments/:commentId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  updateCommentController,
);
taskRouter.delete(
  "/:taskId/comments/:commentId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  deleteCommentController,
);
taskRouter.post(
  "/:taskId/watchers",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  addWatcherController,
);
taskRouter.delete(
  "/:taskId/watchers/:userId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  removeWatcherController,
);
taskRouter.patch(
  "/:taskId/hours",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  updateActualHoursController,
);

export default taskRouter;
