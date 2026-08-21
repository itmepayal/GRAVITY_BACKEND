import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createCalendarEventController,
  deleteCalendarEventController,
  getWorkspaceCalendarEventsController,
  updateCalendarEventController,
} from "./calendar-event.controller";

const calendarEventRouter = express.Router();
calendarEventRouter.use(authenticate);

/**
 * @swagger
 * /calendar-events:
 *   post:
 *     tags: [Calendar Events]
 *     summary: Create a calendar event, meeting, or reminder
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, workspace, startTime, endTime]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               workspace:
 *                 type: string
 *               project:
 *                 type: string
 *               task:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [meeting, deadline, reminder, milestone, other]
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               isAllDay:
 *                 type: boolean
 *               attendees:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Calendar event created successfully
 */
calendarEventRouter.post("/", createCalendarEventController);

/**
 * @swagger
 * /calendar-events/workspace/{workspaceId}:
 *   get:
 *     tags: [Calendar Events]
 *     summary: Get workspace calendar events with date range filter
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Successfully fetched workspace calendar events
 */
calendarEventRouter.get(
  "/workspace/:workspaceId",
  getWorkspaceCalendarEventsController,
);

/**
 * @swagger
 * /calendar-events/{id}:
 *   patch:
 *     tags: [Calendar Events]
 *     summary: Update a calendar event by ID
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
 *         description: Calendar event updated successfully
 */
calendarEventRouter.patch("/:id", updateCalendarEventController);

/**
 * @swagger
 * /calendar-events/{id}:
 *   delete:
 *     tags: [Calendar Events]
 *     summary: Delete a calendar event by ID
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
 *         description: Calendar event deleted successfully
 */
calendarEventRouter.delete("/:id", deleteCalendarEventController);

export default calendarEventRouter;
