import { Types } from "mongoose";
import Invitation from "../../models/invitation.model";
import Workspace from "../../models/workspace.model";
import Role from "../../models/role.model";
import User from "../../models/user.model";
import { sendEmail } from "../../utils/helpers/send-email";
import { invitationEmailTemplate } from "../../utils/templates/invitation-email";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors/app.error";
import logger from "../../config/logger.config";
import { serverConfig } from "../../config";

const assertValidObjectIds = (ids: Record<string, string>): void => {
  for (const [label, id] of Object.entries(ids)) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${label}.`);
    }
  }
};

const assertCanManageMembers = async (workspaceId: string, userId: string) => {
  const workspace =
    await Workspace.findById(workspaceId).populate("members.role");
  if (!workspace) throw new NotFoundError("Workspace not found.");

  const isOwner = workspace.owner.toString() === userId;
  const member = workspace.members.find((m) => m.user.toString() === userId);
  const roleName = isOwner
    ? "owner"
    : ((member?.role as any)?.name as string | undefined)?.toLowerCase();

  if (roleName !== "owner" && roleName !== "admin") {
    throw new ForbiddenError("You do not have permission to invite members.");
  }

  return workspace;
};

const assertValidRoleForWorkspace = async (
  roleId: string,
  workspaceId: string,
) => {
  const role = await Role.findOne({
    _id: roleId,
    $or: [{ workspace: null }, { workspace: workspaceId }],
  });
  if (!role) throw new NotFoundError("Role not found in this workspace.");
  if (role.name.toLowerCase() === "owner") {
    throw new BadRequestError("Cannot assign Owner role via invitation.");
  }
  return role;
};

export const createEmailInvitationService = async (
  workspaceId: string,
  invitedBy: string,
  email: string,
  roleId: string,
  expiresInDays = 7,
) => {
  assertValidObjectIds({ workspaceId, invitedBy, roleId });

  const normalizedEmail = email.toLowerCase();

  const workspace = await assertCanManageMembers(workspaceId, invitedBy);

  await assertValidRoleForWorkspace(roleId, workspaceId);

  const targetUser = await User.findOne({
    email: normalizedEmail,
  });

  if (!targetUser) {
    throw new NotFoundError("No account found with this email address.");
  }

  const alreadyMember = workspace.members.some(
    (m) => m.user.toString() === targetUser._id.toString(),
  );

  if (alreadyMember) {
    throw new BadRequestError("User is already a member of this workspace.");
  }

  const existingPending = await Invitation.findOne({
    workspace: workspaceId,
    email: normalizedEmail,
    type: "email",
    status: "pending",
  });

  if (existingPending) {
    throw new ConflictError(
      "An active invitation already exists for this email.",
    );
  }

  let invitation = await Invitation.create({
    workspace: workspaceId,
    role: roleId,
    invitedBy,
    type: "email",
    email: normalizedEmail,
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
  });

  const inviter = await User.findById(invitedBy);

  const inviteLink = `${serverConfig.CLIENT_URL}/invite/${invitation.token}`;

  try {
    await sendEmail({
      to: normalizedEmail,
      subject: `You've been invited to join ${workspace.name} on YourApp`,
      html: invitationEmailTemplate(
        inviter?.name ?? "A team member",
        workspace.name,
        inviteLink,
      ),
    });
  } catch (err) {
    logger.error(`Failed to send invitation email to ${normalizedEmail}:`, err);
  }

  return invitation;
};

export const createInviteLinkService = async (
  workspaceId: string,
  invitedBy: string,
  roleId?: string,
  expiresInDays?: number,
) => {
  if (!roleId) {
    const defaultRole = await Role.findOne({
      $or: [{ workspace: null }, { workspace: workspaceId }],
      name: { $regex: /^member$/i },
    });
    if (defaultRole) {
      roleId = defaultRole._id.toString();
    } else {
      const anyRole = await Role.findOne({
        $or: [{ workspace: null }, { workspace: workspaceId }],
      });
      if (anyRole) roleId = anyRole._id.toString();
    }
  }

  assertValidObjectIds({ workspaceId, invitedBy, roleId: roleId! });

  await assertCanManageMembers(workspaceId, invitedBy);
  await assertValidRoleForWorkspace(roleId!, workspaceId);

  const invitation = await Invitation.create({
    workspace: workspaceId,
    role: roleId,
    invitedBy,
    type: "link",
    expiresAt: expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined,
  });

  const inviteLink = `${serverConfig.CLIENT_URL}/invite/${invitation.token}`;

  return { ...invitation.toObject(), inviteLink };
};

export const getInvitationByTokenService = async (token: string) => {
  const invitation = await Invitation.findOne({ token })
    .populate("workspace", "name icon color")
    .populate("role", "name")
    .populate("invitedBy", "name email");

  if (!invitation) throw new NotFoundError("Invitation not found.");

  if (invitation.status === "revoked") {
    throw new BadRequestError("This invitation has been revoked.");
  }

  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    throw new BadRequestError("This invitation has expired.");
  }

  if (invitation.type === "email" && invitation.status !== "pending") {
    throw new BadRequestError(
      `This invitation has already been ${invitation.status}.`,
    );
  }

  return invitation;
};

const addUserToWorkspace = async (
  workspaceId: Types.ObjectId,
  userId: Types.ObjectId,
  roleId: Types.ObjectId,
) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new NotFoundError("Workspace not found.");

  const alreadyMember = workspace.members.some(
    (m) => m.user.toString() === userId.toString(),
  );
  if (alreadyMember) {
    throw new BadRequestError("You are already a member of this workspace.");
  }

  workspace.members.push({ user: userId, role: roleId, joinedAt: new Date() });
  await workspace.save();
  return workspace;
};

export const acceptInvitationService = async (
  token: string,
  userId: string,
) => {
  assertValidObjectIds({ userId });

  const invitation = await Invitation.findOne({ token });
  if (!invitation) throw new NotFoundError("Invitation not found.");
  if (invitation.type !== "email") {
    throw new BadRequestError(
      "This invitation type does not support accept/reject.",
    );
  }
  if (invitation.status !== "pending") {
    throw new BadRequestError(
      `This invitation has already been ${invitation.status}.`,
    );
  }
  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    throw new BadRequestError("This invitation has expired.");
  }

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found.");

  if (user.email.toLowerCase() !== invitation.email) {
    throw new ForbiddenError(
      "This invitation was sent to a different email address.",
    );
  }

  await addUserToWorkspace(
    invitation.workspace,
    user._id as Types.ObjectId,
    invitation.role,
  );

  invitation.status = "accepted";
  invitation.acceptedBy = user._id as Types.ObjectId;
  await invitation.save();

  return invitation;
};

export const rejectInvitationService = async (
  token: string,
  userId: string,
) => {
  const invitation = await Invitation.findOne({ token });
  if (!invitation) throw new NotFoundError("Invitation not found.");
  if (invitation.type !== "email") {
    throw new BadRequestError(
      "This invitation type does not support accept/reject.",
    );
  }
  if (invitation.status !== "pending") {
    throw new BadRequestError(
      `This invitation has already been ${invitation.status}.`,
    );
  }

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found.");

  if (user.email.toLowerCase() !== invitation.email) {
    throw new ForbiddenError(
      "This invitation was sent to a different email address.",
    );
  }

  invitation.status = "rejected";
  await invitation.save();

  return invitation;
};

export const joinViaInviteCodeService = async (
  token: string,
  userId: string,
) => {
  assertValidObjectIds({ userId });

  const invitation = await Invitation.findOne({ token });
  if (!invitation) throw new NotFoundError("Invitation link not found.");
  if (invitation.type !== "link") {
    throw new BadRequestError(
      "This invitation requires accept/reject, not direct join.",
    );
  }
  if (invitation.status === "revoked") {
    throw new BadRequestError("This invite link has been revoked.");
  }
  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    throw new BadRequestError("This invite link has expired.");
  }

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found.");

  const workspace = await addUserToWorkspace(
    invitation.workspace,
    user._id as Types.ObjectId,
    invitation.role,
  );

  return workspace;
};

export const getWorkspaceInvitationsService = async (
  workspaceId: string,
  currentUserId: string,
) => {
  assertValidObjectIds({ workspaceId, currentUserId });
  await assertCanManageMembers(workspaceId, currentUserId);

  return Invitation.find({ workspace: workspaceId, status: "pending" })
    .populate("role", "name")
    .populate("invitedBy", "name email")
    .sort({ createdAt: -1 });
};

export const getMyPendingInvitationsService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found.");

  return Invitation.find({
    type: "email",
    email: user.email.toLowerCase(),
    status: "pending",
  })
    .populate("workspace", "name icon color")
    .populate("role", "name")
    .populate("invitedBy", "name email")
    .sort({ createdAt: -1 });
};

export const revokeInvitationService = async (
  workspaceId: string,
  invitationId: string,
  currentUserId: string,
) => {
  assertValidObjectIds({ workspaceId, invitationId, currentUserId });
  await assertCanManageMembers(workspaceId, currentUserId);

  const invitation = await Invitation.findOne({
    _id: invitationId,
    workspace: workspaceId,
  });
  if (!invitation) throw new NotFoundError("Invitation not found.");

  invitation.status = "revoked";
  await invitation.save();

  return invitation;
};
