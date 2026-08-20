import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createActivityLogController,
  getEntityActivityLogsController,
  getWorkspaceActivityLogsController,
} from "./activity-log.controller";

const activityLogRouter = express.Router();

// Apply authentication to all activity log endpoints
activityLogRouter.use(authenticate);

/**
 * @swagger
 * /activity-logs/workspace/{workspaceId}:
 *   get:
 *     tags: [Activity Logs]
 *     summary: Get activity logs for a workspace with filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [project, task, board, sprint, goal, team, workspace]
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [created, updated, deleted, status_changed, assigned, commented, member_added, member_removed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Successfully fetched workspace activity logs
 */
activityLogRouter.get(
  "/workspace/:workspaceId",
  getWorkspaceActivityLogsController,
);

/**
 * @swagger
 * /activity-logs/entity/{entityType}/{entityId}:
 *   get:
 *     tags: [Activity Logs]
 *     summary: Get activity logs for a specific entity (task, project, etc.)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [project, task, board, sprint, goal, team, workspace]
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Successfully fetched entity activity logs
 */
activityLogRouter.get(
  "/entity/:entityType/:entityId",
  getEntityActivityLogsController,
);

/**
 * @swagger
 * /activity-logs:
 *   post:
 *     tags: [Activity Logs]
 *     summary: Create an activity log entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspace, action, entityType, entityId]
 *             properties:
 *               workspace:
 *                 type: string
 *               action:
 *                 type: string
 *               entityType:
 *                 type: string
 *               entityId:
 *                 type: string
 *               entityName:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Activity log created successfully
 */
activityLogRouter.post("/", createActivityLogController);

export default activityLogRouter;
