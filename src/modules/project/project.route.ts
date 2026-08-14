import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  checkProjectAccess,
  requirePermission,
} from "../../middlewares/project.middleware";
import {
  addProjectMemberController,
  updateProjectMemberRoleController,
  removeProjectMemberController,
  createBoardController,
  listBoardsController,
  createSprintController,
  getProjectSprintsController,
  getProjectTasksController,
} from "./project.controller";

const projectRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs (members, boards, sprints, and tasks within a project)
 */

/**
 * @swagger
 * /projects/{projectId}/members:
 *   post:
 *     summary: Add a member to a project
 *     description: >
 *       Adds an existing workspace member to a project with a given
 *       role. The user must already be a member of the project's
 *       workspace, and the role cannot be the system 'Owner' role.
 *       Requires `member:add` permission on the project.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: 665f0a1e8b3f4a0012a3c9d0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddProjectMemberRequest'
 *     responses:
 *       200:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: >
 *           User is not a workspace member, role does not belong to
 *           this workspace, role is the system 'Owner' role, or user
 *           is already a project member
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
 *         description: User does not have `member:add` permission on this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Project, workspace, user, or role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
projectRouter.post(
  "/:projectId/members",
  authenticate,
  checkProjectAccess,
  requirePermission("member:add"),
  addProjectMemberController,
);

/**
 * @swagger
 * /projects/{projectId}/members/{userId}:
 *   patch:
 *     summary: Update a project member's role
 *     description: >
 *       Changes the role of an existing project member. The project
 *       owner's role cannot be changed. Requires `member:update`
 *       permission on the project.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: 665f0a1e8b3f4a0012a3c9d0
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the member whose role is being updated
 *         example: 665f1c2e8b3f4a0012a3c9d1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectMemberRoleRequest'
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: >
 *           Attempted to change the project owner's role, role does not
 *           belong to this workspace, or role is the system 'Owner' role
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
 *         description: User does not have `member:update` permission on this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Project, workspace, member, or role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
projectRouter.patch(
  "/:projectId/members/:userId",
  authenticate,
  checkProjectAccess,
  requirePermission("member:update"),
  updateProjectMemberRoleController,
);

/**
 * @swagger
 * /projects/{projectId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a project
 *     description: >
 *       Removes a member from a project. The project owner cannot be
 *       removed. Requires `member:remove` permission on the project.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: 665f0a1e8b3f4a0012a3c9d0
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the member to remove
 *         example: 665f1c2e8b3f4a0012a3c9d1
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: Attempted to remove the project owner
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
 *         description: User does not have `member:remove` permission on this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Project or member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
projectRouter.delete(
  "/:projectId/members/:userId",
  authenticate,
  checkProjectAccess,
  requirePermission("member:remove"),
  removeProjectMemberController,
);

/**
 * @swagger
 * /projects/{projectId}/boards:
 *   post:
 *     summary: Create a board in a project
 *     description: Creates a new board within a project. Requires `board:create` permission on the project.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: 665f0a1e8b3f4a0012a3c9d0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBoardRequest'
 *     responses:
 *       201:
 *         description: Board created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardResponse'
 *       400:
 *         description: Validation error
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
 *         description: User does not have `board:create` permission on this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
projectRouter.post(
  "/:projectId/boards",
  authenticate,
  checkProjectAccess,
  requirePermission("board:create"),
  createBoardController,
);

/**
 * @swagger
 * /projects/{projectId}/boards:
 *   get:
 *     summary: List boards in a project
 *     description: Returns all boards belonging to a project, sorted by most recently created. Requires `board:view` permission on the project.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: 665f0a1e8b3f4a0012a3c9d0
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
 *       403:
 *         description: User does not have `board:view` permission on this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
projectRouter.get(
  "/:projectId/boards",
  authenticate,
  checkProjectAccess,
  requirePermission("board:view"),
  listBoardsController,
);

/**
 * @swagger
 * /projects/{projectId}/sprints:
 *   post:
 *     summary: Create a sprint in a project
 *     description: >
 *       Creates a new sprint for a project. Only one active sprint is
 *       allowed per project at a time. `board`, if provided, must belong
 *       to this project; `goal`, if provided, must belong to this
 *       project's workspace. Requires `sprint:create` permission on the
 *       project.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: 665f0a1e8b3f4a0012a3c9d0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSprintRequest'
 *     responses:
 *       201:
 *         description: Sprint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintResponse'
 *       400:
 *         description: >
 *           Invalid sprint dates (start date must be before end date),
 *           or an active sprint already exists for this project
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
 *         description: User does not have `sprint:create` permission on this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Board not found in this project, or goal not found in this workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
projectRouter.post(
  "/:projectId/sprints",
  authenticate,
  checkProjectAccess,
  requirePermission("sprint:create"),
  createSprintController,
);

/**
 * @swagger
 * /projects/{projectId}/sprints:
 *   get:
 *     summary: List sprints in a project
 *     description: Returns all sprints for a project, sorted by most recently created. Requires `sprint:view` permission on the project.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: 665f0a1e8b3f4a0012a3c9d0
 *     responses:
 *       200:
 *         description: Sprints fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintsListResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: User does not have `sprint:view` permission on this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
projectRouter.get(
  "/:projectId/sprints",
  authenticate,
  checkProjectAccess,
  requirePermission("sprint:view"),
  getProjectSprintsController,
);

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   get:
 *     summary: List tasks in a project
 *     description: >
 *       Returns tasks belonging to a project, optionally filtered by
 *       status, priority, assignee, and archived state. Requires
 *       `task:view` permission on the project.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: 665f0a1e8b3f4a0012a3c9d0
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter tasks by status
 *         example: in_progress
 *       - in: query
 *         name: priority
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter tasks by priority
 *         example: high
 *       - in: query
 *         name: assignee
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter tasks by assignee user ID
 *         example: 665f1c2e8b3f4a0012a3c9d1
 *       - in: query
 *         name: isArchived
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter tasks by archived state
 *         example: "false"
 *     responses:
 *       200:
 *         description: Project tasks fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TasksListResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: User does not have `task:view` permission on this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
projectRouter.get(
  "/:projectId/tasks",
  authenticate,
  checkProjectAccess,
  requirePermission("task:view"),
  getProjectTasksController,
);

export default projectRouter;
