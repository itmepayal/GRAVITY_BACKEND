import { Types } from "mongoose";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors/app.error";
import Project from "../../models/project.model";
import Role, { IRole } from "../../models/role.model";
import { UpdateRoleInput } from "../../validators/role.validation";
import { roleName, escapeRegex } from "./role.constant";

export const getWorkspaceRolesService = async (
  workspaceId: string,
): Promise<IRole[]> => {
  if (!Types.ObjectId.isValid(workspaceId)) {
    throw new BadRequestError("Invalid workspace id.");
  }

  return await Role.find({
    $or: [{ workspace: null }, { workspace: workspaceId }],
  })
    .sort({
      isSystem: -1,
      name: 1,
    })
    .lean();
};

export const updateWorkspaceRoleService = async (
  workspaceId: string,
  roleId: string,
  data: UpdateRoleInput,
): Promise<IRole> => {
  if (!Types.ObjectId.isValid(workspaceId) || !Types.ObjectId.isValid(roleId)) {
    throw new BadRequestError("Invalid id provided.");
  }

  const role = await Role.findOne({
    _id: roleId,
    workspace: workspaceId,
  });

  if (!role) {
    throw new NotFoundError("Role not found.");
  }

  if (role.isSystem) {
    throw new ForbiddenError("System roles cannot be updated.");
  }

  if (data.name?.trim()) {
    const trimmedName = data.name.trim();
    const normalizedName = trimmedName.toLowerCase();

    if (roleName.includes(normalizedName)) {
      throw new BadRequestError(`"${trimmedName}" is a reserved role name.`);
    }

    const duplicate = await Role.findOne({
      workspace: workspaceId,
      name: {
        $regex: `^${escapeRegex(normalizedName)}$`,
        $options: "i",
      },
      _id: { $ne: roleId },
    });

    if (duplicate) {
      throw new ConflictError(
        `A role named "${trimmedName}" already exists in this workspace.`,
      );
    }

    role.name = trimmedName;
  }

  if (data.permissions) {
    role.permissions = data.permissions;
  }

  await role.save();
  return role;
};

export const deleteWorkspaceRoleService = async (
  workspaceId: string,
  roleId: string,
): Promise<void> => {
  if (!Types.ObjectId.isValid(workspaceId) || !Types.ObjectId.isValid(roleId)) {
    throw new BadRequestError("Invalid id provided.");
  }

  const role = await Role.findOne({
    _id: roleId,
    workspace: workspaceId,
  });

  if (!role) {
    throw new NotFoundError("Role not found.");
  }

  if (role.isSystem) {
    throw new ForbiddenError("System roles cannot be deleted.");
  }

  const inUse = await Project.findOne({
    workspace: workspaceId,
    "members.role": roleId,
  });

  if (inUse) {
    throw new BadRequestError(
      "This role is assigned to one or more project members. Reassign them before deleting.",
    );
  }

  await role.deleteOne();
};
