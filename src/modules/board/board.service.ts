import mongoose from "mongoose";
import Board, { IBoard } from "../../models/board.model";
import Task from "../../models/task.model";
import Project from "../../models/project.model";
import Sprint from "../../models/sprint.model";
import { BadRequestError, NotFoundError } from "../../utils/errors/app.error";
import { UpdateBoardSchemaType } from "../../validators/board.validator";
import { createActivityLogService } from "../activity-log/activity-log.service";

const findBoardOrThrow = async (boardOrId: IBoard | string): Promise<IBoard> => {
  if (typeof boardOrId !== "string") {
    return boardOrId;
  }

  if (!mongoose.Types.ObjectId.isValid(boardOrId)) {
    throw new BadRequestError("Invalid board ID format.");
  }

  const board = await Board.findById(boardOrId);

  if (!board) {
    throw new NotFoundError("Board not found.");
  }

  return board;
};

export const getAllUserBoardsService = async (userId: string) => {
  const accessibleProjects = await Project.find({
    $or: [{ owner: userId }, { "members.user": userId }],
    isArchived: { $ne: true },
  }).select("_id");

  const projectIds = accessibleProjects.map((project) => project._id);

  const boards = await Board.find({
    project: { $in: projectIds },
  })
    .populate("project", "name")
    .sort({ updatedAt: -1 });

  return boards;
};

export const getBoardWithTasksService = async (board: IBoard) => {
  const tasks = await Task.find({ board: board._id })
    .populate("assignee", "name email avatar")
    .populate("watchers", "name email avatar")
    .populate("createdBy", "name email avatar")
    .sort({ createdAt: 1 });

  const tasksByColumn: Record<string, typeof tasks> = board.columns.reduce(
    (acc, col) => {
      acc[col] = [];
      return acc;
    },
    {} as Record<string, typeof tasks>,
  );

  for (const task of tasks) {
    if (!tasksByColumn[task.column]) {
      tasksByColumn[task.column] = [];
    }
    tasksByColumn[task.column].push(task);
  }

  await board.populate([
    { path: "createdBy", select: "name email avatar" },
    { path: "project", select: "name" },
    { path: "workspace", select: "name color icon" },
  ]);

  return {
    board,
    columns: board.columns.map((column) => ({
      name: column,
      tasks: tasksByColumn[column] || [],
    })),
  };
};

export const updateBoardService = async (
  boardOrId: IBoard | string,
  data: UpdateBoardSchemaType,
  actorId?: string,
): Promise<IBoard> => {
  const board = await findBoardOrThrow(boardOrId);
  const boardId = board._id.toString();

  if (data.name !== undefined) {
    board.name = data.name;
  }

  if (data.description !== undefined) {
    board.description = data.description;
  }

  if (data.type !== undefined) {
    board.type = data.type;
  }

  if (data.columns !== undefined) {
    const removedColumns = board.columns.filter(
      (column) => !data.columns!.includes(column),
    );

    if (removedColumns.length > 0) {
      const affectedTasks = await Task.countDocuments({
        board: boardId,
        column: { $in: removedColumns },
      });

      if (affectedTasks > 0) {
        throw new BadRequestError(
          `Cannot remove column(s): ${removedColumns.join(
            ", ",
          )}. ${affectedTasks} task(s) are still assigned to them.`,
        );
      }
    }

    board.columns = data.columns;
  }

  await board.save();
  await board.populate([
    { path: "createdBy", select: "name email avatar" },
    { path: "project", select: "name" },
    { path: "workspace", select: "name color icon" },
  ]);

  if (actorId) {
    try {
      await createActivityLogService({
        workspace: board.workspace,
        actor: actorId,
        action: "updated",
        entityType: "board",
        entityId: board._id,
        entityName: board.name,
      });
    } catch (err) {
      // Non-blocking activity log safety
    }
  }

  return board;
};

export const deleteBoardService = async (
  boardOrId: IBoard | string,
  actorId?: string,
): Promise<{ message: string }> => {
  const board = await findBoardOrThrow(boardOrId);
  const boardId = board._id;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await Task.deleteMany({ board: boardId }, { session });
      await Sprint.updateMany({ board: boardId }, { $unset: { board: "" } }, { session });
      await board.deleteOne({ session });
    });
  } finally {
    await session.endSession();
  }

  if (actorId) {
    try {
      await createActivityLogService({
        workspace: board.workspace,
        actor: actorId,
        action: "deleted",
        entityType: "board",
        entityId: board._id,
        entityName: board.name,
      });
    } catch (err) {
      // Non-blocking activity log safety
    }
  }

  return { message: "Board deleted successfully." };
};

