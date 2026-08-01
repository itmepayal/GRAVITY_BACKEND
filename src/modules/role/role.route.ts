import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { attachRoleAndCheckAdminAccess } from "../../middlewares/role.middleware";
import {
  getWorkspaceRolesController,
  updateWorkspaceRoleController,
  deleteWorkspaceRoleController,
} from "./role.controller";

const roleRouter = express.Router();

roleRouter.get("/:workspaceId", authenticate, getWorkspaceRolesController);
roleRouter.patch(
  "/:workspaceId/:roleId",
  authenticate,
  attachRoleAndCheckAdminAccess,
  updateWorkspaceRoleController,
);

roleRouter.delete(
  "/:workspaceId/:roleId",
  authenticate,
  attachRoleAndCheckAdminAccess,
  deleteWorkspaceRoleController,
);

export default roleRouter;
