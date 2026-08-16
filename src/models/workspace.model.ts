import { Document, Schema, Types, model } from "mongoose";

export interface IWorkspaceMember {
  user: Types.ObjectId;
  role: Types.ObjectId;
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  owner: Types.ObjectId;
  members: IWorkspaceMember[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    color: {
      type: String,
      default: "#6366F1",
      trim: true,
    },

    icon: {
      type: String,
      default: "",
      trim: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    members: {
      type: [workspaceMemberSchema],
      default: [],
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

workspaceSchema.index({ "members.user": 1 });
workspaceSchema.index({ owner: 1 });
workspaceSchema.pre("validate", function (next) {
  const userIds = this.members.map((member) => member.user.toString());

  const uniqueUserIds = new Set(userIds);

  if (userIds.length !== uniqueUserIds.size) {
    return;
  }
});

workspaceSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const Workspace = model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;
