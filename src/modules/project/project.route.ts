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

projectRouter.post(
  "/:projectId/members",
  authenticate,
  checkProjectAccess,
  requirePermission("member:add"),
  addProjectMemberController,
);
projectRouter.patch(
  "/:projectId/members/:userId",
  authenticate,
  checkProjectAccess,
  requirePermission("member:update"),
  updateProjectMemberRoleController,
);
projectRouter.delete(
  "/:projectId/members/:userId",
  authenticate,
  checkProjectAccess,
  requirePermission("member:remove"),
  removeProjectMemberController,
);
projectRouter.post(
  "/:projectId/boards",
  authenticate,
  checkProjectAccess,
  requirePermission("board:create"),
  createBoardController,
);
projectRouter.get(
  "/:projectId/boards",
  authenticate,
  checkProjectAccess,
  requirePermission("board:view"),
  listBoardsController,
);
projectRouter.post(
  "/:projectId/sprints",
  authenticate,
  checkProjectAccess,
  requirePermission("sprint:create"),
  createSprintController,
);
projectRouter.get(
  "/:projectId/sprints",
  authenticate,
  checkProjectAccess,
  requirePermission("sprint:view"),
  getProjectSprintsController,
);
projectRouter.get(
  "/:projectId/tasks",
  authenticate,
  checkProjectAccess,
  requirePermission("task:view"),
  getProjectTasksController,
);

export default projectRouter;
