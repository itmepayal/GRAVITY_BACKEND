import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { checkWorkspaceAccess } from "../../middlewares/workspace.middleware";
import {
  checkGoalAccess,
  requireGoalPermission,
} from "../../middlewares/goal.middleware";
import {
  createGoalController,
  getWorkspaceGoalsController,
  getGoalByIdController,
  updateGoalController,
  deleteGoalController,
  linkTaskToGoalController,
  unlinkTaskFromGoalController,
} from "./goal.controller";

const goalRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Workspace goal management APIs (create, track, and link goals to tasks)
 */

/**
 * @swagger
 * /workspaces/{workspaceId}/goals:
 *   post:
 *     summary: Create a goal
 *     description: >
 *       Creates a new goal within a workspace, optionally scoped to a
 *       project in that workspace. Goal titles must be unique within a
 *       workspace (case-insensitive).
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the workspace to create the goal in
 *         example: 665f0a1e8b3f4a0012a3c9c1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGoalRequest'
 *     responses:
 *       201:
 *         description: Goal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoalResponse'
 *       400:
 *         description: >
 *           Validation error, title is empty, or a goal with this title
 *           already exists in the workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Workspace not found, or project not found in this workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
goalRouter.post(
  "/workspaces/:workspaceId/goals",
  authenticate,
  checkWorkspaceAccess,
  createGoalController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}/goals:
 *   get:
 *     summary: List goals in a workspace
 *     description: Returns all goals in a workspace, optionally filtered by project and/or status, sorted by most recently created.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the workspace to list goals from
 *         example: 665f0a1e8b3f4a0012a3c9c1
 *       - in: query
 *         name: project
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter goals by project ID
 *         example: 665f0a1e8b3f4a0012a3c9d0
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *         description: Filter goals by status
 *         example: in_progress
 *     responses:
 *       200:
 *         description: Goals fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoalsListResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
goalRouter.get(
  "/workspaces/:workspaceId/goals",
  authenticate,
  checkWorkspaceAccess,
  getWorkspaceGoalsController,
);

/**
 * @swagger
 * /goals/{goalId}:
 *   get:
 *     summary: Get a goal by ID
 *     description: >
 *       Returns a single goal with its owner, project, and linked tasks
 *       fully populated. Requires `goal:view` permission on the goal.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the goal to fetch
 *         example: 665f4c1e8b3f4a0012a3cb10
 *     responses:
 *       200:
 *         description: Goal fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoalResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: User does not have `goal:view` permission on this goal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Goal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
goalRouter.get(
  "/:goalId",
  authenticate,
  checkGoalAccess,
  requireGoalPermission("goal:view"),
  getGoalByIdController,
);

/**
 * @swagger
 * /goals/{goalId}:
 *   patch:
 *     summary: Update a goal
 *     description: >
 *       Partially updates a goal's title, description, target date,
 *       progress, or status. Requires `goal:update` permission on the
 *       goal. Setting `progress` to 100 automatically marks the goal
 *       `completed`; setting `status` to `completed` forces `progress`
 *       to 100 and stamps `completedAt`. Moving a goal off `completed`
 *       clears `completedAt`.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the goal to update
 *         example: 665f4c1e8b3f4a0012a3cb10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGoalRequest'
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoalResponse'
 *       400:
 *         description: >
 *           Validation error, title is empty, or a goal with this title
 *           already exists in the workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: User does not have `goal:update` permission on this goal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Goal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
goalRouter.patch(
  "/:goalId",
  authenticate,
  checkGoalAccess,
  requireGoalPermission("goal:update"),
  updateGoalController,
);

/**
 * @swagger
 * /goals/{goalId}:
 *   delete:
 *     summary: Delete a goal
 *     description: >
 *       Permanently deletes a goal and all sprints linked to it.
 *       Requires `goal:delete` permission on the goal. This action
 *       cannot be undone.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the goal to delete
 *         example: 665f4c1e8b3f4a0012a3cb10
 *     responses:
 *       200:
 *         description: Goal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: User does not have `goal:delete` permission on this goal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Goal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
goalRouter.delete(
  "/:goalId",
  authenticate,
  checkGoalAccess,
  requireGoalPermission("goal:delete"),
  deleteGoalController,
);

/**
 * @swagger
 * /goals/{goalId}/tasks/{taskId}:
 *   post:
 *     summary: Link a task to a goal
 *     description: >
 *       Links an existing task to a goal. The task must belong to the
 *       same workspace as the goal, and to the same project if the goal
 *       is project-scoped. Requires `goal:link` permission on the goal.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the goal
 *         example: 665f4c1e8b3f4a0012a3cb10
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to link
 *         example: 665f3b1e8b3f4a0012a3ca01
 *     responses:
 *       200:
 *         description: Task linked to goal successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoalResponse'
 *       400:
 *         description: Task is already linked to this goal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: User does not have `goal:link` permission on this goal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Goal not found, or task not found in this workspace/project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
goalRouter.post(
  "/:goalId/tasks/:taskId",
  authenticate,
  checkGoalAccess,
  requireGoalPermission("goal:link"),
  linkTaskToGoalController,
);

/**
 * @swagger
 * /goals/{goalId}/tasks/{taskId}:
 *   delete:
 *     summary: Unlink a task from a goal
 *     description: Removes the link between a task and a goal. Requires `goal:link` permission on the goal.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the goal
 *         example: 665f4c1e8b3f4a0012a3cb10
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to unlink
 *         example: 665f3b1e8b3f4a0012a3ca01
 *     responses:
 *       200:
 *         description: Task unlinked from goal successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoalResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: User does not have `goal:link` permission on this goal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Goal not found, or task is not linked to this goal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
goalRouter.delete(
  "/:goalId/tasks/:taskId",
  authenticate,
  checkGoalAccess,
  requireGoalPermission("goal:link"),
  unlinkTaskFromGoalController,
);

export default goalRouter;
