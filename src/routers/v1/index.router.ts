import express from "express";
import authRouter from "../../modules/auth/auth.router";
import userRouter from "../../modules/user/user.route";
import workspaceRouter from "../../modules/workspace/workspace.route";
import projectRouter from "../../modules/project/project.route";
import boardRouter from "../../modules/board/board.route";
import sprintRouter from "../../modules/sprint/sprint.route";
import roleRouter from "../../modules/role/role.route";
import taskRouter from "../../modules/task/task.route";

const v1Router = express.Router();

v1Router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Gravity API v1",
    version: "1.0.0",
    status: "Running",
    documentation: "/api-docs",
  });
});
v1Router.use("/auth", authRouter);
v1Router.use("/users", userRouter);
v1Router.use("/workspaces", workspaceRouter);
v1Router.use("/projects", projectRouter);
v1Router.use("/boards", boardRouter);
v1Router.use("/sprints", sprintRouter);
v1Router.use("/roles", roleRouter);
v1Router.use("/tasks", taskRouter);

export default v1Router;
