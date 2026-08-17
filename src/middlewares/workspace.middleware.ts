import { Request, Response, NextFunction } from "express";
import { Document } from "mongoose";
import Workspace, { IWorkspace } from "../models/workspace.model";
import Role, { IRole } from "../models/role.model";
import { ForbiddenError, NotFoundError } from "../utils/errors/app.error";

declare global {
  namespace Express {
    interface Request {
      workspace?: IWorkspace & Document;
      workspaceRole?: "owner" | (IRole & Document);
    }
  }
}

export const checkWorkspaceAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user!.id;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const isOwner = workspace.owner.toString() === userId;

    if (isOwner) {
      req.workspace = workspace;
      req.workspaceRole = "owner";
      return next();
    }

    const member = workspace.members.find(
      (member) => member.user.toString() === userId,
    );

    if (!member) {
      throw new ForbiddenError("You are not a member of this workspace");
    }

    const role = await Role.findById(member.role);

    if (!role) {
      throw new NotFoundError("Workspace role not found");
    }

    if (
      role.workspace &&
      role.workspace.toString() !== workspace._id.toString()
    ) {
      throw new ForbiddenError(
        "Invalid role assigned to this workspace member",
      );
    }

    req.workspace = workspace;
    req.workspaceRole = role;

    next();
  } catch (err) {
    next(err);
  }
};

const roleHasPermission = (
  workspaceRole: "owner" | (IRole & Document) | undefined,
  permission: string,
): boolean => {
  if (!workspaceRole) return false;
  if (workspaceRole === "owner") return true;
  const permissions = workspaceRole.permissions || [];
  return permissions.includes("*") || permissions.includes(permission);
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.workspaceRole) {
        throw new ForbiddenError("Workspace access not verified.");
      }

      if (!roleHasPermission(req.workspaceRole, permission)) {
        throw new ForbiddenError(
          `You do not have permission to perform this action (${permission}).`,
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export const requireWorkspaceAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceRole = req.workspaceRole;

    if (!workspaceRole) {
      throw new ForbiddenError("Workspace access not verified.");
    }

    if (workspaceRole === "owner") {
      return next();
    }

    const isAdmin =
      workspaceRole.name === "Admin" ||
      workspaceRole.name === "Owner" ||
      workspaceRole.permissions?.includes("*");

    if (!isAdmin) {
      throw new ForbiddenError(
        "You need admin or owner privileges to perform this action.",
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const requireWorkspaceOwner = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceRole = req.workspaceRole;

    const isOwner =
      workspaceRole === "owner" ||
      (typeof workspaceRole === "object" && workspaceRole?.name === "Owner");

    if (!isOwner) {
      throw new ForbiddenError(
        "Only the workspace owner can perform this action.",
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};
