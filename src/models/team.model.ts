import { Document, Schema, Types, model } from "mongoose";

export interface ITeamMember {
  user: Types.ObjectId;
  joinedAt: Date;
}

export interface ITeam extends Document {
  name: string;
  description?: string;

  workspace: Types.ObjectId;

  lead: Types.ObjectId;
  members: ITeamMember[];

  color?: string;

  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
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

    lead: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    color: {
      type: String,
      default: "#6366F1",
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

teamSchema.index({ workspace: 1 });
teamSchema.index({ lead: 1 });
teamSchema.index({ "members.user": 1 });

teamSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const Team = model<ITeam>("Team", teamSchema);
export default Team;
