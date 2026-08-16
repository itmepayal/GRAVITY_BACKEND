import { Request, Response, NextFunction } from "express";
import Team from "../models/team.model";
import Workspace from "../models/workspace.model";
import Role from "../models/role.model";
import { ForbiddenError, NotFoundError } from "../utils/errors/app.error";

export const checkTeamAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const { teamId } = req.params;
    const userId = req.user!.id;

    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError("Team not found.");
    }

    req.team = team;

    const workspace = await Workspace.findById(team.workspace);

    if (!workspace) {
      throw new NotFoundError("Workspace not found.");
    }

    if (workspace.owner.toString() === userId) {
      req.teamPermissions = ["*"];
      return next();
    }

    const workspaceMember = workspace.members.find(
      (member) => member.user.toString() === userId,
    );

    if (!workspaceMember) {
      throw new ForbiddenError("You are not a member of this workspace.");
    }

    const workspaceRole = await Role.findById(workspaceMember.role);

    const isWorkspaceAdmin =
      workspaceRole?.name === "Admin" ||
      workspaceRole?.name === "Owner" ||
      workspaceRole?.permissions?.includes("*");

    if (isWorkspaceAdmin) {
      req.teamPermissions = ["*"];
      return next();
    }

    if (team.lead.toString() === userId) {
      req.teamPermissions = [
        "team:view",
        "team:update",
        "team:members:add",
        "team:members:remove",
        "team:lead:change",
      ];

      return next();
    }

    const isTeamMember = team.members.some(
      (member) => member.user.toString() === userId,
    );

    if (!isTeamMember) {
      throw new ForbiddenError("You are not a member of this team.");
    }

    req.teamPermissions = ["team:view"];

    return next();
  } catch (error) {
    next(error);
  }
};

export const requireTeamPermission =
  (permission: string) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const permissions = req.teamPermissions ?? [];
    if (permissions.includes("*") || permissions.includes(permission)) {
      return next();
    }
    return next(new ForbiddenError(`Missing permission: ${permission}`));
  };
