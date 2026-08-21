import { Types } from "mongoose";
import TimeEntry, { ITimeEntry } from "../../models/time-entry.model";
import Task from "../../models/task.model";
import { NotFoundError } from "../../utils/errors/app.error";
import { createActivityLogService } from "../activity-log/activity-log.service";

export interface CreateTimeEntryInput {
  workspace: string;
  project: string;
  task: string;
  user: string;
  description?: string;
  durationMinutes: number;
  startTime?: Date;
  endTime?: Date;
  date?: Date;
}

export const createTimeEntryService = async (
  input: CreateTimeEntryInput,
): Promise<ITimeEntry> => {
  const task = await Task.findById(input.task);
  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const timeEntry = await TimeEntry.create({
    workspace: new Types.ObjectId(input.workspace),
    project: new Types.ObjectId(input.project),
    task: new Types.ObjectId(input.task),
    user: new Types.ObjectId(input.user),
    description: input.description,
    durationMinutes: input.durationMinutes,
    startTime: input.startTime,
    endTime: input.endTime,
    date: input.date || new Date(),
  });

  // Update actualHours on task
  const additionalHours = input.durationMinutes / 60;
  task.actualHours = (task.actualHours || 0) + additionalHours;
  await task.save();

  // Audit log
  try {
    await createActivityLogService({
      workspace: input.workspace,
      actor: input.user,
      action: "updated",
      entityType: "task",
      entityId: input.task,
      entityName: task.title,
      metadata: { loggedMinutes: input.durationMinutes },
    });
  } catch (err) {
    // Non-blocking log safety
  }

  return timeEntry.populate([
    { path: "user", select: "name email avatar" },
    { path: "task", select: "title status" },
  ]);
};

export const getWorkspaceTimeEntriesService = async (
  workspaceId: string,
  taskId?: string,
  userId?: string,
  page: number = 1,
  limit: number = 20,
) => {
  const query: Record<string, any> = { workspace: new Types.ObjectId(workspaceId) };
  if (taskId) query.task = new Types.ObjectId(taskId);
  if (userId) query.user = new Types.ObjectId(userId);

  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    TimeEntry.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email avatar")
      .populate("task", "title status")
      .populate("project", "name")
      .lean(),
    TimeEntry.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    entries,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const deleteTimeEntryService = async (
  entryId: string,
): Promise<void> => {
  const entry = await TimeEntry.findByIdAndDelete(entryId);
  if (!entry) {
    throw new NotFoundError("Time entry not found.");
  }
};
