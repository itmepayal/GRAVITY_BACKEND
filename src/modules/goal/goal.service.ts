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
import { createActivityLogService } from "../activity-log/activity-log.service";
import logger from "../../config/logger.config";

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

  try {
    const goal = await Goal.create({
      title: trimmedTitle,
      description: data.description,
      workspace: new Types.ObjectId(workspaceId),
      project: data.project ? new Types.ObjectId(data.project) : undefined,
      owner: new Types.ObjectId(userId),
      createdBy: new Types.ObjectId(userId),
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
    });

    try {
      await createActivityLogService({
        workspace: workspaceId,
        actor: userId,
        action: "created",
        entityType: "goal",
        entityId: goal._id,
        entityName: goal.title,
      });
    } catch (err) {
      logger.error("Activity log creation failed on goal create:", err);
    }

    return goal.populate(GOAL_POPULATE);
  } catch (error: any) {
    if (error.code === 11000) {
      throw new BadRequestError(
        "Goal with this title already exists in this workspace.",
      );
    }
    throw error;
  }
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
  userId?: string,
): Promise<IGoal> => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new NotFoundError("Goal not found.");

  if (
    goal.status === "completed" &&
    data.progress !== undefined &&
    data.progress !== 100 &&
    (data.status === undefined || data.status === "completed")
  ) {
    throw new BadRequestError(
      "Change status away from completed before adjusting progress below 100%.",
    );
  }

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
  if (data.targetDate !== undefined) {
    goal.targetDate = data.targetDate ? new Date(data.targetDate) : undefined;
  }

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
  }

  try {
    await goal.save();
  } catch (error: any) {
    if (error.code === 11000) {
      throw new BadRequestError(
        "Goal with this title already exists in this workspace.",
      );
    }
    throw error;
  }

  if (userId) {
    try {
      await createActivityLogService({
        workspace: goal.workspace,
        actor: userId,
        action: "updated",
        entityType: "goal",
        entityId: goal._id,
        entityName: goal.title,
      });
    } catch (err) {
      logger.error("Activity log creation failed on goal update:", err);
    }
  }

  return goal.populate(GOAL_POPULATE);
};

export const deleteGoalService = async (
  goalId: string,
  userId?: string,
): Promise<void> => {
  const goal = await Goal.findById(goalId);
  if (!goal) {
    throw new NotFoundError("Goal not found.");
  }
  await Sprint.deleteMany({
    goal: goal._id,
  });
  await goal.deleteOne();

  if (userId) {
    try {
      await createActivityLogService({
        workspace: goal.workspace,
        actor: userId,
        action: "deleted",
        entityType: "goal",
        entityId: goal._id,
        entityName: goal.title,
      });
    } catch (err) {
      logger.error("Activity log creation failed on goal delete:", err);
    }
  }
};

export const linkTaskToGoalService = async (
  goalId: string,
  taskId: string,
  userId?: string,
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

  if (userId) {
    try {
      await createActivityLogService({
        workspace: goal.workspace,
        actor: userId,
        action: "updated",
        entityType: "goal",
        entityId: goal._id,
        entityName: goal.title,
        metadata: { linkedTask: taskId },
      });
    } catch (err) {
      logger.error("Activity log creation failed on task link:", err);
    }
  }

  return goal.populate([
    ...GOAL_POPULATE,
    { path: "linkedTasks", select: "title status priority" },
  ]);
};

export const unlinkTaskFromGoalService = async (
  goalId: string,
  taskId: string,
  userId?: string,
): Promise<IGoal> => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new NotFoundError("Goal not found.");

  const index = goal.linkedTasks.findIndex((t) => t.toString() === taskId);

  if (index === -1) {
    throw new NotFoundError("Task is not linked to this goal.");
  }

  goal.linkedTasks.splice(index, 1);

  await goal.save();

  if (userId) {
    try {
      await createActivityLogService({
        workspace: goal.workspace,
        actor: userId,
        action: "updated",
        entityType: "goal",
        entityId: goal._id,
        entityName: goal.title,
        metadata: { unlinkedTask: taskId },
      });
    } catch (err) {
      logger.error("Activity log creation failed on task unlink:", err);
    }
  }

  return goal.populate([
    ...GOAL_POPULATE,
    { path: "linkedTasks", select: "title status priority" },
  ]);
};
