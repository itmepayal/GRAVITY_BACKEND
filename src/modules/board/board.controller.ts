import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import logger from "../../config/logger.config";
import { AppResponse } from "../../utils/response/app.response";
import {
  getBoardWithTasksService,
  updateBoardService,
  deleteBoardService,
  getAllUserBoardsService,
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
    const boardData = updateBoardSchema.parse(req.body);
    const userId = req.user!.id;
    const board = await updateBoardService(req.board!, boardData, userId);
    logger.info(`Board ${req.board!._id} updated successfully.`);
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
    const userId = req.user!.id;
    const result = await deleteBoardService(req.board!, userId);
    logger.info(`Board ${req.board!._id} deleted successfully.`);
    AppResponse.success(res, StatusCodes.OK, result.message, null);
  },
);
