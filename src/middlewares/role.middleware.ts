import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import Role from "../models/role.model";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../utils/errors/app.error";
import {
  checkWorkspaceAccess,
  requireWorkspaceAdmin,
} from "./workspace.middleware";

export const attachRoleAndCheckAdminAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { roleId, workspaceId } = req.params;

    if (!Types.ObjectId.isValid(roleId)) {
      throw new BadRequestError("Invalid role id.");
    }

    const role = await Role.findById(roleId);

    if (!role) {
      throw new NotFoundError("Role not found.");
    }

    if (!role.workspace || role.workspace.toString() !== workspaceId) {
      throw new NotFoundError("Role not found in this workspace.");
    }

    req.role = role;

    return checkWorkspaceAccess(req, res, (err?: any) => {
      if (err) return next(err);

      return requireWorkspaceAdmin(req, res, (err2?: any) => {
        if (err2) return next(err2);

        if (role.isSystem) {
          return next(
            new ForbiddenError("System roles cannot be modified or deleted."),
          );
        }

        return next();
      });
    });
  } catch (error) {
    next(error);
  }
};
