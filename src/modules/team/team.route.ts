import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { checkWorkspaceAccess } from "../../middlewares/workspace.middleware";
import {
  checkTeamAccess,
  requireTeamPermission,
} from "../../middlewares/team.middleware";
import {
  createTeamController,
  getWorkspaceTeamsController,
  getTeamByIdController,
  updateTeamController,
  deleteTeamController,
  addTeamMemberController,
  removeTeamMemberController,
  changeTeamLeadController,
} from "./team.controller";

const teamRouter = express.Router();

/**
 * @swagger
 * /teams/workspaces/{workspaceId}/teams:
 *   post:
 *     tags: [Teams]
 *     summary: Create a new team within a workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeamRequest'
 *     responses:
 *       201:
 *         description: Team created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamResponse'
 *       400:
 *         description: Invalid lead or duplicate team name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Workspace not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
teamRouter.post(
  "/workspaces/:workspaceId/teams",
  authenticate,
  checkWorkspaceAccess,
  createTeamController,
);

/**
 * @swagger
 * /teams/workspaces/{workspaceId}/teams:
 *   get:
 *     tags: [Teams]
 *     summary: Get all teams in a workspace
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
 *         description: Teams fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamsListResponse'
 *       404:
 *         description: Workspace not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
teamRouter.get(
  "/workspaces/:workspaceId/teams",
  authenticate,
  checkWorkspaceAccess,
  getWorkspaceTeamsController,
);

/**
 * @swagger
 * /teams/{teamId}:
 *   get:
 *     tags: [Teams]
 *     summary: Get a team by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamResponse'
 *       404:
 *         description: Team not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
teamRouter.get(
  "/:teamId",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:view"),
  getTeamByIdController,
);

/**
 * @swagger
 * /teams/{teamId}:
 *   patch:
 *     tags: [Teams]
 *     summary: Update a team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTeamRequest'
 *     responses:
 *       200:
 *         description: Team updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamResponse'
 *       400:
 *         description: Duplicate team name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Team not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
teamRouter.patch(
  "/:teamId",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:update"),
  updateTeamController,
);

/**
 * @swagger
 * /teams/{teamId}:
 *   delete:
 *     tags: [Teams]
 *     summary: Delete a team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *       404:
 *         description: Team not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
teamRouter.delete(
  "/:teamId",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:delete"),
  deleteTeamController,
);

/**
 * @swagger
 * /teams/{teamId}/members:
 *   post:
 *     tags: [Teams]
 *     summary: Add a member to a team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTeamMemberRequest'
 *     responses:
 *       200:
 *         description: Member added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamResponse'
 *       400:
 *         description: User not a workspace member, or already on the team.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Team or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
teamRouter.post(
  "/:teamId/members",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:members:add"),
  addTeamMemberController,
);

/**
 * @swagger
 * /teams/{teamId}/members/{userId}:
 *   delete:
 *     tags: [Teams]
 *     summary: Remove a member from a team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
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
 *         description: Member removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamResponse'
 *       400:
 *         description: Cannot remove the team lead.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Team or member not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
teamRouter.delete(
  "/:teamId/members/:userId",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:members:remove"),
  removeTeamMemberController,
);

/**
 * @swagger
 * /teams/{teamId}/lead:
 *   patch:
 *     tags: [Teams]
 *     summary: Change the lead of a team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeTeamLeadRequest'
 *     responses:
 *       200:
 *         description: Team lead changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamResponse'
 *       400:
 *         description: New lead not a workspace member, or already the lead.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Team or workspace not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
teamRouter.patch(
  "/:teamId/lead",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:lead:change"),
  changeTeamLeadController,
);

export default teamRouter;
