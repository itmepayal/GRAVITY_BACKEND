import { Document, Schema, Types, model } from "mongoose";

export interface ILabel extends Document {
  name: string;
  color: string;
  workspace: Types.ObjectId;
  project?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const labelSchema = new Schema<ILabel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    color: {
      type: String,
      default: "#6366F1",
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
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

labelSchema.index(
  { workspace: 1, name: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  },
);

labelSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const Label = model<ILabel>("Label", labelSchema);

export default Label;
