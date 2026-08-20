import mongoose, { Types } from "mongoose";
import Workspace from "../../models/workspace.model";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors/app.error";
import {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from "../../validators/worksapce.validator";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "../../validators/project.validator";
import Project, { IProject } from "../../models/project.model";
import Role, { IRole } from "../../models/role.model";
import { escapeRegex } from "../../utils/helpers/regex";
import Sprint from "../../models/sprint.model";
import Board from "../../models/board.model";
import Task from "../../models/task.model";
import Goal from "../../models/goal.model";
import Team from "../../models/team.model";
import { CreateRoleInput } from "../../validators/role.validation";
import { createActivityLogService } from "../activity-log/activity-log.service";

const assertValidObjectIds = (ids: Record<string, string>): void => {
  for (const [label, id] of Object.entries(ids)) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${label}.`);
    }
  }
};

const populateWorkspace = (workspace: any) =>
  workspace.populate([
    { path: "owner", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
    { path: "members.role" },
  ]);

const getSystemRoleByName = async (name: string): Promise<IRole> => {
  const normalizedName =
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const role = await Role.findOne({
    name: normalizedName,
    isSystem: true,
    workspace: null,
  });

  if (!role) {
    throw new NotFoundError(`Role "${normalizedName}" not found.`);
  }

  return role;
};

export const getWorkspaceRoleForUser = (
  workspace: any,
  userId: string,
): string => {
  if (!workspace) return "Member";

  const ownerId = workspace.owner?._id
    ? workspace.owner._id.toString()
    : workspace.owner?.toString();

  if (ownerId === userId) {
    return "Owner";
  }

  const member = workspace.members?.find((m: any) => {
    if (!m || !m.user) return false;
    const memberUserId = m.user?._id
      ? m.user._id.toString()
      : m.user?.toString();
    return memberUserId === userId;
  });

  if (!member) return "Member";

  if (member.role && typeof member.role === "object" && "name" in member.role) {
    return member.role.name;
  }

  return "Member";
};

export const formatWorkspaceResponse = (workspace: any, userId: string) => {
  const plainObj =
    typeof workspace.toObject === "function"
      ? workspace.toObject()
      : { ...workspace };
  const role = getWorkspaceRoleForUser(workspace, userId);

  return {
    ...plainObj,
    role,
  };
};

export const createWorkspaceService = async (
  ownerId: string,
  data: CreateWorkspaceInput,
) => {
  assertValidObjectIds({ ownerId });

  const trimmedName = data.name.trim();

  const existingWorkspace = await Workspace.findOne({
    owner: ownerId,
    name: {
      $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
    },
  });

  if (existingWorkspace) {
    throw new BadRequestError("Workspace with this name already exists.");
  }

  const ownerRole = await getSystemRoleByName("Owner");

  const workspace = await Workspace.create({
    name: trimmedName,
    description: data.description,
    color: data.color,
    icon: data.icon,
    isPrivate: data.isPrivate,
    owner: new Types.ObjectId(ownerId),
    members: [
      {
        user: new Types.ObjectId(ownerId),
        role: ownerRole._id,
      },
    ],
  });

  await populateWorkspace(workspace);

  // Automatically record Activity Log
  try {
    await createActivityLogService({
      workspace: workspace._id,
      actor: ownerId,
      action: "created",
      entityType: "workspace",
      entityId: workspace._id,
      entityName: workspace.name,
    });
  } catch (err) {
    // Non-blocking log safety
  }

  return formatWorkspaceResponse(workspace, ownerId);
};

export const getUserWorkspacesService = async (userId: string) => {
  assertValidObjectIds({ userId });

  const workspaces = await Workspace.find({
    $or: [{ owner: userId }, { "members.user": userId }],
  })
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar")
    .populate("members.role")
    .sort({ createdAt: -1 });

  return workspaces.map((workspace) =>
    formatWorkspaceResponse(workspace, userId),
  );
};

export const getWorkspaceByIdService = async (
  workspaceId: string,
  userId: string,
) => {
  assertValidObjectIds({
    workspaceId,
    userId,
  });
  const workspace = await Workspace.findById(new Types.ObjectId(workspaceId))
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar")
    .populate("members.role");

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  return formatWorkspaceResponse(workspace, userId);
};

export const updateWorkspaceService = async (
  workspaceId: string,
  currentUserId: string,
  data: UpdateWorkspaceInput,
) => {
  assertValidObjectIds({ workspaceId, currentUserId });

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  if (data.name?.trim()) {
    const trimmedName = data.name.trim();

    if (trimmedName.toLowerCase() !== workspace.name.toLowerCase()) {
      const existingWorkspace = await Workspace.findOne({
        owner: workspace.owner,
        name: {
          $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
        },
        _id: { $ne: workspaceId },
      });

      if (existingWorkspace) {
        throw new BadRequestError("Workspace with this name already exists.");
      }
    }

    workspace.name = trimmedName;
  }

  if (data.description !== undefined) workspace.description = data.description;
  if (data.color !== undefined) workspace.color = data.color;
  if (data.icon !== undefined) workspace.icon = data.icon;
  if (data.isPrivate !== undefined) workspace.isPrivate = data.isPrivate;

  await workspace.save();
  await populateWorkspace(workspace);

  return formatWorkspaceResponse(workspace, currentUserId);
};

export const deleteWorkspaceService = async (
  workspaceId: string,
): Promise<void> => {
  assertValidObjectIds({ workspaceId });

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const workspace = await Workspace.findById(workspaceId).session(session);

      if (!workspace) {
        throw new NotFoundError("Workspace not found.");
      }

      await Task.deleteMany({ workspace: workspaceId }).session(session);
      await Board.deleteMany({ workspace: workspaceId }).session(session);
      await Sprint.deleteMany({ workspace: workspaceId }).session(session);
      await Goal.deleteMany({
        workspace: workspaceId,
      }).session(session);
      await Team.deleteMany({
        workspace: workspaceId,
      }).session(session);
      await Project.deleteMany({ workspace: workspaceId }).session(session);
      await Role.deleteMany({ workspace: workspaceId }).session(session);
      await Workspace.findByIdAndDelete(workspaceId).session(session);
    });
  } finally {
    await session.endSession();
  }
};
export const updateWorkspaceMemberRoleService = async (
  workspaceId: string,
  currentUserId: string,
  userId: string,
  roleId: string,
) => {
  assertValidObjectIds({ workspaceId, currentUserId, userId, roleId });

  const workspace =
    await Workspace.findById(workspaceId).populate("members.role");

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const member = workspace.members.find((m) => m.user.toString() === userId);

  if (!member) {
    throw new NotFoundError("Member not found.");
  }

  const currentRoleName = (member.role as any)?.name;

  if (currentRoleName?.toLowerCase() === "owner") {
    throw new BadRequestError("Owner role cannot be changed.");
  }

  const newRole = await Role.findOne({
    _id: roleId,
    $or: [{ workspace: null }, { workspace: workspaceId }],
  });

  if (!newRole) {
    throw new NotFoundError("Role not found in this workspace.");
  }

  if (newRole.name.toLowerCase() === "owner") {
    throw new BadRequestError("Cannot assign Owner role to a member.");
  }

  member.role = newRole._id as unknown as Types.ObjectId;

  await workspace.save();
  await populateWorkspace(workspace);

  return formatWorkspaceResponse(workspace, currentUserId);
};

export const removeWorkspaceMemberService = async (
  workspaceId: string,
  currentUserId: string,
  userId: string,
) => {
  assertValidObjectIds({
    workspaceId,
    currentUserId,
    userId,
  });

  if (currentUserId === userId) {
    throw new BadRequestError("You cannot remove yourself from the workspace.");
  }

  const workspace =
    await Workspace.findById(workspaceId).populate("members.role");

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const isOwner = workspace.owner.toString() === currentUserId;

  const currentMember = workspace.members.find(
    (member) => member.user.toString() === currentUserId,
  );

  if (!isOwner && !currentMember) {
    throw new ForbiddenError("You are not a member of this workspace.");
  }

  const currentRoleName = isOwner
    ? "owner"
    : (currentMember?.role as any)?.name?.toLowerCase();

  if (currentRoleName !== "owner" && currentRoleName !== "admin") {
    throw new ForbiddenError(
      "You do not have permission to remove workspace members.",
    );
  }

  const targetMember = workspace.members.find(
    (member) => member.user.toString() === userId,
  );

  if (!targetMember) {
    throw new NotFoundError("Member not found.");
  }

  const targetRoleName = (targetMember.role as any)?.name?.toLowerCase();

  if (targetRoleName === "owner") {
    throw new BadRequestError("Workspace owner cannot be removed.");
  }

  if (currentRoleName === "admin" && targetRoleName === "admin") {
    throw new ForbiddenError("Admin cannot remove another admin.");
  }

  workspace.members = workspace.members.filter(
    (member) => member.user.toString() !== userId,
  );

  await workspace.save();
  await populateWorkspace(workspace);

  return formatWorkspaceResponse(workspace, currentUserId);
};

export const createProjectService = async (
  workspaceId: string,
  ownerId: string,
  data: CreateProjectInput,
): Promise<IProject> => {
  assertValidObjectIds({ workspaceId, ownerId });

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const trimmedName = data.name.trim();

  const exists = await Project.findOne({
    workspace: workspaceId,
    name: {
      $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
    },
  });

  if (exists) {
    throw new BadRequestError(
      "Project with this name already exists in this workspace.",
    );
  }

  const ownerRole = await getSystemRoleByName("Owner");

  const project = await Project.create({
    name: trimmedName,
    description: data.description,
    color: data.color,

    status: data.status,
    progress: data.progress,
    isArchived: data.isArchived,
    archivedAt: data.archivedAt,

    startDate: data.startDate ? new Date(data.startDate) : undefined,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,

    workspace: new Types.ObjectId(workspaceId),
    owner: new Types.ObjectId(ownerId),

    tasks: [],

    members: [
      {
        user: new Types.ObjectId(ownerId),
        role: ownerRole._id,
        joinedAt: new Date(),
      },
    ],
  });

  await project.populate([
    {
      path: "owner",
      select: "name email avatar",
    },
    {
      path: "workspace",
      select: "name color icon",
    },
    {
      path: "members.user",
      select: "name email avatar",
    },
    {
      path: "members.role",
    },
  ]);

  try {
    await createActivityLogService({
      workspace: workspaceId,
      actor: ownerId,
      action: "created",
      entityType: "project",
      entityId: project._id,
      entityName: project.name,
    });
  } catch (err) {
    // Non-blocking log safety
  }

  return project;
};

export const getWorkspaceProjectsService = async (
  workspaceId: string,
  userId: string,
): Promise<any[]> => {
  assertValidObjectIds({ workspaceId, userId });

  const workspace =
    await Workspace.findById(workspaceId).populate("members.role");

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const role = getWorkspaceRoleForUser(workspace, userId);

  const projects = await Project.find({ workspace: workspaceId })
    .populate("owner", "name email avatar")
    .populate("workspace", "name color icon")
    .populate("members.user", "name email avatar")
    .populate("members.role")
    .sort({ createdAt: -1 });

  return projects.map((project) => ({
    ...project.toObject(),
    role,
  }));
};

export const getProjectByIdService = async (
  workspaceId: string,
  projectId: string,
): Promise<IProject> => {
  assertValidObjectIds({ workspaceId, projectId });

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId,
  })
    .populate("owner", "name email avatar")
    .populate("workspace", "name color icon")
    .populate("members.user", "name email avatar")
    .populate("members.role");

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  return project;
};

export const updateProjectService = async (
  workspaceId: string,
  projectId: string,
  data: UpdateProjectInput,
): Promise<IProject> => {
  assertValidObjectIds({ workspaceId, projectId });

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  if (data.name?.trim()) {
    const trimmedName = data.name.trim();

    if (trimmedName.toLowerCase() !== project.name.toLowerCase()) {
      const exists = await Project.findOne({
        workspace: workspaceId,
        name: {
          $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
        },
        _id: { $ne: projectId },
      });

      if (exists) {
        throw new BadRequestError(
          "Project with this name already exists in this workspace.",
        );
      }
    }

    project.name = trimmedName;
  }

  if (data.description !== undefined) {
    project.description = data.description;
  }

  if (data.color !== undefined) {
    project.color = data.color;
  }

  if (data.status !== undefined) {
    project.status = data.status;
  }

  if (data.progress !== undefined) {
    project.progress = data.progress;
  }

  if (data.isArchived !== undefined) {
    project.isArchived = data.isArchived;

    if (data.isArchived) {
      project.archivedAt =
        data.archivedAt !== undefined ? new Date(data.archivedAt) : new Date();
    } else {
      project.archivedAt = undefined;
    }
  } else if (data.archivedAt !== undefined) {
    project.archivedAt = new Date(data.archivedAt);
  }

  if (data.startDate !== undefined) {
    project.startDate = new Date(data.startDate);
  }

  if (data.dueDate !== undefined) {
    project.dueDate = new Date(data.dueDate);
  }

  await project.save();

  return await project.populate([
    {
      path: "owner",
      select: "name email avatar",
    },
    {
      path: "workspace",
      select: "name color icon",
    },
    {
      path: "members.user",
      select: "name email avatar",
    },
    {
      path: "members.role",
    },
    {
      path: "tasks",
    },
  ]);
};

export const deleteProjectService = async (
  workspaceId: string,
  projectId: string,
): Promise<void> => {
  assertValidObjectIds({ workspaceId, projectId });

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const project = await Project.findOne({
        _id: projectId,
        workspace: workspaceId,
      }).session(session);

      if (!project) {
        throw new NotFoundError("Project not found.");
      }

      await Task.deleteMany({
        workspace: workspaceId,
        project: projectId,
      }).session(session);
      await Board.deleteMany({
        workspace: workspaceId,
        project: projectId,
      }).session(session);
      await Sprint.deleteMany({
        workspace: workspaceId,
        project: projectId,
      }).session(session);
      await Goal.deleteMany({
        workspace: workspaceId,
        project: projectId,
      }).session(session);
      await Project.findByIdAndDelete(projectId).session(session);
    });
  } finally {
    await session.endSession();
  }
};

export const getWorkspaceRolesService = async (
  workspaceId: string,
): Promise<IRole[]> => {
  assertValidObjectIds({ workspaceId });

  return await Role.find({
    $or: [{ workspace: null }, { workspace: workspaceId }],
  }).sort({
    isSystem: -1,
    name: 1,
  });
};

export const createWorkspaceRoleService = async (
  workspaceId: string,
  data: CreateRoleInput,
): Promise<IRole> => {
  assertValidObjectIds({ workspaceId });

  const trimmedName = data.name.trim();
  const normalizedName = trimmedName.toLowerCase();

  const reservedNames = ["owner", "admin", "member", "viewer"];

  if (reservedNames.includes(normalizedName)) {
    throw new BadRequestError(
      `"${trimmedName}" is a reserved role name. Please choose a different name.`,
    );
  }

  const existingRole = await Role.findOne({
    workspace: workspaceId,
    name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
  });

  if (existingRole) {
    throw new ConflictError(
      `A role named "${trimmedName}" already exists in this workspace.`,
    );
  }

  const role = await Role.create({
    name: trimmedName,
    workspace: workspaceId,
    permissions: data.permissions,
    isSystem: false,
  });

  return role;
};
