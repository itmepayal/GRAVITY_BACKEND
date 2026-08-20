import { Types } from "mongoose";
import ActivityLog, {
  ActivityAction,
  ActivityEntityType,
  IActivityLog,
} from "../../models/activity-log.model";

export interface CreateActivityLogInput {
  workspace: string | Types.ObjectId;
  actor: string | Types.ObjectId;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string | Types.ObjectId;
  entityName?: string;
  metadata?: Record<string, any>;
}

export interface ActivityLogFilter {
  workspaceId?: string | Types.ObjectId;
  entityType?: ActivityEntityType;
  entityId?: string | Types.ObjectId;
  actor?: string | Types.ObjectId;
  action?: ActivityAction;
  page?: number;
  limit?: number;
}

/**
 * Reusable helper service to record an activity log across any module in the system.
 */
export const createActivityLogService = async (
  input: CreateActivityLogInput,
): Promise<IActivityLog> => {
  const activity = await ActivityLog.create({
    workspace: new Types.ObjectId(input.workspace),
    actor: new Types.ObjectId(input.actor),
    action: input.action,
    entityType: input.entityType,
    entityId: new Types.ObjectId(input.entityId),
    entityName: input.entityName,
    metadata: input.metadata || {},
  });

  return activity;
};

/**
 * Service to fetch paginated activity logs based on workspace or entity filters.
 */
export const getActivityLogsService = async (filter: ActivityLogFilter) => {
  const query: Record<string, any> = {};

  if (filter.workspaceId) {
    query.workspace = new Types.ObjectId(filter.workspaceId);
  }

  if (filter.entityType) {
    query.entityType = filter.entityType;
  }

  if (filter.entityId) {
    query.entityId = new Types.ObjectId(filter.entityId);
  }

  if (filter.actor) {
    query.actor = new Types.ObjectId(filter.actor);
  }

  if (filter.action) {
    query.action = filter.action;
  }

  const page = Math.max(1, Number(filter.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filter.limit) || 20));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("actor", "name email avatar")
      .populate("workspace", "name")
      .lean(),
    ActivityLog.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
