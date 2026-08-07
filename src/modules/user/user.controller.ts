import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { AppResponse } from "../../utils/response/app.response";
import logger from "../../config/logger.config";
import {
  changePasswordService,
  changeProfileService,
  getAllUsersService,
  getCurrentUserService,
} from "./user.service";
import {
  changePasswordSchema,
  changeProfileSchema,
} from "../../validators/auth.validator";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const user = await getCurrentUserService(userId);
    logger.info("Current user fetched successfully");
    AppResponse.success(
      res,
      StatusCodes.OK,
      "User fetched successfully.",
      user,
    );
  },
);

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body,
    );
    await changePasswordService(userId, currentPassword, newPassword);
    logger.info("Password changed successfully");
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Password changed successfully.",
      null,
    );
  },
);

export const changeProfileController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const validatedData = changeProfileSchema.parse(req.body);
    const user = await changeProfileService(userId, validatedData, req.file);
    logger.info("Profile updated successfully.");
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Profile updated successfully.",
      user,
    );
  },
);

export const getAllUsersController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const users = await getAllUsersService();
    AppResponse.success(
      res,
      StatusCodes.OK,
      "Users fetched successfully.",
      users,
    );
  },
);
