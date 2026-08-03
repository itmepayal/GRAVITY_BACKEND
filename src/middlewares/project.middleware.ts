import { Request, Response, NextFunction } from "express";
import Project from "../models/project.model";
import Workspace from "../models/workspace.model";
import type { IRole } from "../models/role.model";
import { ForbiddenError, NotFoundError } from "../utils/errors/app.error";

export const checkProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;

    const project = await Project.findById(projectId).populate("members.role");

    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    req.project = project;

    if (project.owner.toString() === userId) {
      req.projectPermissions = ["*"];
      return next();
    }

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) {
      throw new NotFoundError("Workspace not found.");
    }

    if (workspace.owner.toString() === userId) {
      req.projectPermissions = ["*"];
      return next();
    }

    const wsMembership = workspace.members.find(
      (member) => member.user.toString() === userId,
    );

    if (
      wsMembership &&
      (wsMembership.role === "owner" || wsMembership.role === "admin")
    ) {
      req.projectPermissions = ["*"];
      return next();
    }

    const membership = project.members.find(
      (member) => member.user.toString() === userId,
    );

    if (!membership) {
      throw new ForbiddenError("No access to this project.");
    }

    const role = membership.role as unknown as IRole;

    if (!role) {
      throw new ForbiddenError("Assigned role no longer exists.");
    }

    req.projectPermissions = role.permissions;

    return next();
  } catch (error) {
    next(error);
  }
};

export const requirePermission =
  (permission: string) => (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.projectPermissions ?? [];

    if (permissions.includes("*") || permissions.includes(permission)) {
      return next();
    }

    return next(new ForbiddenError(`Missing permission: ${permission}`));
  };
