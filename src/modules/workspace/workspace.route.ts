import express from "express";
import {
  createWorkspaceController,
  getUserWorkspacesController,
  getWorkspaceByIdController,
  updateWorkspaceController,
  deleteWorkspaceController,
  updateWorkspaceMemberRoleController,
  removeWorkspaceMemberController,
  createProjectController,
  getWorkspaceProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
  getWorkspaceRolesController,
  createWorkspaceRoleController,
} from "./workspace.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  checkWorkspaceAccess,
  requirePermission,
  requireWorkspaceOwner,
} from "../../middlewares/workspace.middleware";

const workspaceRouter = express.Router();

/**
 * @swagger
 * /workspaces:
 *   post:
 *     tags: [Workspaces]
 *     summary: Create a new workspace
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkspaceRequest'
 *     responses:
 *       201:
 *         description: Workspace created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceResponse'
 *       400:
 *         description: Workspace with this name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
workspaceRouter.post("/", authenticate, createWorkspaceController);

/**
 * @swagger
 * /workspaces:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get all workspaces the current user owns or is a member of
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workspaces fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspacesListResponse'
 */
workspaceRouter.get("/", authenticate, getUserWorkspacesController);

/**
 * @swagger
 * /workspaces/{workspaceId}:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get a workspace by ID
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
 *         description: Workspace fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceResponse'
 *       404:
 *         description: Workspace not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
workspaceRouter.get(
  "/:workspaceId",
  authenticate,
  checkWorkspaceAccess,
  getWorkspaceByIdController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}:
 *   patch:
 *     tags: [Workspaces]
 *     summary: Update a workspace (requires "workspace:update" permission)
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
 *             $ref: '#/components/schemas/UpdateWorkspaceRequest'
 *     responses:
 *       200:
 *         description: Workspace updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceResponse'
 *       400:
 *         description: Workspace with this name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You do not have permission to perform this action.
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
workspaceRouter.patch(
  "/:workspaceId",
  authenticate,
  checkWorkspaceAccess,
  requirePermission("workspace:update"),
  updateWorkspaceController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}:
 *   delete:
 *     tags: [Workspaces]
 *     summary: Delete a workspace and all its related data (owner only)
 *     description: Cascades to delete all tasks, boards, sprints, goals, teams, projects, and roles under this workspace.
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
 *         description: Workspace deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *       403:
 *         description: Only the workspace owner can perform this action.
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
workspaceRouter.delete(
  "/:workspaceId",
  authenticate,
  checkWorkspaceAccess,
  requireWorkspaceOwner,
  deleteWorkspaceController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}/members/{userId}:
 *   patch:
 *     tags: [Workspaces]
 *     summary: Update a member's role in a workspace (requires "member:update" permission)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkspaceMemberRoleRequest'
 *     responses:
 *       200:
 *         description: Member role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceResponse'
 *       400:
 *         description: Owner role cannot be changed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You do not have permission to perform this action.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Workspace, member, or role not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
workspaceRouter.patch(
  "/:workspaceId/members/:userId",
  authenticate,
  checkWorkspaceAccess,
  requirePermission("member:update"),
  updateWorkspaceMemberRoleController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}/members/{userId}:
 *   delete:
 *     tags: [Workspaces]
 *     summary: Remove a member from a workspace (requires "member:remove" permission)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
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
 *               $ref: '#/components/schemas/WorkspaceResponse'
 *       400:
 *         description: Owner cannot be removed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You do not have permission to perform this action.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Workspace or member not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
workspaceRouter.delete(
  "/:workspaceId/members/:userId",
  authenticate,
  checkWorkspaceAccess,
  requirePermission("member:remove"),
  removeWorkspaceMemberController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}/projects:
 *   post:
 *     tags: [Workspaces]
 *     summary: Create a project within a workspace (requires "project:create" permission)
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
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: Project with this name already exists in this workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You do not have permission to perform this action.
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
workspaceRouter.post(
  "/:workspaceId/projects",
  authenticate,
  checkWorkspaceAccess,
  requirePermission("project:create"),
  createProjectController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}/projects:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get all projects in a workspace
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
 *         description: Projects fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectsListResponse'
 *       404:
 *         description: Workspace not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
workspaceRouter.get(
  "/:workspaceId/projects",
  authenticate,
  checkWorkspaceAccess,
  getWorkspaceProjectsController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}/projects/{projectId}:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get a project by ID within a workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       404:
 *         description: Project not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
workspaceRouter.get(
  "/:workspaceId/projects/:projectId",
  authenticate,
  checkWorkspaceAccess,
  getProjectByIdController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}/projects/{projectId}:
 *   patch:
 *     tags: [Workspaces]
 *     summary: Update a project (requires "project:update" permission)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: Project with this name already exists in this workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You do not have permission to perform this action.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Project not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
workspaceRouter.patch(
  "/:workspaceId/projects/:projectId",
  authenticate,
  checkWorkspaceAccess,
  requirePermission("project:update"),
  updateProjectController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}/projects/{projectId}:
 *   delete:
 *     tags: [Workspaces]
 *     summary: Delete a project and its related data (requires "project:delete" permission)
 *     description: Cascades to delete all tasks, boards, sprints, and goals under this project.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *       403:
 *         description: You do not have permission to perform this action.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Project not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
workspaceRouter.delete(
  "/:workspaceId/projects/:projectId",
  authenticate,
  checkWorkspaceAccess,
  requirePermission("project:delete"),
  deleteProjectController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}/roles:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get all roles available to a workspace (system + custom)
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
 *         description: Workspace roles fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolesListResponse'
 */
workspaceRouter.get(
  "/:workspaceId/roles",
  authenticate,
  checkWorkspaceAccess,
  getWorkspaceRolesController,
);

/**
 * @swagger
 * /workspaces/{workspaceId}/roles:
 *   post:
 *     tags: [Workspaces]
 *     summary: Create a custom role in a workspace (requires "member:add" permission)
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
 *             $ref: '#/components/schemas/CreateRoleRequest'
 *     responses:
 *       201:
 *         description: Role created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleResponse'
 *       400:
 *         description: Reserved role name used.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: You do not have permission to perform this action.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       409:
 *         description: A role with this name already exists in this workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
workspaceRouter.post(
  "/:workspaceId/roles",
  authenticate,
  checkWorkspaceAccess,
  requirePermission("role:create"),
  requirePermission("member:add"),
  createWorkspaceRoleController,
);

export default workspaceRouter;
