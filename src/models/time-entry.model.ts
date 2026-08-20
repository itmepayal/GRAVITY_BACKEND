import { Document, Schema, Types, model } from "mongoose";

export interface ITimeEntry extends Document {
  workspace: Types.ObjectId;
  project: Types.ObjectId;
  task: Types.ObjectId;
  user: Types.ObjectId;
  description?: string;
  durationMinutes: number;
  startTime?: Date;
  endTime?: Date;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const timeEntrySchema = new Schema<ITimeEntry>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

timeEntrySchema.index({ user: 1, date: -1 });
timeEntrySchema.index({ task: 1, date: -1 });

timeEntrySchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const TimeEntry = model<ITimeEntry>("TimeEntry", timeEntrySchema);

export default TimeEntry;
