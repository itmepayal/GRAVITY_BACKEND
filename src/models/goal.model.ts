import { Document, Schema, Types, model } from "mongoose";

export interface IGoal extends Document {
  title: string;
  description?: string;

  workspace: Types.ObjectId;
  project?: Types.ObjectId;

  owner: Types.ObjectId;

  status: "not_started" | "in_progress" | "completed" | "at_risk" | "cancelled";

  progress: number;

  targetDate?: Date;
  completedAt?: Date;

  linkedTasks: Types.ObjectId[];

  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
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

    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "at_risk", "cancelled"],
      default: "not_started",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    targetDate: Date,

    completedAt: Date,

    linkedTasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

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

goalSchema.index({ workspace: 1 });
goalSchema.index({ project: 1 });
goalSchema.index({ owner: 1 });
goalSchema.index({ status: 1 });

goalSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const Goal = model<IGoal>("Goal", goalSchema);

export default Goal;
