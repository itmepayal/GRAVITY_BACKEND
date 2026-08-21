import { Types } from "mongoose";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors/app.error";
import User from "../../models/user.model";
import Project, { IProject } from "../../models/project.model";
import Role from "../../models/role.model";
import Workspace from "../../models/workspace.model";
import Board from "../../models/board.model";
import { CreateSprintInput } from "../../validators/sprint.validator";
import Sprint, { ISprint } from "../../models/sprint.model";
import { GetProjectTasksQuery } from "./project.type";
import Task from "../../models/task.model";
import Goal from "../../models/goal.model";
import { createActivityLogService } from "../activity-log/activity-log.service";
import logger from "../../config/logger.config";

const assertValidObjectIds = (ids: Record<string, string>): void => {
  for (const [label, id] of Object.entries(ids)) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${label}.`);
    }
  }
};

export const addProjectMemberService = async (
  projectId: string,
  userId: string,
  roleId: string,
  actorId?: string,
): Promise<IProject> => {
  assertValidObjectIds({ projectId, userId, roleId });
  if (actorId) assertValidObjectIds({ actorId });

  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  const workspace = await Workspace.findById(project.workspace);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  const isWorkspaceMember =
    workspace.owner.toString() === userId ||
    workspace.members.some((member) => member.user.toString() === userId);

  if (!isWorkspaceMember) {
    throw new BadRequestError(
      "User must be a member of the workspace before joining this project.",
    );
  }

  const role = await Role.findById(roleId);

  if (!role) {
    throw new NotFoundError("Role not found.");
  }

  if (
    role.workspace &&
    role.workspace.toString() !== workspace._id.toString() &&
    !role.isSystem
  ) {
    throw new BadRequestError("Role does not belong to this workspace.");
  }

  if (role.isSystem && role.name.toLowerCase() === "owner") {
    throw new BadRequestError("Owner role cannot be assigned.");
  }

  const alreadyMember =
    project.owner.toString() === userId ||
    project.members.some((member) => member.user.toString() === userId);

  if (alreadyMember) {
    throw new BadRequestError("User is already a member of this project.");
  }

  project.members.push({
    user: new Types.ObjectId(userId),
    role: new Types.ObjectId(roleId),
    joinedAt: new Date(),
  });

  await project.save();

  await project.populate([
    { path: "owner", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
    { path: "members.role" },
  ]);

  if (actorId) {
    try {
      await createActivityLogService({
        workspace: workspace._id,
        actor: actorId,
        action: "updated",
        entityType: "project",
        entityId: project._id,
        entityName: project.name,
        metadata: { addedMember: userId, role: role.name },
      });
    } catch (err) {
      logger.error("Activity log creation failed on project member add:", err);
    }
  }

  return project;
};

export const updateProjectMemberRoleService = async (
  projectId: string,
  userId: string,
  roleId: string,
  actorId?: string,
): Promise<IProject> => {
  assertValidObjectIds({ projectId, userId, roleId });
  if (actorId) assertValidObjectIds({ actorId });

  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  const workspace = await Workspace.findById(project.workspace);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  if (project.owner.toString() === userId) {
    throw new BadRequestError("Project owner's role cannot be changed.");
  }

  const member = project.members.find((m) => m.user.toString() === userId);

  if (!member) {
    throw new NotFoundError("Member not found.");
  }

  const role = await Role.findById(roleId);

  if (!role) {
    throw new NotFoundError("Role not found.");
  }

  if (
    role.workspace &&
    role.workspace.toString() !== workspace._id.toString() &&
    !role.isSystem
  ) {
    throw new BadRequestError("Role does not belong to this workspace.");
  }

  if (role.isSystem && role.name.toLowerCase() === "owner") {
    throw new BadRequestError("Owner role cannot be assigned.");
  }

  member.role = new Types.ObjectId(roleId);

  await project.save();
  await project.populate([
    { path: "owner", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
    { path: "members.role" },
  ]);

  if (actorId) {
    try {
      await createActivityLogService({
        workspace: workspace._id,
        actor: actorId,
        action: "updated",
        entityType: "project",
        entityId: project._id,
        entityName: project.name,
        metadata: { updatedMemberRole: userId, newRole: role.name },
      });
    } catch (err) {
      logger.error("Activity log creation failed on project role update:", err);
    }
  }

  return project;
};

export const removeProjectMemberService = async (
  projectId: string,
  currentUserId: string,
  userId: string,
): Promise<IProject> => {
  assertValidObjectIds({ projectId, currentUserId, userId });

  const project = await Project.findById(projectId).populate("members.role");

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  if (currentUserId === userId) {
    throw new BadRequestError("You cannot remove yourself from the project.");
  }

  if (project.owner.toString() === userId) {
    throw new BadRequestError("Project owner cannot be removed.");
  }

  const isProjectOwner = project.owner.toString() === currentUserId;

  const currentMember = project.members.find(
    (m) => m.user.toString() === currentUserId,
  );

  if (!isProjectOwner && !currentMember) {
    throw new ForbiddenError("You are not a member of this project.");
  }

  const currentRoleName = isProjectOwner
    ? "owner"
    : (currentMember?.role as any)?.name?.toLowerCase() || "member";

  if (!isProjectOwner && currentRoleName !== "admin") {
    throw new ForbiddenError(
      "You do not have permission to remove project members.",
    );
  }

  const targetMember = project.members.find(
    (m) => m.user.toString() === userId,
  );

  if (!targetMember) {
    throw new NotFoundError("Member not found.");
  }

  const targetRoleName = (targetMember.role as any)?.name?.toLowerCase() || "member";

  if (currentRoleName === "admin" && targetRoleName === "admin") {
    throw new ForbiddenError("Admin cannot remove another admin.");
  }

  project.members = project.members.filter((m) => m.user.toString() !== userId);

  await project.save();
  await project.populate([
    { path: "owner", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
    { path: "members.role" },
  ]);

  try {
    await createActivityLogService({
      workspace: project.workspace,
      actor: currentUserId,
      action: "updated",
      entityType: "project",
      entityId: project._id,
      entityName: project.name,
      metadata: { removedMember: userId },
    });
  } catch (err) {
    logger.error("Activity log creation failed on project member remove:", err);
  }

  return project;
};

export const createBoardService = async (
  projectId: string,
  workspaceId: string,
  userId: string,
  data: any,
) => {
  assertValidObjectIds({ projectId, workspaceId, userId });

  const board = await Board.create({
    ...data,
    project: projectId,
    workspace: workspaceId,
    createdBy: userId,
  });
  return board;
};

export const listBoardsService = async (projectId: string) => {
  assertValidObjectIds({ projectId });
  return Board.find({ project: projectId }).sort({ createdAt: -1 });
};

export const createSprintService = async (
  data: CreateSprintInput,
  project: IProject,
  userId: string,
): Promise<ISprint> => {
  assertValidObjectIds({ userId });
  if (data.board) assertValidObjectIds({ board: data.board });
  if (data.goal) assertValidObjectIds({ goal: data.goal });

  const { name, goal, board, startDate, endDate } = data;

  const projectId = project._id.toString();
  const workspaceId = project.workspace.toString();

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new BadRequestError("Invalid sprint dates.");
  }

  if (start >= end) {
    throw new BadRequestError("Start date must be before end date.");
  }

  if (board) {
    const boardExists = await Board.findOne({
      _id: new Types.ObjectId(board),
      workspace: new Types.ObjectId(workspaceId),
      project: new Types.ObjectId(projectId),
    });

    if (!boardExists) {
      throw new NotFoundError("Board not found in this project.");
    }
  }

  if (goal) {
    const goalExists = await Goal.findOne({
      _id: new Types.ObjectId(goal),
      workspace: new Types.ObjectId(workspaceId),
      $or: [
        { project: new Types.ObjectId(projectId) },
        { project: null },
      ],
    });

    if (!goalExists) {
      throw new NotFoundError("Goal not found in this workspace or project.");
    }
  }

  const activeSprint = await Sprint.findOne({
    project: new Types.ObjectId(projectId),
    status: "active",
  });

  if (activeSprint) {
    throw new BadRequestError(
      "An active sprint already exists for this project. Complete it before creating a new one.",
    );
  }

  const sprintData: Partial<ISprint> = {
    name: name.trim(),
    workspace: new Types.ObjectId(workspaceId),
    project: new Types.ObjectId(projectId),
    startDate: start,
    endDate: end,
    createdBy: new Types.ObjectId(userId),
  };

  if (board) {
    sprintData.board = new Types.ObjectId(board);
  }

  if (goal) {
    sprintData.goal = new Types.ObjectId(goal);
  }

  const sprint = await Sprint.create(sprintData);

  return sprint;
};

export const getProjectSprintsService = async (projectId: string) => {
  assertValidObjectIds({ projectId });

  const sprints = await Sprint.find({
    project: projectId,
  })
    .populate("createdBy", "name email")
    .populate("board", "name")
    .sort({ createdAt: -1 });

  return sprints;
};

export const getProjectTasksService = async (
  projectId: string,
  query: GetProjectTasksQuery,
) => {
  assertValidObjectIds({ projectId });
  if (query.assignee) {
    assertValidObjectIds({ assignee: query.assignee });
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  const filter: Record<string, any> = {
    project: project._id,
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.assignee) {
    filter.assignee = new Types.ObjectId(query.assignee);
  }

  if (query.isArchived !== undefined) {
    filter.isArchived = query.isArchived === "true";
  }

  const tasks = await Task.find(filter)
    .populate("assignee", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("watchers", "name email avatar")
    .sort({ createdAt: -1 });

  return tasks;
};
