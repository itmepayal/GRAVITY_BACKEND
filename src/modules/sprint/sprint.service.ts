import Board from "../../models/board.model";
import Goal from "../../models/goal.model";
import Sprint from "../../models/sprint.model";
import Task from "../../models/task.model";
import { BadRequestError, NotFoundError } from "../../utils/errors/app.error";
import { UpdateSprintInput } from "../../validators/sprint.validator";
import { createActivityLogService } from "../activity-log/activity-log.service";

export const getSprintByIdService = async (sprintId: string) => {
  const sprint = await Sprint.findById(sprintId)
    .populate("createdBy", "name email")
    .populate("board", "name")
    .populate("goal", "title status progress");

  if (!sprint) {
    throw new NotFoundError("Sprint not found.");
  }

  return sprint;
};

export const updateSprintService = async (
  sprintId: string,
  data: UpdateSprintInput,
  userId?: string,
) => {
  const sprint = await Sprint.findById(sprintId);

  if (!sprint) {
    throw new NotFoundError("Sprint not found.");
  }

  if (sprint.status === "completed") {
    throw new BadRequestError("Cannot update a completed sprint.");
  }

  if (
    sprint.status === "active" &&
    (data.startDate !== undefined || data.board !== undefined)
  ) {
    throw new BadRequestError(
      "Cannot change start date or board of an active sprint.",
    );
  }

  if (data.board) {
    const boardExists = await Board.findOne({
      _id: data.board,
      workspace: sprint.workspace,
      project: sprint.project,
    });

    if (!boardExists) {
      throw new NotFoundError("Board not found in this project.");
    }
  }

  if (data.goal) {
    const goalExists = await Goal.findOne({
      _id: data.goal,
      workspace: sprint.workspace,
      $or: [{ project: sprint.project }, { project: null }],
    });

    if (!goalExists) {
      throw new NotFoundError("Goal not found in this workspace or project.");
    }
  }

  const newStart = data.startDate ?? sprint.startDate;
  const newEnd = data.endDate ?? sprint.endDate;

  if (newEnd <= newStart) {
    throw new BadRequestError("End date must be after start date.");
  }

  Object.assign(sprint, data);

  await sprint.save();

  if (userId) {
    try {
      await createActivityLogService({
        workspace: sprint.workspace,
        actor: userId,
        action: "updated",
        entityType: "sprint",
        entityId: sprint._id,
        entityName: sprint.name,
      });
    } catch (err) {
      // Non-blocking log safety
    }
  }

  return sprint;
};

export const deleteSprintService = async (
  sprintId: string,
  userId?: string,
) => {
  const sprint = await Sprint.findById(sprintId);

  if (!sprint) {
    throw new NotFoundError("Sprint not found.");
  }

  if (sprint.status === "active") {
    throw new BadRequestError(
      "Cannot delete an active sprint. Complete it first.",
    );
  }

  const taskCount = await Task.countDocuments({
    sprint: sprint._id,
  });

  if (taskCount > 0) {
    throw new BadRequestError(
      "Cannot delete a sprint that has tasks. Move or unassign tasks first.",
    );
  }

  await sprint.deleteOne();

  if (userId) {
    try {
      await createActivityLogService({
        workspace: sprint.workspace,
        actor: userId,
        action: "deleted",
        entityType: "sprint",
        entityId: sprint._id,
        entityName: sprint.name,
      });
    } catch (err) {
      // Non-blocking log safety
    }
  }

  return sprint;
};

export const startSprintService = async (sprintId: string, userId?: string) => {
  const sprint = await Sprint.findById(sprintId);
  if (!sprint) {
    throw new NotFoundError("Sprint not found.");
  }
  if (sprint.status !== "planned") {
    throw new BadRequestError(
      `Cannot start sprint from status "${sprint.status}". Only planned sprints can be started.`,
    );
  }
  const activeSprint = await Sprint.findOne({
    project: sprint.project,
    status: "active",
  });
  if (activeSprint) {
    throw new BadRequestError(
      "An active sprint already exists for this project.",
    );
  }
  sprint.status = "active";
  await sprint.save();

  if (userId) {
    try {
      await createActivityLogService({
        workspace: sprint.workspace,
        actor: userId,
        action: "status_changed",
        entityType: "sprint",
        entityId: sprint._id,
        entityName: sprint.name,
        metadata: { status: "active" },
      });
    } catch (err) {
      // Non-blocking log safety
    }
  }

  return sprint;
};

export const completeSprintService = async (sprintId: string, userId?: string) => {
  const sprint = await Sprint.findById(sprintId);

  if (!sprint) {
    throw new NotFoundError("Sprint not found.");
  }

  if (sprint.status !== "active") {
    throw new BadRequestError(
      `Cannot complete sprint from status "${sprint.status}". Only active sprints can be completed.`,
    );
  }

  sprint.status = "completed";
  await sprint.save();

  await Task.updateMany(
    {
      sprint: sprint._id,
      status: { $ne: "completed" },
    },
    {
      $unset: {
        sprint: "",
      },
    },
  );

  if (userId) {
    try {
      await createActivityLogService({
        workspace: sprint.workspace,
        actor: userId,
        action: "status_changed",
        entityType: "sprint",
        entityId: sprint._id,
        entityName: sprint.name,
        metadata: { status: "completed" },
      });
    } catch (err) {
      // Non-blocking log safety
    }
  }

  return sprint;
};

export const getTasksBySprintService = async (sprintId: string) => {
  const sprint = await Sprint.findById(sprintId);

  if (!sprint) {
    throw new NotFoundError("Sprint not found");
  }

  const tasks = await Task.find({
    sprint: sprint._id,
    workspace: sprint.workspace,
    project: sprint.project,
    ...(sprint.board ? { board: sprint.board } : {}),
    isArchived: false,
  })
    .populate("assignee", "name email avatar")
    .populate("watchers", "name email avatar")
    .populate("createdBy", "name email avatar")
    .sort({ createdAt: -1 });

  return {
    sprint,
    tasks,
  };
};
