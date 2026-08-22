import { Types } from "mongoose";
import CalendarEvent, {
  ICalendarEvent,
  EventType,
} from "../../models/calendar-event";
import { NotFoundError } from "../../utils/errors/app.error";

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  workspace: string;
  project?: string;
  task?: string;
  type?: EventType;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  attendees?: string[];
  location?: string;
  color?: string;
  reminderMinutesBefore?: number;
  createdBy: string;
}

export const createCalendarEventService = async (
  input: CreateCalendarEventInput,
): Promise<ICalendarEvent> => {
  const event = await CalendarEvent.create({
    ...input,
    workspace: new Types.ObjectId(input.workspace),
    project: input.project ? new Types.ObjectId(input.project) : undefined,
    task: input.task ? new Types.ObjectId(input.task) : undefined,
    attendees: input.attendees?.map((id) => new Types.ObjectId(id)) || [],
    createdBy: new Types.ObjectId(input.createdBy),
  });

  return event.populate([
    { path: "createdBy", select: "name email avatar" },
    { path: "attendees", select: "name email avatar" },
    { path: "project", select: "name" },
    { path: "task", select: "title" },
  ]);
};

export const getWorkspaceCalendarEventsService = async (
  workspaceId: string,
  projectId?: string,
  startDate?: Date,
  endDate?: Date,
): Promise<ICalendarEvent[]> => {
  const query: Record<string, any> = {
    workspace: new Types.ObjectId(workspaceId),
  };
  if (projectId) query.project = new Types.ObjectId(projectId);

  if (startDate && endDate) {
    query.startTime = { $gte: startDate, $lte: endDate };
  }

  return CalendarEvent.find(query)
    .sort({ startTime: 1 })
    .populate("createdBy", "name email avatar")
    .populate("attendees", "name email avatar")
    .populate("project", "name")
    .populate("task", "title status");
};

export const updateCalendarEventService = async (
  eventId: string,
  data: Partial<ICalendarEvent>,
): Promise<ICalendarEvent> => {
  const event = await CalendarEvent.findById(eventId);
  if (!event) {
    throw new NotFoundError("Calendar event not found.");
  }

  Object.assign(event, data);
  await event.save();

  return event.populate([
    { path: "createdBy", select: "name email avatar" },
    { path: "attendees", select: "name email avatar" },
    { path: "project", select: "name" },
    { path: "task", select: "title status" },
  ]);
};

export const deleteCalendarEventService = async (
  eventId: string,
): Promise<void> => {
  const event = await CalendarEvent.findByIdAndDelete(eventId);
  if (!event) {
    throw new NotFoundError("Calendar event not found.");
  }
};
