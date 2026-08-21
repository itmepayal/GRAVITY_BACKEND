import { Types } from "mongoose";
import Label, { ILabel } from "../../models/label.model";
import { BadRequestError, NotFoundError } from "../../utils/errors/app.error";
import { createActivityLogService } from "../activity-log/activity-log.service";
import logger from "../../config/logger.config";

export interface CreateLabelInput {
  name: string;
  color?: string;
  workspace: string;
  project?: string;
  createdBy: string;
}

const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);

export const createLabelService = async (
  input: CreateLabelInput,
): Promise<ILabel> => {
  const trimmedName = input.name.trim();

  if (!isValidObjectId(input.workspace)) {
    throw new BadRequestError("Invalid workspace id.");
  }
  if (input.project && !isValidObjectId(input.project)) {
    throw new BadRequestError("Invalid project id.");
  }
  if (!isValidObjectId(input.createdBy)) {
    throw new BadRequestError("Invalid user id.");
  }

  let label: ILabel;

  try {
    label = await Label.create({
      name: trimmedName,
      color: input.color || "#6366F1",
      workspace: new Types.ObjectId(input.workspace),
      project: input.project ? new Types.ObjectId(input.project) : undefined,
      createdBy: new Types.ObjectId(input.createdBy),
    });
  } catch (error: any) {
    if (error.code === 11000) {
      throw new BadRequestError(
        "Label with this name already exists in this workspace.",
      );
    }
    throw error;
  }

  try {
    await createActivityLogService({
      workspace: input.workspace,
      actor: input.createdBy,
      action: "created",
      entityType: "label",
      entityId: label._id,
      entityName: label.name,
    });
  } catch (err) {
    logger.error("Activity log creation failed on label create:", err);
  }

  return label;
};

export const getWorkspaceLabelsService = async (
  workspaceId: string,
): Promise<ILabel[]> => {
  if (!isValidObjectId(workspaceId)) {
    throw new BadRequestError("Invalid workspace id.");
  }

  return Label.find({ workspace: new Types.ObjectId(workspaceId) })
    .sort({ name: 1 })
    .populate("createdBy", "name email avatar");
};

export const deleteLabelService = async (
  labelId: string,
  workspaceId: string,
  userId?: string,
): Promise<void> => {
  if (!isValidObjectId(labelId)) {
    throw new BadRequestError("Invalid label id.");
  }
  if (!isValidObjectId(workspaceId)) {
    throw new BadRequestError("Invalid workspace id.");
  }

  const label = await Label.findOneAndDelete({
    _id: labelId,
    workspace: workspaceId,
  });

  if (!label) {
    throw new NotFoundError("Label not found.");
  }

  if (userId) {
    try {
      await createActivityLogService({
        workspace: workspaceId,
        actor: userId,
        action: "deleted",
        entityType: "label",
        entityId: label._id,
        entityName: label.name,
      });
    } catch (err) {
      logger.error("Activity log creation failed on label delete:", err);
    }
  }
};
