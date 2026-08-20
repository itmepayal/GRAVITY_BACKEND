import { Document, Schema, Types, model } from "mongoose";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed"
  | "assigned"
  | "commented"
  | "member_added"
  | "member_removed";

export type ActivityEntityType =
  | "project"
  | "task"
  | "board"
  | "sprint"
  | "goal"
  | "team"
  | "workspace";

export interface IActivityLog extends Document {
  workspace: Types.ObjectId;
  actor: Types.ObjectId;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: Types.ObjectId;
  entityName?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityName: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

activityLogSchema.index({ workspace: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

activityLogSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default model<IActivityLog>("ActivityLog", activityLogSchema);
