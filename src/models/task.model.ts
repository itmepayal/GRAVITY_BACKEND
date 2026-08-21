import { Document, Schema, Types, model } from "mongoose";

export interface IAttachment {
  _id?: Types.ObjectId;
  fileName: string;
  fileUrl: string;
  publicId: string;
  fileType: string;
  fileSize: number;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface IComment {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubTask {
  _id: Types.ObjectId;
  title: string;
  completed: boolean;
}

export interface ITask extends Document {
  title: string;
  description?: string;

  board: Types.ObjectId;
  project: Types.ObjectId;
  workspace: Types.ObjectId;
  sprint?: Types.ObjectId;

  column: string;

  assignee?: Types.ObjectId;
  team?: Types.ObjectId | null;
  watchers: Types.ObjectId[];

  blockedBy: Types.ObjectId[];
  blocks: Types.ObjectId[];

  status:
  | "todo"
  | "in_progress"
  | "in_review"
  | "testing"
  | "completed"
  | "blocked";

  priority: "low" | "medium" | "high" | "urgent";

  tags: string[];
  labels?: Types.ObjectId[];

  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;

  estimatedHours?: number;
  actualHours?: number;

  subtasks: ISubTask[];

  comments: IComment[];

  attachments: IAttachment[];

  isArchived: boolean;

  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    sprint: {
      type: Schema.Types.ObjectId,
      ref: "Sprint",
    },

    column: {
      type: String,
      required: true,
    },

    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    watchers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: [
        "todo",
        "in_progress",
        "in_review",
        "testing",
        "completed",
        "blocked",
      ],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    labels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Label",
      },
    ],

    blockedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    blocks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    startDate: Date,

    dueDate: Date,

    completedAt: Date,

    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    actualHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtasks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
      },
      { timestamps: true },
    ],

    attachments: [
      {
        fileName: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: "",
        },
        fileType: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          required: true,
        },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isArchived: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

taskSchema.index({ workspace: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ board: 1 });
taskSchema.index({ sprint: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ team: 1 });
taskSchema.index({ blockedBy: 1 });
taskSchema.index({ blocks: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ isArchived: 1 });

taskSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const Task = model<ITask>("Task", taskSchema);

export default Task;
