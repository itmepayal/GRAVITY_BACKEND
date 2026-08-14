import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { attachRoleAndCheckAdminAccess } from "../../middlewares/role.middleware";
import {
  getWorkspaceRolesController,
  updateWorkspaceRoleController,
  deleteWorkspaceRoleController,
} from "./role.controller";
import { checkWorkspaceAccess } from "../../middlewares/workspace.middleware";

const roleRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Workspace role management APIs (list, update, and delete custom roles)
 */

/**
 * @swagger
 * /roles/{workspaceId}:
 *   get:
 *     summary: List roles available in a workspace
 *     description: >
 *       Returns every role usable in a workspace: built-in system roles
 *       (shared across all workspaces) plus any custom roles created for
 *       this workspace, sorted with system roles first and then
 *       alphabetically by name.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the workspace to list roles for
 *         example: 665f0a1e8b3f4a0012a3c9c1
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolesListResponse'
 *       400:
 *         description: Invalid workspace id
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
 */
roleRouter.get(
  "/:workspaceId",
  authenticate,
  checkWorkspaceAccess,
  getWorkspaceRolesController,
);

/**
 * @swagger
 * /roles/{workspaceId}/{roleId}:
 *   patch:
 *     summary: Update a custom workspace role
 *     description: >
 *       Renames and/or updates the permissions of a custom (non-system)
 *       role in a workspace. System roles cannot be updated. The new
 *       name cannot be a reserved role name (owner, admin, member,
 *       viewer) or duplicate an existing role name in the workspace.
 *       Requires workspace admin access.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the workspace the role belongs to
 *         example: 665f0a1e8b3f4a0012a3c9c1
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to update
 *         example: 665f0b1e8b3f4a0012a3c9f0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleRequest'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleResponse'
 *       400:
 *         description: Invalid id provided, or the new name is a reserved role name
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
 *         description: User does not have workspace admin access, or the role is a system role and cannot be updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Role not found in this workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       409:
 *         description: A role with this name already exists in the workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
roleRouter.patch(
  "/:workspaceId/:roleId",
  authenticate,
  attachRoleAndCheckAdminAccess,
  updateWorkspaceRoleController,
);

/**
 * @swagger
 * /roles/{workspaceId}/{roleId}:
 *   delete:
 *     summary: Delete a custom workspace role
 *     description: >
 *       Permanently deletes a custom (non-system) role. System roles
 *       cannot be deleted, and a role currently assigned to one or more
 *       project members cannot be deleted until those members are
 *       reassigned. Requires workspace admin access.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the workspace the role belongs to
 *         example: 665f0a1e8b3f4a0012a3c9c1
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to delete
 *         example: 665f0b1e8b3f4a0012a3c9f0
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *       400:
 *         description: >
 *           Invalid id provided, or the role is still assigned to one
 *           or more project members
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
 *         description: User does not have workspace admin access, or the role is a system role and cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Role not found in this workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
roleRouter.delete(
  "/:workspaceId/:roleId",
  authenticate,
  attachRoleAndCheckAdminAccess,
  deleteWorkspaceRoleController,
);

export default roleRouter;
