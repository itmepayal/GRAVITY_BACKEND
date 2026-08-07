import express from "express";
import * as userController from "./user.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/multer.middleware";

const userRouter = express.Router();

// Private
userRouter.get("/", authenticate, userController.getAllUsersController);
userRouter.get("/me", authenticate, userController.getCurrentUserController);
userRouter.post(
  "/change-password",
  authenticate,
  userController.changePasswordController,
);
userRouter.patch(
  "/profile",
  authenticate,
  upload.single("avatar"),
  userController.changeProfileController,
);

export default userRouter;
