import mongoose, { Schema, Types, Document } from "mongoose";
import crypto from "crypto";

export type InvitationStatus = "pending" | "accepted" | "rejected" | "revoked";
export type InvitationType = "email" | "link";

export interface IInvitation extends Document {
  workspace: Types.ObjectId;
  role: Types.ObjectId;
  invitedBy: Types.ObjectId;
  type: InvitationType;
  email?: string;
  token: string;
  status: InvitationStatus;
  acceptedBy?: Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["email", "link"], required: true },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: function (this: IInvitation) {
        return this.type === "email";
      },
    },

    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(24).toString("hex"),
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "revoked"],
      default: "pending",
    },

    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },

    expiresAt: { type: Date },
  },
  { timestamps: true },
);

InvitationSchema.index(
  { workspace: 1, email: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "email", status: "pending" },
  },
);

export default mongoose.model<IInvitation>("Invitation", InvitationSchema);
