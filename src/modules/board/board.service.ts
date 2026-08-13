import Board, { IBoard } from "../../models/board.model";
import Task from "../../models/task.model";
import Project from "../../models/project.model";
import { BadRequestError, NotFoundError } from "../../utils/errors/app.error";
import { UpdateBoardSchemaType } from "../../validators/board.validator";

export const getAllUserBoardsService = async (userId: string) => {
  const accessibleProjects = await Project.find({
    $or: [
      { owner: userId },
      { "members.user": userId },
    ],
    isArchived: { $ne: true },
  }).select("_id");

  const projectIds = accessibleProjects.map(
    (project) => project._id,
  );

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

  const tasksByColumn: Record<string, typeof tasks> = {};

  for (const column of board.columns) {
    tasksByColumn[column] = [];
  }

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
  boardId: string,
  data: UpdateBoardSchemaType,
): Promise<IBoard> => {
  const board = await Board.findById(boardId);

  if (!board) {
    throw new NotFoundError("Board not found.");
  }

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

  return board;
};

export const deleteBoardService = async (
  boardId: string,
): Promise<{ message: string }> => {
  const board = await Board.findById(boardId);

  if (!board) {
    throw new NotFoundError("Board not found.");
  }

  await Task.deleteMany({ board: boardId });
  await board.deleteOne();

  return { message: "Board deleted successfully." };
};
