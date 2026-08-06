import { Types } from "mongoose";
import Goal, { IGoal } from "../../models/goal.model";
import Workspace from "../../models/workspace.model";
import Project from "../../models/project.model";
import Task from "../../models/task.model";
import Sprint from "../../models/sprint.model";
import { BadRequestError, NotFoundError } from "../../utils/errors/app.error";
import {
  CreateGoalInput,
  UpdateGoalInput,
  GetWorkspaceGoalsQuery,
} from "../../validators/goal.validator";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const GOAL_POPULATE = [
  { path: "owner", select: "name email avatar" },
  { path: "project", select: "name" },
];

export const createGoalService = async (
  workspaceId: string,
  userId: string,
  data: CreateGoalInput,
): Promise<IGoal> => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new NotFoundError("Workspace not found.");

  if (data.project) {
    const project = await Project.findOne({
      _id: data.project,
      workspace: workspaceId,
    });

    if (!project) {
      throw new NotFoundError("Project not found in this workspace.");
    }
  }

  const trimmedTitle = data.title.trim();

  if (!trimmedTitle) {
    throw new BadRequestError("Goal title is required.");
  }

  const escapedTitle = escapeRegex(trimmedTitle);

  const existingGoal = await Goal.findOne({
    workspace: workspaceId,
    title: {
      $regex: `^${escapedTitle}$`,
      $options: "i",
    },
  });

  if (existingGoal) {
    throw new BadRequestError(
      "Goal with this title already exists in this workspace.",
    );
  }

  const goal = await Goal.create({
    title: trimmedTitle,
    description: data.description,
    workspace: new Types.ObjectId(workspaceId),
    project: data.project ? new Types.ObjectId(data.project) : undefined,
    owner: new Types.ObjectId(userId),
    createdBy: new Types.ObjectId(userId),
    targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
  });

  return goal.populate(GOAL_POPULATE);
};

export const getWorkspaceGoalsService = async (
  workspaceId: string,
  query: GetWorkspaceGoalsQuery,
): Promise<IGoal[]> => {
  const filter: Record<string, any> = { workspace: workspaceId };

  if (query.project) filter.project = query.project;
  if (query.status) filter.status = query.status;

  return Goal.find(filter)
    .populate("owner", "name email avatar")
    .populate("project", "name")
    .sort({ createdAt: -1 });
};

export const getGoalByIdService = async (goal: IGoal): Promise<IGoal> => {
  return goal.populate([
    ...GOAL_POPULATE,
    { path: "linkedTasks", select: "title status priority" },
  ]);
};

export const updateGoalService = async (
  goalId: string,
  data: UpdateGoalInput,
): Promise<IGoal> => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new NotFoundError("Goal not found.");

  if (data.title !== undefined) {
    const trimmedTitle = data.title.trim();

    if (!trimmedTitle) {
      throw new BadRequestError("Goal title is required.");
    }

    if (trimmedTitle.toLowerCase() !== goal.title.toLowerCase()) {
      const escapedTitle = escapeRegex(trimmedTitle);

      const existingGoal = await Goal.findOne({
        workspace: goal.workspace,
        title: {
          $regex: `^${escapedTitle}$`,
          $options: "i",
        },
        _id: { $ne: goalId },
      });

      if (existingGoal) {
        throw new BadRequestError(
          "Goal with this title already exists in this workspace.",
        );
      }
    }

    goal.title = trimmedTitle;
  }

  if (data.description !== undefined) goal.description = data.description;
  if (data.targetDate !== undefined)
    goal.targetDate = new Date(data.targetDate);

  if (data.progress !== undefined) {
    goal.progress = data.progress;
  }

  if (data.status !== undefined) {
    goal.status = data.status;
  } else if (goal.progress === 100 && goal.status !== "completed") {
    goal.status = "completed";
  }

  if (goal.status === "completed") {
    goal.progress = 100;
    if (!goal.completedAt) {
      goal.completedAt = new Date();
    }
  } else {
    goal.completedAt = undefined;

    if (goal.progress === 100) {
      goal.progress = 0;
    }
  }

  await goal.save();

  return goal.populate(GOAL_POPULATE);
};

export const deleteGoalService = async (goalId: string): Promise<void> => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new NotFoundError("Goal not found.");

  await Sprint.updateMany({ goal: goal._id }, { $unset: { goal: "" } });

  await goal.deleteOne();
};

export const linkTaskToGoalService = async (
  goalId: string,
  taskId: string,
): Promise<IGoal> => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new NotFoundError("Goal not found.");

  const task = await Task.findOne({
    _id: taskId,
    workspace: goal.workspace,
    ...(goal.project ? { project: goal.project } : {}),
  });

  if (!task) {
    throw new NotFoundError("Task not found in this workspace/project.");
  }

  const alreadyLinked = goal.linkedTasks.some((t) => t.toString() === taskId);
  if (alreadyLinked) {
    throw new BadRequestError("Task is already linked to this goal.");
  }

  goal.linkedTasks.push(new Types.ObjectId(taskId));

  await goal.save();

  return goal.populate([
    ...GOAL_POPULATE,
    { path: "linkedTasks", select: "title status priority" },
  ]);
};

export const unlinkTaskFromGoalService = async (
  goalId: string,
  taskId: string,
): Promise<IGoal> => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new NotFoundError("Goal not found.");

  const index = goal.linkedTasks.findIndex((t) => t.toString() === taskId);

  if (index === -1) {
    throw new NotFoundError("Task is not linked to this goal.");
  }

  goal.linkedTasks.splice(index, 1);

  await goal.save();

  return goal.populate([
    ...GOAL_POPULATE,
    { path: "linkedTasks", select: "title status priority" },
  ]);
};
