import Board from "../../models/board.model";
import Project from "../../models/project.model";
import Sprint from "../../models/sprint.model";
import Task from "../../models/task.model";
import Workspace from "../../models/workspace.model";
import { NotFoundError } from "../../utils/errors/app.error";
import { CreateTaskSchemaType } from "../../validators/task.validator";
import { UPDATABLE_TASK_FIELDS } from "./task.constant";
import { TaskListFilters } from "./task.types";

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
  filter.isArchived = filters.isArchived ?? false;

  const tasks = await Task.find(filter)
    .populate("assignee", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return tasks;
};

export const getTaskByIdService = async (taskId: string) => {
  const task = await Task.findById(taskId)
    .populate("createdBy", "name email")
    .populate("assignee", "name email")
    .populate("watchers", "name email")
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

  return task;
};

export const deleteTaskService = async (taskId: string) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new NotFoundError("Task not found.");
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
