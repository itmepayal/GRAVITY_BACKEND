import { Types } from "mongoose";
import Team, { ITeam } from "../../models/team.model";
import Workspace from "../../models/workspace.model";
import User from "../../models/user.model";
import { BadRequestError, NotFoundError } from "../../utils/errors/app.error";
import {
  CreateTeamInput,
  UpdateTeamInput,
} from "../../validators/team.validator";

export const createTeamService = async (
  workspaceId: string,
  createdBy: string,
  data: CreateTeamInput,
) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const isLeadWorkspaceMember =
    workspace.owner.toString() === data.lead ||
    workspace.members.some((member) => member.user.toString() === data.lead);

  if (!isLeadWorkspaceMember) {
    throw new BadRequestError("Team lead must be a member of the workspace.");
  }

  const trimmedName = data.name.trim();

  if (!trimmedName) {
    throw new BadRequestError("Team name is required.");
  }

  const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const existingTeam = await Team.findOne({
    workspace: workspaceId,
    name: {
      $regex: `^${escapedName}$`,
      $options: "i",
    },
  });

  if (existingTeam) {
    throw new BadRequestError(
      "Team with this name already exists in this workspace.",
    );
  }

  const team = await Team.create({
    name: trimmedName,
    description: data.description,
    color: data.color,
    workspace: new Types.ObjectId(workspaceId),
    lead: new Types.ObjectId(data.lead),
    createdBy: new Types.ObjectId(createdBy),
    members: [{ user: new Types.ObjectId(data.lead), joinedAt: new Date() }],
  });

  return team.populate([
    { path: "lead", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
    { path: "createdBy", select: "name email avatar" },
  ]);
};

export const getWorkspaceTeamsService = async (
  workspaceId: string,
): Promise<ITeam[]> => {
  return Team.find({ workspace: workspaceId })
    .populate("lead", "name email avatar")
    .populate("members.user", "name email avatar")
    .sort({ createdAt: -1 });
};

export const getTeamByIdService = async (team: ITeam): Promise<ITeam> => {
  return team.populate([
    { path: "lead", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
    { path: "createdBy", select: "name email avatar" },
  ]);
};

export const updateTeamService = async (
  teamId: string,
  data: UpdateTeamInput,
): Promise<ITeam> => {
  const team = await Team.findById(teamId);
  if (!team) throw new NotFoundError("Team not found.");

  if (data.name?.trim()) {
    const trimmedName = data.name.trim();

    if (!trimmedName) {
      throw new BadRequestError("Team name is required.");
    }

    const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (trimmedName.toLowerCase() !== team.name.toLowerCase()) {
      const existingTeam = await Team.findOne({
        workspace: team.workspace,
        name: {
          $regex: `^${escapedName}$`,
          $options: "i",
        },
        _id: { $ne: teamId },
      });

      if (existingTeam) {
        throw new BadRequestError(
          "Team with this name already exists in this workspace.",
        );
      }
    }

    team.name = trimmedName;
  }

  if (data.description !== undefined) team.description = data.description;
  if (data.color !== undefined) team.color = data.color;

  await team.save();

  return team.populate([
    { path: "lead", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
    { path: "createdBy", select: "name email avatar" },
  ]);
};

export const deleteTeamService = async (teamId: string): Promise<void> => {
  const team = await Team.findById(teamId);
  if (!team) throw new NotFoundError("Team not found.");
  await team.deleteOne();
};

export const addTeamMemberService = async (
  teamId: string,
  userId: string,
): Promise<ITeam> => {
  const team = await Team.findById(teamId);
  if (!team) throw new NotFoundError("Team not found.");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found.");

  const workspace = await Workspace.findById(team.workspace);
  if (!workspace) throw new NotFoundError("Workspace not found.");

  const isWorkspaceMember =
    workspace.owner.toString() === userId ||
    workspace.members.some((member) => member.user.toString() === userId);

  if (!isWorkspaceMember) {
    throw new BadRequestError(
      "User must be a member of the workspace before joining this team.",
    );
  }

  const alreadyMember = team.members.some(
    (member) => member.user.toString() === userId,
  );

  if (alreadyMember) {
    throw new BadRequestError("User is already a member of this team.");
  }

  team.members.push({ user: new Types.ObjectId(userId), joinedAt: new Date() });

  await team.save();

  return team.populate([
    { path: "lead", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
    { path: "createdBy", select: "name email avatar" },
  ]);
};

export const removeTeamMemberService = async (
  teamId: string,
  userId: string,
): Promise<ITeam> => {
  const team = await Team.findById(teamId);
  if (!team) throw new NotFoundError("Team not found.");

  if (team.lead.toString() === userId) {
    throw new BadRequestError(
      "Team lead cannot be removed. Assign a new lead first.",
    );
  }

  const member = team.members.find((m) => m.user.toString() === userId);
  if (!member) throw new NotFoundError("Member not found in this team.");

  team.members = team.members.filter((m) => m.user.toString() !== userId);

  await team.save();

  return team.populate([
    { path: "lead", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
    { path: "createdBy", select: "name email avatar" },
  ]);
};

export const changeTeamLeadService = async (
  teamId: string,
  newLeadId: string,
): Promise<ITeam> => {
  const team = await Team.findById(teamId);
  if (!team) throw new NotFoundError("Team not found.");

  if (team.lead.toString() === newLeadId) {
    throw new BadRequestError("This user is already the team lead.");
  }

  const workspace = await Workspace.findById(team.workspace);
  if (!workspace) throw new NotFoundError("Workspace not found.");

  const isWorkspaceMember =
    workspace.owner.toString() === newLeadId ||
    workspace.members.some((member) => member.user.toString() === newLeadId);

  if (!isWorkspaceMember) {
    throw new BadRequestError("New lead must be a member of the workspace.");
  }

  const isTeamMember = team.members.some(
    (member) => member.user.toString() === newLeadId,
  );

  if (!isTeamMember) {
    team.members.push({
      user: new Types.ObjectId(newLeadId),
      joinedAt: new Date(),
    });
  }

  team.lead = new Types.ObjectId(newLeadId);

  await team.save();

  return team.populate([
    { path: "lead", select: "name email avatar" },
    { path: "members.user", select: "name email avatar" },
    { path: "createdBy", select: "name email avatar" },
  ]);
};
