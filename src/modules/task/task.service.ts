import Board from "../../models/board.model";
import Project from "../../models/project.model";
import Sprint from "../../models/sprint.model";
import Task from "../../models/task.model";
import Workspace from "../../models/workspace.model";
import { NotFoundError } from "../../utils/errors/app.error";
import { CreateTaskSchemaType } from "../../validators/task.validator";

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
