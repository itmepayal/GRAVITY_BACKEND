import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/project.middleware";
import { requireBoardPermission } from "../../middlewares/board.middleware";
import {
  checkTaskAccess,
  checkTaskCreateAccess,
} from "../../middlewares/task.middleware";
import { createTaskController, getTaskByIdController } from "./task.controller";
import { upload } from "../../middlewares/multer.middleware";

const taskRouter = express.Router();

taskRouter.post(
  "/",
  authenticate,
  (req, res, next) => {
    console.log("✅ Authenticate Passed");
    next();
  },
  upload.array("attachments", 10),
  (req, res, next) => {
    console.log("📂 Uploaded Files:", req.files);
    console.log("📝 Body:", req.body);
    next();
  },
  checkTaskCreateAccess,
  (req, res, next) => {
    console.log("✅ Task Create Access Passed");
    next();
  },
  requireBoardPermission("task:create"),
  (req, res, next) => {
    console.log("✅ Board Permission Passed");
    next();
  },
  createTaskController,
);

taskRouter.get(
  "/:taskId",
  authenticate,
  checkTaskAccess,
  requirePermission("task:view"),
  getTaskByIdController,
);

export default taskRouter;
