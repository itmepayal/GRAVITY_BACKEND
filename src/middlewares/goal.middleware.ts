import { Request, Response, NextFunction } from "express";
import Goal from "../models/goal.model";
import Workspace from "../models/workspace.model";
import { ForbiddenError, NotFoundError } from "../utils/errors/app.error";

export const checkGoalAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { goalId } = req.params;
    const userId = req.user!.id;

    const goal = await Goal.findById(goalId);
    if (!goal) throw new NotFoundError("Goal not found.");

    req.goal = goal;

    const workspace = await Workspace.findById(goal.workspace);
    if (!workspace) throw new NotFoundError("Workspace not found.");

    if (workspace.owner.toString() === userId) {
      req.goalPermissions = ["*"];
      return next();
    }

    const wsMembership = workspace.members.find(
      (member) => member.user.toString() === userId,
    );

    if (!wsMembership) {
      throw new ForbiddenError("No access to this goal.");
    }

    if (wsMembership.role === "admin") {
      req.goalPermissions = ["*"];
      return next();
    }

    if (goal.owner.toString() === userId) {
      req.goalPermissions = [
        "goal:view",
        "goal:update",
        "goal:delete",
        "goal:link",
      ];
      return next();
    }

    req.goalPermissions = ["goal:view"];
    return next();
  } catch (error) {
    next(error);
  }
};

export const requireGoalPermission =
  (permission: string) => (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.goalPermissions ?? [];

    if (permissions.includes("*") || permissions.includes(permission)) {
      return next();
    }

    return next(new ForbiddenError(`Missing permission: ${permission}`));
  };
