import { Request, Response, NextFunction } from "express";
import Board from "../models/board.model";
import Project from "../models/project.model";
import Workspace from "../models/workspace.model";
import type { IRole } from "../models/role.model";
import { ForbiddenError, NotFoundError } from "../utils/errors/app.error";

export const checkBoardAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found.");
    }

    const project = await Project.findById(board.project).populate(
      "members.role",
    );
    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    req.board = board;
    req.project = project;

    if (project.owner.toString() === userId) {
      req.boardPermissions = ["*"];
      return next();
    }

    const workspace = await Workspace.findById(project.workspace).populate(
      "members.role",
    );

    if (!workspace) {
      throw new NotFoundError("Workspace not found.");
    }

    if (workspace.owner.toString() === userId) {
      req.boardPermissions = ["*"];
      return next();
    }

    const wsMembership = workspace.members.find(
      (member) => member.user.toString() === userId,
    );

    if (wsMembership) {
      const workspaceRole = wsMembership.role as unknown as IRole;

      const isWorkspaceAdminOrOwner =
        workspaceRole?.name === "Owner" ||
        workspaceRole?.name === "Admin" ||
        workspaceRole?.permissions?.includes("*");

      if (isWorkspaceAdminOrOwner) {
        req.boardPermissions = ["*"];
        return next();
      }
    }

    const membership = project.members.find(
      (member) => member.user.toString() === userId,
    );

    if (!membership) {
      throw new ForbiddenError("No access to this board.");
    }

    const role = membership.role as unknown as IRole;

    if (!role) {
      throw new ForbiddenError("Assigned role no longer exists.");
    }

    req.boardPermissions = role.permissions;
    return next();
  } catch (error) {
    next(error);
  }
};

export const requireBoardPermission =
  (permission: string) => (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.boardPermissions ?? [];
    if (permissions.includes("*") || permissions.includes(permission)) {
      return next();
    }
    return next(new ForbiddenError(`Missing permission: ${permission}`));
  };
