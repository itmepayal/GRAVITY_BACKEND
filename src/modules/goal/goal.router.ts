import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { checkWorkspaceAccess } from "../../middlewares/workspace.middleware";
import {
  checkGoalAccess,
  requireGoalPermission,
} from "../../middlewares/goal.middleware";
import {
  createGoalController,
  getWorkspaceGoalsController,
  getGoalByIdController,
  updateGoalController,
  deleteGoalController,
  linkTaskToGoalController,
  unlinkTaskFromGoalController,
} from "./goal.controller";

const goalRouter = express.Router();

goalRouter.post(
  "/workspaces/:workspaceId/goals",
  authenticate,
  checkWorkspaceAccess,
  createGoalController,
);
goalRouter.get(
  "/workspaces/:workspaceId/goals",
  authenticate,
  checkWorkspaceAccess,
  getWorkspaceGoalsController,
);
goalRouter.get(
  "/:goalId",
  authenticate,
  checkGoalAccess,
  requireGoalPermission("goal:view"),
  getGoalByIdController,
);
goalRouter.patch(
  "/:goalId",
  authenticate,
  checkGoalAccess,
  requireGoalPermission("goal:update"),
  updateGoalController,
);
goalRouter.delete(
  "/:goalId",
  authenticate,
  checkGoalAccess,
  requireGoalPermission("goal:delete"),
  deleteGoalController,
);
goalRouter.post(
  "/:goalId/tasks/:taskId",
  authenticate,
  checkGoalAccess,
  requireGoalPermission("goal:link"),
  linkTaskToGoalController,
);
goalRouter.delete(
  "/:goalId/tasks/:taskId",
  authenticate,
  checkGoalAccess,
  requireGoalPermission("goal:link"),
  unlinkTaskFromGoalController,
);

export default goalRouter;
