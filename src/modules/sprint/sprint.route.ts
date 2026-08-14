import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { checkSprintAccess } from "../../middlewares/sprint.middleware";
import { requirePermission } from "../../middlewares/project.middleware";
import {
  getSprintByIdController,
  updateSprintController,
  deleteSprintController,
  startSprintController,
  completeSprintController,
  getTasksBySprintController,
} from "./sprint.controller";

const sprintRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sprints
 *   description: Sprint management APIs (view, update, start, complete, and delete sprints)
 */

/**
 * @swagger
 * /sprints/{sprintId}:
 *   get:
 *     summary: Get a sprint by ID
 *     description: >
 *       Returns a single sprint with its creator, board, and goal
 *       populated. Requires `sprint:view` permission.
 *     tags:
 *       - Sprints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint to fetch
 *         example: 665f5d1e8b3f4a0012a3cc20
 *     responses:
 *       200:
 *         description: Sprint fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: User does not have `sprint:view` permission on this sprint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Sprint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
sprintRouter.get(
  "/:sprintId",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:view"),
  getSprintByIdController,
);

/**
 * @swagger
 * /sprints/{sprintId}/tasks:
 *   get:
 *     summary: Get tasks in a sprint
 *     description: >
 *       Returns the sprint along with its non-archived tasks (scoped to
 *       the sprint's board, if it has one). Requires `sprint:view`
 *       permission.
 *     tags:
 *       - Sprints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint
 *         example: 665f5d1e8b3f4a0012a3cc20
 *     responses:
 *       200:
 *         description: Sprint tasks fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintTasksResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: User does not have `sprint:view` permission on this sprint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Sprint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
sprintRouter.get(
  "/:sprintId/tasks",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:view"),
  getTasksBySprintController,
);

/**
 * @swagger
 * /sprints/{sprintId}:
 *   patch:
 *     summary: Update a sprint
 *     description: >
 *       Partially updates a sprint's name, dates, board, or goal.
 *       Completed sprints cannot be updated at all. Active sprints
 *       cannot have their start date or board changed. `board` must
 *       belong to the sprint's project, and `goal` must belong to the
 *       sprint's project and workspace. Requires `sprint:update`
 *       permission.
 *     tags:
 *       - Sprints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint to update
 *         example: 665f5d1e8b3f4a0012a3cc20
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSprintRequest'
 *     responses:
 *       200:
 *         description: Sprint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintResponse'
 *       400:
 *         description: >
 *           Sprint is completed and cannot be updated, start date/board
 *           cannot be changed on an active sprint, or end date is not
 *           after start date
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
 *         description: User does not have `sprint:update` permission on this sprint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: >
 *           Sprint not found, board not found in this project, or goal
 *           not found in this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
sprintRouter.patch(
  "/:sprintId",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:update"),
  updateSprintController,
);

/**
 * @swagger
 * /sprints/{sprintId}:
 *   delete:
 *     summary: Delete a sprint
 *     description: >
 *       Permanently deletes a sprint. Active sprints cannot be deleted
 *       (complete it first), and a sprint that still has tasks assigned
 *       cannot be deleted until those tasks are moved or unassigned.
 *       Requires `sprint:delete` permission.
 *     tags:
 *       - Sprints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint to delete
 *         example: 665f5d1e8b3f4a0012a3cc20
 *     responses:
 *       200:
 *         description: Sprint deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintResponse'
 *       400:
 *         description: Sprint is active and cannot be deleted, or the sprint still has tasks assigned to it
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
 *         description: User does not have `sprint:delete` permission on this sprint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Sprint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
sprintRouter.delete(
  "/:sprintId",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:delete"),
  deleteSprintController,
);

/**
 * @swagger
 * /sprints/{sprintId}/start:
 *   post:
 *     summary: Start a sprint
 *     description: >
 *       Transitions a sprint from `planned` to `active`. Only one active
 *       sprint is allowed per project at a time. Requires
 *       `sprint:start` permission.
 *     tags:
 *       - Sprints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint to start
 *         example: 665f5d1e8b3f4a0012a3cc20
 *     responses:
 *       200:
 *         description: Sprint started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintResponse'
 *       400:
 *         description: >
 *           Sprint is not in `planned` status, or an active sprint
 *           already exists for this project
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
 *         description: User does not have `sprint:start` permission on this sprint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Sprint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
sprintRouter.post(
  "/:sprintId/start",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:start"),
  startSprintController,
);

/**
 * @swagger
 * /sprints/{sprintId}/complete:
 *   post:
 *     summary: Complete a sprint
 *     description: >
 *       Transitions a sprint from `active` to `completed`. Any
 *       non-completed tasks still in the sprint are automatically
 *       unassigned from it. Requires `sprint:complete` permission.
 *     tags:
 *       - Sprints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint to complete
 *         example: 665f5d1e8b3f4a0012a3cc20
 *     responses:
 *       200:
 *         description: Sprint completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintResponse'
 *       400:
 *         description: Sprint is not in `active` status
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
 *         description: User does not have `sprint:complete` permission on this sprint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Sprint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
sprintRouter.post(
  "/:sprintId/complete",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:complete"),
  completeSprintController,
);

export default sprintRouter;
