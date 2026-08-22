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
  getAllTasksOfProjectController,
} from "./task.controller";
import { upload } from "../../middlewares/multer.middleware";

const taskRouter = express.Router();

/**
 * @swagger
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get tasks assigned to, created by, watched by, or in projects accessible to the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, in_review, completed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: isArchived
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: My tasks fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TasksListResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.get("/", authenticate, getMyTasksController);

/**
 * @swagger
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskMultipartRequest'
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Workspace, project, board, or sprint not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.post(
  "/",
  authenticate,
  upload.array("attachments"),
  checkTaskCreateAccess,
  requireBoardPermission("task:create"),
  createTaskController,
);

/**
 * @swagger
 * /tasks/boards/{boardId}/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks on a board
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, in_review, completed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *       - in: query
 *         name: isArchived
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Tasks fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TasksListResponse'
 *       404:
 *         description: Board not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.get(
  "/boards/:boardId/tasks",
  authenticate,
  checkBoardAccess,
  requireBoardPermission("task:view"),
  getAllTasksOfBoardController,
);

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.get(
  "/:taskId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:view"),
  getTaskByIdController,
);

/**
 * @swagger
 * /tasks/{taskId}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskMultipartRequest'
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.patch(
  "/:taskId",
  authenticate,
  upload.array("attachments", 10),
  checkTaskAccess,
  requirePermission("task:update"),
  updateTaskController,
);

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.delete(
  "/:taskId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:delete"),
  deleteTaskController,
);

/**
 * @swagger
 * /tasks/{taskId}/archive:
 *   patch:
 *     tags: [Tasks]
 *     summary: Archive or unarchive a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArchiveTaskRequest'
 *     responses:
 *       200:
 *         description: Task archived/unarchived successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.patch(
  "/:taskId/archive",
  authenticate,
  checkTaskAccess,
  requirePermission("task:archive"),
  archiveTaskController,
);

/**
 * @swagger
 * /tasks/{taskId}/move:
 *   patch:
 *     tags: [Tasks]
 *     summary: Move a task to a different column (and optionally status)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoveTaskRequest'
 *     responses:
 *       200:
 *         description: Task moved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Invalid column for this board.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.patch(
  "/:taskId/move",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  moveTaskController,
);

/**
 * @swagger
 * /tasks/{taskId}/assignee:
 *   patch:
 *     tags: [Tasks]
 *     summary: Assign or unassign a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignTaskRequest'
 *     responses:
 *       200:
 *         description: Task assigned/unassigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task, user, or project not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.patch(
  "/:taskId/assignee",
  authenticate,
  checkTaskAccess,
  requirePermission("task:assign"),
  assignTaskController,
);

/**
 * @swagger
 * /tasks/{taskId}/subtasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Add a subtask to a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddSubTaskRequest'
 *     responses:
 *       201:
 *         description: Subtask added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.post(
  "/:taskId/subtasks",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  addSubTaskController,
);

/**
 * @swagger
 * /tasks/{taskId}/subtasks/{subtaskId}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a subtask
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubTaskRequest'
 *     responses:
 *       200:
 *         description: Subtask updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task or subtask not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.patch(
  "/:taskId/subtasks/:subtaskId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  updateSubTaskController,
);

/**
 * @swagger
 * /tasks/{taskId}/subtasks/{subtaskId}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a subtask
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subtask deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task or subtask not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.delete(
  "/:taskId/subtasks/:subtaskId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  deleteSubTaskController,
);

/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   post:
 *     tags: [Tasks]
 *     summary: Add a comment to a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCommentRequest'
 *     responses:
 *       201:
 *         description: Comment added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.post(
  "/:taskId/comments",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  addCommentController,
);

/**
 * @swagger
 * /tasks/{taskId}/comments/{commentId}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a comment (author only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentRequest'
 *     responses:
 *       200:
 *         description: Comment updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       403:
 *         description: You can only edit your own comment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Task or comment not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.patch(
  "/:taskId/comments/:commentId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  updateCommentController,
);

/**
 * @swagger
 * /tasks/{taskId}/comments/{commentId}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a comment (author only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task or comment not found, or not the comment author.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.delete(
  "/:taskId/comments/:commentId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  deleteCommentController,
);

/**
 * @swagger
 * /tasks/{taskId}/watchers:
 *   post:
 *     tags: [Tasks]
 *     summary: Add a watcher to a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddWatcherRequest'
 *     responses:
 *       200:
 *         description: Watcher added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task, user, or workspace/project membership not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.post(
  "/:taskId/watchers",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  addWatcherController,
);

/**
 * @swagger
 * /tasks/{taskId}/watchers/{userId}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Remove a watcher from a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Watcher removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task or watcher not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.delete(
  "/:taskId/watchers/:userId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  removeWatcherController,
);

/**
 * @swagger
 * /tasks/{taskId}/hours:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update actual hours logged on a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateActualHoursRequest'
 *     responses:
 *       200:
 *         description: Actual hours updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.patch(
  "/:taskId/hours",
  authenticate,
  checkTaskAccess,
  requirePermission("task:update"),
  updateActualHoursController,
);

/**
 * @swagger
 * /tasks/projects/{projectId}/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks in a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, in_review, completed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *       - in: query
 *         name: isArchived
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Project tasks fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TasksListResponse'
 *       404:
 *         description: Project not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
taskRouter.get(
  "/projects/:projectId/tasks",
  authenticate,
  requirePermission("task:view"),
  getAllTasksOfProjectController,
);

export default taskRouter;
