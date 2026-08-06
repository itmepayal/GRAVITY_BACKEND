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

teamRouter.post(
  "/workspaces/:workspaceId/teams",
  authenticate,
  checkWorkspaceAccess,
  createTeamController,
);
teamRouter.get(
  "/workspaces/:workspaceId/teams",
  authenticate,
  checkWorkspaceAccess,
  getWorkspaceTeamsController,
);
teamRouter.get(
  "/:teamId",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:view"),
  getTeamByIdController,
);
teamRouter.patch(
  "/:teamId",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:update"),
  updateTeamController,
);
teamRouter.delete(
  "/:teamId",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:delete"),
  deleteTeamController,
);
teamRouter.post(
  "/:teamId/members",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:members:add"),
  addTeamMemberController,
);
teamRouter.delete(
  "/:teamId/members/:userId",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:members:remove"),
  removeTeamMemberController,
);
teamRouter.patch(
  "/:teamId/lead",
  authenticate,
  checkTeamAccess,
  requireTeamPermission("team:lead:change"),
  changeTeamLeadController,
);

export default teamRouter;
