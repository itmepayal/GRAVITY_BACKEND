import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createMilestoneController,
  deleteMilestoneController,
  getProjectMilestonesController,
  updateMilestoneController,
} from "./milestone.controller";

const milestoneRouter = express.Router();
milestoneRouter.use(authenticate);

/**
 * @swagger
 * /milestones:
 *   post:
 *     tags: [Milestones]
 *     summary: Create a Gantt chart project milestone schedule
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, workspace, project, startDate, dueDate]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               workspace:
 *                 type: string
 *               project:
 *                 type: string
 *               sprint:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [upcoming, in_progress, completed, missed]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               color:
 *                 type: string
 *                 example: "#F59E0B"
 *     responses:
 *       201:
 *         description: Milestone created successfully
 */
milestoneRouter.post("/", createMilestoneController);

/**
 * @swagger
 * /milestones/project/{projectId}:
 *   get:
 *     tags: [Milestones]
 *     summary: Get all Gantt milestones for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched project milestones
 */
milestoneRouter.get("/project/:projectId", getProjectMilestonesController);

/**
 * @swagger
 * /milestones/{id}:
 *   patch:
 *     tags: [Milestones]
 *     summary: Update milestone progress or status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [upcoming, in_progress, completed, missed]
 *               progress:
 *                 type: number
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Milestone updated successfully
 */
milestoneRouter.patch("/:id", updateMilestoneController);

/**
 * @swagger
 * /milestones/{id}:
 *   delete:
 *     tags: [Milestones]
 *     summary: Delete a milestone by ID
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
 *         description: Milestone deleted successfully
 */
milestoneRouter.delete("/:id", deleteMilestoneController);

export default milestoneRouter;
