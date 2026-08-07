import mongoose, { Types } from "mongoose";
import Workspace, { IWorkspace } from "../../models/workspace.model";
import {
  BadRequestError,
  ConflictError,
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
import User from "../../models/user.model";
import Project, { IProject } from "../../models/project.model";
import Role, { IRole } from "../../models/role.model";
import { escapeRegex } from "../../utils/helpers/regex";
import Sprint from "../../models/sprint.model";
import Board from "../../models/board.model";
import Task from "../../models/task.model";
import Goal from "../../models/goal.model";
import Team from "../../models/team.model";
import { CreateRoleInput } from "../../validators/role.validation";

const assertValidObjectIds = (ids: Record<string, string>): void => {
  for (const [label, id] of Object.entries(ids)) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${label}.`);
    }
  }
};

export const createWorkspaceService = async (
  ownerId: string,
  data: CreateWorkspaceInput,
): Promise<IWorkspace> => {
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
        role: "owner",
      },
    ],
  });
  return workspace;
};

export const getUserWorkspacesService = async (
  userId: string,
): Promise<IWorkspace[]> => {
  assertValidObjectIds({ userId });

  const workspaces = await Workspace.find({
    $or: [{ owner: userId }, { "members.user": userId }],
  })
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar")
    .sort({ createdAt: -1 });

  return workspaces;
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
    .populate("members.user", "name email avatar");
  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }
  const member = workspace.members.find(
    (member) => member.user._id.toString() === userId,
  );
  const role = member?.role ?? "member";
  return {
    ...workspace.toObject(),
    role,
  };
};

export const updateWorkspaceService = async (
  workspaceId: string,
  data: UpdateWorkspaceInput,
): Promise<IWorkspace> => {
  assertValidObjectIds({ workspaceId });

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
  await workspace.populate([
    { path: "owner", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
  ]);

  return workspace;
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

export const addWorkspaceMemberService = async (
  workspaceId: string,
  userId: string,
  role: "admin" | "member",
): Promise<IWorkspace> => {
  assertValidObjectIds({ workspaceId, userId });

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  const alreadyMember = workspace.members.some(
    (member) => member.user.toString() === userId,
  );

  if (alreadyMember) {
    throw new BadRequestError("User is already a member.");
  }

  workspace.members.push({
    user: new Types.ObjectId(userId),
    role,
    joinedAt: new Date(),
  });

  await workspace.save();
  await workspace.populate([
    { path: "owner", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
  ]);

  return workspace;
};

export const updateWorkspaceMemberRoleService = async (
  workspaceId: string,
  userId: string,
  role: "admin" | "member",
): Promise<IWorkspace> => {
  assertValidObjectIds({ workspaceId, userId });

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const member = workspace.members.find((m) => m.user.toString() === userId);

  if (!member) {
    throw new NotFoundError("Member not found.");
  }

  if (member.role === "owner") {
    throw new BadRequestError("Owner role cannot be changed.");
  }

  member.role = role;

  await workspace.save();
  await workspace.populate([
    { path: "owner", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
  ]);

  return workspace;
};

export const removeWorkspaceMemberService = async (
  workspaceId: string,
  userId: string,
): Promise<IWorkspace> => {
  assertValidObjectIds({ workspaceId, userId });

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const member = workspace.members.find((m) => m.user.toString() === userId);

  if (!member) {
    throw new NotFoundError("Member not found.");
  }

  if (member.role === "owner") {
    throw new BadRequestError("Owner cannot be removed.");
  }

  workspace.members = workspace.members.filter(
    (m) => m.user.toString() !== userId,
  );

  await workspace.save();
  await workspace.populate([
    { path: "owner", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
  ]);

  return workspace;
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

  const ownerRole = await Role.findOne({
    name: "Owner",
    isSystem: true,
    workspace: null,
  });

  if (!ownerRole) {
    throw new NotFoundError("Default Owner role not found.");
  }

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
  ]);
};

export const getWorkspaceProjectsService = async (
  workspaceId: string,
): Promise<IProject[]> => {
  assertValidObjectIds({ workspaceId });

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  return await Project.find({ workspace: workspaceId })
    .populate("owner", "name email avatar")
    .populate("workspace", "name color icon")
    .sort({ createdAt: -1 });
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
