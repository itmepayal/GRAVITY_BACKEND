import express from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import {
  checkBoardAccess,
  requireBoardPermission,
} from "../../middlewares/board.middleware";

import {
  getBoardByIdController,
  updateBoardController,
  deleteBoardController,
  getAllUserBoardsController,
} from "./board.controller";

const boardRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Boards
 *   description: Board management APIs (view, update, delete boards within a project)
 */

/**
 * @swagger
 * /boards:
 *   get:
 *     summary: Get all boards for the authenticated user
 *     description: >
 *       Returns every board belonging to a non-archived project the
 *       authenticated user owns or is a member of, sorted by most
 *       recently updated.
 *     tags:
 *       - Boards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Boards fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardsListResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
boardRouter.get("/", authenticate, getAllUserBoardsController);

/**
 * @swagger
 * /boards/{boardId}:
 *   get:
 *     summary: Get a board with its tasks
 *     description: >
 *       Returns a single board along with its tasks grouped by column.
 *       Requires `board:view` permission on the board.
 *     tags:
 *       - Boards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the board to fetch
 *         example: 665f2a1e8b3f4a0012a3c9e7
 *     responses:
 *       200:
 *         description: Board fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardWithTasksResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: User does not have `board:view` permission on this board
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Board not found, or user does not have access to it
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
boardRouter.get(
  "/:boardId",
  authenticate,
  checkBoardAccess,
  requireBoardPermission("board:view"),
  getBoardByIdController,
);

/**
 * @swagger
 * /boards/{boardId}:
 *   patch:
 *     summary: Update a board
 *     description: >
 *       Partially updates a board's name, description, type, or columns.
 *       Requires `board:update` permission on the board. A column cannot
 *       be removed while tasks are still assigned to it.
 *     tags:
 *       - Boards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the board to update
 *         example: 665f2a1e8b3f4a0012a3c9e7
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBoardRequest'
 *     responses:
 *       200:
 *         description: Board updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardResponse'
 *       400:
 *         description: >
 *           Validation error, or one or more columns being removed still
 *           have tasks assigned to them
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
 *         description: User does not have `board:update` permission on this board
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Board not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
boardRouter.patch(
  "/:boardId",
  authenticate,
  checkBoardAccess,
  requireBoardPermission("board:update"),
  updateBoardController,
);

/**
 * @swagger
 * /boards/{boardId}:
 *   delete:
 *     summary: Delete a board
 *     description: >
 *       Permanently deletes a board and all tasks belonging to it.
 *       Requires `board:delete` permission on the board. This action
 *       cannot be undone.
 *     tags:
 *       - Boards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the board to delete
 *         example: 665f2a1e8b3f4a0012a3c9e7
 *     responses:
 *       200:
 *         description: Board deleted successfully
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
 *         description: User does not have `board:delete` permission on this board
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Board not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
boardRouter.delete(
  "/:boardId",
  authenticate,
  checkBoardAccess,
  requireBoardPermission("board:delete"),
  deleteBoardController,
);

export default boardRouter;
