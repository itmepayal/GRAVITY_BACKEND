import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import {
  getBoardWithTasksService,
  updateBoardService,
  deleteBoardService,
  getAllUserBoardsService
} from "./board.service";
import { updateBoardSchema } from "../../validators/board.validator";

export const getAllUserBoardsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const boards = await getAllUserBoardsService(userId);
    logger.info(`All boards fetched successfully for user ${userId}.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Boards fetched successfully.",
      boards,
    );
  },
);

export const getBoardByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await getBoardWithTasksService(req.board!);
    logger.info(`Board ${req.board!._id} fetched successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Board fetched successfully.",
      result,
    );
  },
);

export const updateBoardController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { boardId } = req.params;
    const boardData = updateBoardSchema.parse(req.body);
    const board = await updateBoardService(boardId, boardData);
    logger.info(`Board ${boardId} updated successfully.`);
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Board updated successfully.",
      board,
    );
  },
);

export const deleteBoardController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { boardId } = req.params;
    const result = await deleteBoardService(boardId);
    logger.info(`Board ${boardId} deleted successfully.`);
    AppResponse.success(res, StatusCodes.OK, result.message, null);
  },
);
