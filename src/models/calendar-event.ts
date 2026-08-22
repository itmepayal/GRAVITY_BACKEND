import { Document, Schema, Types, model } from "mongoose";

export type EventType =
  | "meeting"
  | "deadline"
  | "reminder"
  | "milestone"
  | "other";

export type EventStatus = "scheduled" | "cancelled" | "completed";

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;

  workspace: Types.ObjectId;
  project?: Types.ObjectId;
  task?: Types.ObjectId;

  type: EventType;
  status: EventStatus;

  startTime: Date;
  endTime: Date;
  isAllDay: boolean;

  attendees: Types.ObjectId[];
  location?: string;
  color?: string;

  reminderMinutesBefore?: number;

  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const calendarEventSchema = new Schema<ICalendarEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
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

    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    type: {
      type: String,
      enum: ["meeting", "deadline", "reminder", "milestone", "other"],
      default: "other",
    },

    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    isAllDay: {
      type: Boolean,
      default: false,
    },

    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    color: {
      type: String,
      default: "#6366F1",
      validate: {
        validator: (v: string) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(v),
        message: "color must be a valid hex code (e.g. #6366F1)",
      },
    },

    reminderMinutesBefore: {
      type: Number,
      default: 10,
      min: 0,
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

calendarEventSchema.pre("validate", function (next) {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate("endTime", "endTime must be after startTime");
  }
});

calendarEventSchema.index({ workspace: 1 });
calendarEventSchema.index({ project: 1 });
calendarEventSchema.index({ attendees: 1 });
calendarEventSchema.index({ workspace: 1, startTime: 1, endTime: 1 });

calendarEventSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const CalendarEvent = model<ICalendarEvent>(
  "CalendarEvent",
  calendarEventSchema,
);

export default CalendarEvent;
