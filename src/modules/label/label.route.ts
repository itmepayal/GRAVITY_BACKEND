import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createLabelController,
  deleteLabelController,
  getWorkspaceLabelsController,
} from "./label.controller";

const labelRouter = express.Router();
labelRouter.use(authenticate);

/**
 * @swagger
 * /labels:
 *   post:
 *     tags: [Labels]
 *     summary: Create a custom workspace categorization label
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, workspace]
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *                 example: "#6366F1"
 *               workspace:
 *                 type: string
 *               project:
 *                 type: string
 *     responses:
 *       201:
 *         description: Label created successfully
 */
labelRouter.post("/", createLabelController);

/**
 * @swagger
 * /labels/workspace/{workspaceId}:
 *   get:
 *     tags: [Labels]
 *     summary: Get all custom labels for a workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched workspace labels
 */
labelRouter.get("/workspace/:workspaceId", getWorkspaceLabelsController);

/**
 * @swagger
 * /labels/{id}:
 *   delete:
 *     tags: [Labels]
 *     summary: Delete a label by ID
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
 *         description: Label deleted successfully
 */
labelRouter.delete("/:id", deleteLabelController);

export default labelRouter;
