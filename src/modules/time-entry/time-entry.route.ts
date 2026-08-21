import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createTimeEntryController,
  deleteTimeEntryController,
  getWorkspaceTimeEntriesController,
} from "./time-entry.controller";

const timeEntryRouter = express.Router();
timeEntryRouter.use(authenticate);

/**
 * @swagger
 * /time-entries:
 *   post:
 *     tags: [Time Entries]
 *     summary: Log time duration for a task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspace, project, task, durationMinutes]
 *             properties:
 *               workspace:
 *                 type: string
 *               project:
 *                 type: string
 *               task:
 *                 type: string
 *               description:
 *                 type: string
 *               durationMinutes:
 *                 type: number
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Time entry created successfully
 */
timeEntryRouter.post("/", createTimeEntryController);

/**
 * @swagger
 * /time-entries/workspace/{workspaceId}:
 *   get:
 *     tags: [Time Entries]
 *     summary: Get workspace time entries with filters and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
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
 *         description: Successfully fetched workspace time entries
 */
timeEntryRouter.get("/workspace/:workspaceId", getWorkspaceTimeEntriesController);

/**
 * @swagger
 * /time-entries/{id}:
 *   delete:
 *     tags: [Time Entries]
 *     summary: Delete a time entry by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Time entry deleted successfully
 */
timeEntryRouter.delete("/:id", deleteTimeEntryController);

export default timeEntryRouter;
