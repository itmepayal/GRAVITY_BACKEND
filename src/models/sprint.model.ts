import { Document, Schema, Types, model } from "mongoose";

export interface ISprint extends Document {
  name: string;
  workspace: Types.ObjectId;
  project: Types.ObjectId;
  board?: Types.ObjectId;
  goal?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: "planned" | "active" | "completed";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sprintSchema = new Schema<ISprint>(
  {
    name: {
      type: String,
      required: true,
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
      required: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      default: null,
    },
    goal: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["planned", "active", "completed"],
      default: "planned",
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

sprintSchema.index({ project: 1 });
sprintSchema.index({ workspace: 1 });

sprintSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const Sprint = model<ISprint>("Sprint", sprintSchema);
export default Sprint;
