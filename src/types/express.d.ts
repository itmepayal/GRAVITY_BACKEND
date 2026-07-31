import type { IWorkspace } from "../models/workspace.model";
import type { IProject } from "../models/project.model";
import { JWTPayload } from ".";
import { ISprint } from "../models/sprint.model";
import { IRole } from "../models/role.model";
import { IComment, ITask } from "../models/task.model";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;

      workspace?: IWorkspace;
      workspaceRole?: "owner" | "admin" | "member";
      workspaceId?: string;

      project?: IProject;
      projectPermissions?: string[];
      projectId?: string;

      board?: IBoard;
      boardPermissions?: string[];

      sprint?: ISprint;

      role?: IRole;

      task?: ITask;

      comment?: IComment;
    }
  }
}

export {};
