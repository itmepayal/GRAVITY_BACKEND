import { Types } from "mongoose";
import Milestone, {
  IMilestone,
  MilestoneStatus,
} from "../../models/timeline.model";
import { NotFoundError } from "../../utils/errors/app.error";

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  workspace: string;
  project: string;
  sprint?: string;
  status?: MilestoneStatus;
  startDate: Date;
  dueDate: Date;
  color?: string;
  createdBy: string;
}

export const createMilestoneService = async (
  input: CreateMilestoneInput,
): Promise<IMilestone> => {
  const milestone = await Milestone.create({
    ...input,
    workspace: new Types.ObjectId(input.workspace),
    project: new Types.ObjectId(input.project),
    sprint: input.sprint ? new Types.ObjectId(input.sprint) : undefined,
    createdBy: new Types.ObjectId(input.createdBy),
  });

  return milestone.populate([
    { path: "createdBy", select: "name email avatar" },
    { path: "project", select: "name" },
    { path: "sprint", select: "name" },
  ]);
};

export const getProjectMilestonesService = async (
  projectId: string,
): Promise<IMilestone[]> => {
  return Milestone.find({ project: new Types.ObjectId(projectId) })
    .sort({ startDate: 1 })
    .populate("createdBy", "name email avatar")
    .populate("sprint", "name")
    .populate("linkedTasks", "title status priority");
};

export const updateMilestoneService = async (
  milestoneId: string,
  data: Partial<IMilestone>,
): Promise<IMilestone> => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    throw new NotFoundError("Milestone not found.");
  }

  Object.assign(milestone, data);

  await milestone.save();
  return milestone.populate([
    { path: "createdBy", select: "name email avatar" },
    { path: "sprint", select: "name" },
  ]);
};

export const deleteMilestoneService = async (
  milestoneId: string,
): Promise<void> => {
  const milestone = await Milestone.findByIdAndDelete(milestoneId);
  if (!milestone) {
    throw new NotFoundError("Milestone not found.");
  }
};
