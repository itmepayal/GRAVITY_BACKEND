import { Document, Schema, Types, model } from "mongoose";

export type MilestoneStatus = "upcoming" | "in_progress" | "completed" | "missed";

export interface IMilestone extends Document {
    title: string;
    description?: string;

    workspace: Types.ObjectId;
    project: Types.ObjectId;
    sprint?: Types.ObjectId;

    status: MilestoneStatus;

    startDate: Date;
    dueDate: Date;
    completedAt?: Date;

    linkedTasks: Types.ObjectId[];
    progress: number;

    color?: string;

    createdBy: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
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
            required: true,
        },

        sprint: {
            type: Schema.Types.ObjectId,
            ref: "Sprint",
            default: null,
        },

        status: {
            type: String,
            enum: ["upcoming", "in_progress", "completed", "missed"],
            default: "upcoming",
        },

        startDate: {
            type: Date,
            required: true,
        },

        dueDate: {
            type: Date,
            required: true,
        },

        completedAt: {
            type: Date,
        },

        linkedTasks: [
            {
                type: Schema.Types.ObjectId,
                ref: "Task",
            },
        ],

        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        color: {
            type: String,
            default: "#F59E0B",
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

milestoneSchema.index({ workspace: 1 });
milestoneSchema.index({ project: 1 });
milestoneSchema.index({ sprint: 1 });
milestoneSchema.index({ dueDate: 1 });

milestoneSchema.set("toJSON", {
    transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
    },
});

const Milestone = model<IMilestone>("Milestone", milestoneSchema);

export default Milestone;