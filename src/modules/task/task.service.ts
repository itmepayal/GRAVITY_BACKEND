import { Types } from "mongoose";
import Board from "../../models/board.model";
import Project from "../../models/project.model";
import Sprint from "../../models/sprint.model";
import Task, { IAttachment } from "../../models/task.model";
import User from "../../models/user.model";
import Workspace from "../../models/workspace.model";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../utils/errors/app.error";
import { CreateTaskSchemaType } from "../../validators/task.validator";
import { UPDATABLE_TASK_FIELDS } from "./task.constant";
import { TaskListFilters } from "./task.types";
import { deleteFromCloudinary } from "../../config/cloudinary.config";
import { createActivityLogService } from "../activity-log/activity-log.service";

export const createTaskService = async (
  userId: string,
  data: CreateTaskSchemaType,
) => {
  const workspace = await Workspace.findById(data.workspace);
  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const project = await Project.findOne({
    _id: data.project,
    workspace: data.workspace,
  });

  if (!project) {
    throw new NotFoundError("Project not found in this workspace.");
  }

  const board = await Board.findOne({
    _id: data.board,
    project: data.project,
  });

  if (!board) {
    throw new NotFoundError("Board not found in this project.");
  }

  if (data.sprint) {
    const sprint = await Sprint.findOne({
      _id: data.sprint,
      project: data.project,
    });

    if (!sprint) {
      throw new NotFoundError("Sprint not found.");
    }
  }

  const task = await Task.create({
    ...data,
    createdBy: userId,
  });

  // Automatically record Activity Log
  try {
    await createActivityLogService({
      workspace: data.workspace,
      actor: userId,
      action: "created",
      entityType: "task",
      entityId: task._id,
      entityName: task.title,
      metadata: { priority: task.priority, status: task.status },
    });
  } catch (err) {
    // Non-blocking log failure safety
  }

  return task;
};

export const getAllTasksOfBoardService = async (
  boardId: string,
  filters: TaskListFilters,
) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw new NotFoundError("Board not found.");
  }

  const filter: Record<string, any> = { board: boardId };
  if (filters.status) filter.status = filters.status;
  if (filters.priority) filter.priority = filters.priority;
  if (filters.assignee) filter.assignee = filters.assignee;
  if (filters.team) filter.team = filters.team;
  filter.isArchived = filters.isArchived ?? false;

  const tasks = await Task.find(filter)
    .populate("assignee", "name email avatar")
    .populate("team", "name color avatar")
    .populate("blockedBy", "title status priority")
    .populate("blocks", "title status priority")
    .populate("watchers", "name email avatar")
    .populate("createdBy", "name email avatar")
    .sort({ createdAt: -1 });

  return tasks;
};

export const getTaskByIdService = async (taskId: string) => {
  const task = await Task.findById(taskId)
    .populate("createdBy", "name email avatar")
    .populate("assignee", "name email avatar")
    .populate("team", "name color avatar")
    .populate("blockedBy", "title status priority assignee")
    .populate("blocks", "title status priority assignee")
    .populate("watchers", "name email avatar")
    .populate("board", "name")
    .populate("project", "name")
    .populate("workspace", "name")
    .populate("sprint", "name");

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  return task;
};

export const updateTaskService = async (
  taskId: string,
  data: Record<string, any>,
  userId?: string,
) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  if (data.sprint) {
    const sprint = await Sprint.findOne({
      _id: data.sprint,
      project: task.project,
    });

    if (!sprint) {
      throw new NotFoundError("Sprint not found.");
    }
  }

  const oldStatus = task.status;

  for (const field of UPDATABLE_TASK_FIELDS) {
    if (field in data) {
      (task as any)[field] = data[field];
    }
  }

  if (data.attachments) {
    task.attachments = data.attachments;
  }

  if (data.status === "completed" && !task.completedAt) {
    task.completedAt = new Date();
  }

  if (data.status && data.status !== "completed") {
    task.completedAt = undefined;
  }

  await task.save();

  await task.populate([
    { path: "assignee", select: "name email avatar" },
    { path: "team", select: "name color avatar" },
    { path: "blockedBy", select: "title status priority" },
    { path: "blocks", select: "title status priority" },
    { path: "watchers", select: "name email avatar" },
    { path: "createdBy", select: "name email avatar" },
    { path: "board", select: "name" },
    { path: "project", select: "name" },
    { path: "workspace", select: "name" },
    { path: "sprint", select: "name" },
  ]);

  if (userId) {
    try {
      await createActivityLogService({
        workspace: task.workspace,
        actor: userId,
        action: data.status && data.status !== oldStatus ? "status_changed" : "updated",
        entityType: "task",
        entityId: task._id,
        entityName: task.title,
        metadata: { oldStatus, newStatus: task.status },
      });
    } catch (err) {
      // Non-blocking log safety
    }
  }

  return task;
};

export const wouldCreateCycle = async (
  taskId: Types.ObjectId,
  newBlockerId: Types.ObjectId,
): Promise<boolean> => {
  const visited = new Set<string>();
  const queue = [newBlockerId.toString()];

  while (queue.length) {
    const current = queue.shift()!;
    if (current === taskId.toString()) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const task = await Task.findById(current).select("blockedBy");
    if (task && task.blockedBy) {
      queue.push(...task.blockedBy.map((id) => id.toString()));
    }
  }
  return false;
};

export const addDependencyService = async (
  taskId: string,
  blockerId: string,
  userId?: string,
) => {
  if (taskId === blockerId) {
    throw new BadRequestError("A task cannot depend on itself.");
  }

  const taskA = await Task.findById(taskId);
  const taskB = await Task.findById(blockerId);

  if (!taskA || !taskB) {
    throw new NotFoundError("One or both tasks not found.");
  }

  const taskAObjectId = new Types.ObjectId(taskId);
  const taskBObjectId = new Types.ObjectId(blockerId);

  const isCycle = await wouldCreateCycle(taskAObjectId, taskBObjectId);
  if (isCycle) {
    throw new BadRequestError(
      "Adding this dependency would create a circular dependency loop.",
    );
  }

  await Task.findByIdAndUpdate(taskId, {
    $addToSet: { blockedBy: taskBObjectId },
  });

  await Task.findByIdAndUpdate(blockerId, {
    $addToSet: { blocks: taskAObjectId },
  });

  const updatedTask = await Task.findById(taskId)
    .populate("blockedBy", "title status priority assignee")
    .populate("blocks", "title status priority assignee");

  if (userId) {
    try {
      await createActivityLogService({
        workspace: taskA.workspace,
        actor: userId,
        action: "updated",
        entityType: "task",
        entityId: taskA._id,
        entityName: taskA.title,
        metadata: { blockedByAdded: blockerId },
      });
    } catch (err) {
      // Non-blocking log safety
    }
  }

  return updatedTask;
};

export const removeDependencyService = async (
  taskId: string,
  blockerId: string,
  userId?: string,
) => {
  const taskA = await Task.findById(taskId);
  if (!taskA) {
    throw new NotFoundError("Task not found.");
  }

  const taskAObjectId = new Types.ObjectId(taskId);
  const taskBObjectId = new Types.ObjectId(blockerId);

  await Task.findByIdAndUpdate(taskId, {
    $pull: { blockedBy: taskBObjectId },
  });

  await Task.findByIdAndUpdate(blockerId, {
    $pull: { blocks: taskAObjectId },
  });

  const updatedTask = await Task.findById(taskId)
    .populate("blockedBy", "title status priority assignee")
    .populate("blocks", "title status priority assignee");

  if (userId) {
    try {
      await createActivityLogService({
        workspace: taskA.workspace,
        actor: userId,
        action: "updated",
        entityType: "task",
        entityId: taskA._id,
        entityName: taskA.title,
        metadata: { blockedByRemoved: blockerId },
      });
    } catch (err) {
      // Non-blocking log safety
    }
  }

  return updatedTask;
};

export const deleteTaskService = async (taskId: string, userId?: string) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  if (userId) {
    try {
      await createActivityLogService({
        workspace: task.workspace,
        actor: userId,
        action: "deleted",
        entityType: "task",
        entityId: task._id,
        entityName: task.title,
      });
    } catch (err) {
      // Non-blocking log safety
    }
  }

  return task;
};

export const archiveTaskService = async (
  taskId: string,
  isArchived?: boolean,
) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  task.isArchived = isArchived ?? !task.isArchived;
  await task.save();

  return task;
};

export const moveTaskService = async (
  taskId: string,
  data: { column: string; status?: string },
  userId?: string,
) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const board = await Board.findById(task.board);

  if (!board || !board.columns.includes(data.column)) {
    throw new BadRequestError("Invalid column for this board.");
  }

  task.column = data.column;

  if (data.status) {
    task.status = data.status as typeof task.status;

    if (data.status === "completed" && !task.completedAt) {
      task.completedAt = new Date();
    } else if (data.status !== "completed") {
      task.completedAt = undefined;
    }
  }

  await task.save();

  if (userId) {
    try {
      await createActivityLogService({
        workspace: task.workspace,
        actor: userId,
        action: "status_changed",
        entityType: "task",
        entityId: task._id,
        entityName: task.title,
        metadata: { column: data.column, status: data.status },
      });
    } catch (err) {
      // Non-blocking log safety
    }
  }

  return task;
};

export const assignTaskService = async (
  taskId: string,
  assigneeId?: string | null,
) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  if (assigneeId) {
    const user = await User.findById(assigneeId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const project = await Project.findById(task.project);
    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    const isProjectMember = project.members.some(
      (member) => member.user.toString() === assigneeId,
    );

    if (!isProjectMember) {
      throw new NotFoundError("User is not a member of this project.");
    }

    task.assignee = new Types.ObjectId(assigneeId);
  } else {
    task.assignee = undefined;
  }

  await task.save();
  return task.populate("assignee", "name email");
};

export const addSubTaskService = async (taskId: string, title: string) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  task.subtasks.push({
    title,
    completed: false,
  } as any);

  await task.save();

  return task;
};

export const updateSubTaskService = async (
  taskId: string,
  subtaskId: string,
  data: {
    title?: string;
    completed?: boolean;
  },
) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const subtask = task.subtasks.find(
    (item) => item._id.toString() === subtaskId,
  );

  if (!subtask) {
    throw new NotFoundError("Subtask not found.");
  }

  if (data.title !== undefined) {
    subtask.title = data.title;
  }

  if (data.completed !== undefined) {
    subtask.completed = data.completed;
  }

  await task.save();

  return task;
};

export const deleteSubTaskService = async (
  taskId: string,
  subtaskId: string,
) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const index = task.subtasks.findIndex(
    (item) => item._id.toString() === subtaskId,
  );

  if (index === -1) {
    throw new NotFoundError("Subtask not found.");
  }

  task.subtasks.splice(index, 1);

  await task.save();

  return task;
};

export const addCommentService = async (
  taskId: string,
  userId: string,
  message: string,
) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  task.comments.push({
    user: new Types.ObjectId(userId),
    message,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  await task.save();

  return task.populate("comments.user", "name email");
};

export const updateCommentService = async (
  taskId: string,
  commentId: string,
  userId: string,
  message: string,
) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const comment = task.comments.find(
    (item) => item._id.toString() === commentId,
  );

  if (!comment) {
    throw new NotFoundError("Comment not found.");
  }

  if (comment.user.toString() !== userId) {
    throw new ForbiddenError("You can only edit your own comment.");
  }

  comment.message = message;

  await task.save();

  return task.populate("comments.user", "name email");
};

export const deleteCommentService = async (
  taskId: string,
  commentId: string,
  userId: string,
) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const index = task.comments.findIndex(
    (item) => item._id.toString() === commentId,
  );

  if (index === -1) {
    throw new NotFoundError("Comment not found.");
  }

  if (task.comments[index].user.toString() !== userId) {
    throw new NotFoundError("You can delete only your own comments.");
  }

  task.comments.splice(index, 1);

  await task.save();

  return task.populate("comments.user", "name email");
};

export const addWatcherService = async (taskId: string, userId: string) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  const workspace = await Workspace.findById(task.workspace);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const isWorkspaceMember = workspace.members.some(
    (member) => member.user.toString() === userId,
  );

  if (!isWorkspaceMember) {
    throw new NotFoundError("User is not a member of this workspace.");
  }

  const project = await Project.findById(task.project);

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  const isProjectMember = project.members.some(
    (member) => member.user.toString() === userId,
  );

  if (!isProjectMember) {
    throw new NotFoundError("User is not a member of this project.");
  }

  const alreadyWatcher = task.watchers.some(
    (watcher) => watcher.toString() === userId,
  );

  if (alreadyWatcher) {
    return task.populate("watchers", "name email");
  }

  task.watchers.push(new Types.ObjectId(userId));

  await task.save();

  return task.populate("watchers", "name email");
};

export const removeWatcherService = async (taskId: string, userId: string) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const index = task.watchers.findIndex(
    (watcher) => watcher.toString() === userId,
  );

  if (index === -1) {
    throw new NotFoundError("Watcher not found.");
  }

  task.watchers.splice(index, 1);

  await task.save();

  return task.populate("watchers", "name email");
};

export const addAttachmentService = async (
  taskId: string,
  attachments: IAttachment[],
) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found.");
  }
  task.attachments.push(...attachments);
  await task.save();
  return task.populate("attachments.uploadedBy", "name email");
};

export const removeAttachmentService = async (
  taskId: string,
  attachmentId: string,
) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const index = task.attachments.findIndex(
    (attachment) => attachment._id?.toString() === attachmentId,
  );

  if (index === -1) {
    throw new NotFoundError("Attachment not found.");
  }

  const attachment = task.attachments[index];

  if (attachment.publicId) {
    await deleteFromCloudinary(attachment.publicId);
  }

  task.attachments.splice(index, 1);

  await task.save();

  return task;
};

export const updateActualHoursService = async (
  taskId: string,
  actualHours: number,
) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found.");
  }
  task.actualHours = actualHours;
  await task.save();
  return task;
};

export const getMyTasksService = async (
  userId: string,
  filters: TaskListFilters,
) => {
  const accessibleProjects = await Project.find({
    $or: [{ owner: userId }, { "members.user": userId }],
  }).select("_id");

  const projectIds = accessibleProjects.map((p) => p._id);

  const filter: Record<string, any> = {
    $or: [
      { assignee: userId },
      { createdBy: userId },
      { watchers: userId },
      { project: { $in: projectIds } },
    ],
  };

  if (filters.status) filter.status = filters.status;
  if (filters.priority) filter.priority = filters.priority;
  filter.isArchived = filters.isArchived ?? false;

  const tasks = await Task.find(filter)
    .populate("assignee", "name email avatar")
    .populate("watchers", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("workspace", "name")
    .populate("project", "name")
    .populate("board", "name")
    .sort({ createdAt: -1 });

  return tasks;
};
