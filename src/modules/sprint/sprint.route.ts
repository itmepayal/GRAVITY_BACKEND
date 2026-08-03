import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { checkSprintAccess } from "../../middlewares/sprint.middleware";
import { requirePermission } from "../../middlewares/project.middleware";
import {
  getSprintByIdController,
  updateSprintController,
  deleteSprintController,
  startSprintController,
  completeSprintController,
  getTasksBySprintController,
} from "./sprint.controller";

const sprintRouter = express.Router();

sprintRouter.get(
  "/:sprintId",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:view"),
  getSprintByIdController,
);

sprintRouter.get(
  "/:sprintId/tasks",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:view"),
  getTasksBySprintController,
);

sprintRouter.patch(
  "/:sprintId",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:update"),
  updateSprintController,
);

sprintRouter.delete(
  "/:sprintId",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:delete"),
  deleteSprintController,
);

sprintRouter.post(
  "/:sprintId/start",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:start"),
  startSprintController,
);

sprintRouter.post(
  "/:sprintId/complete",
  authenticate,
  checkSprintAccess,
  requirePermission("sprint:complete"),
  completeSprintController,
);

export default sprintRouter;
