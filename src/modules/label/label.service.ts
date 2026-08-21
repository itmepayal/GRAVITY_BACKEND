import { Types } from "mongoose";
import Label, { ILabel } from "../../models/label.model";
import { BadRequestError, NotFoundError } from "../../utils/errors/app.error";

export interface CreateLabelInput {
  name: string;
  color?: string;
  workspace: string;
  project?: string;
  createdBy: string;
}

export const createLabelService = async (
  input: CreateLabelInput,
): Promise<ILabel> => {
  const trimmedName = input.name.trim();

  const existingLabel = await Label.findOne({
    workspace: input.workspace,
    name: { $regex: `^${trimmedName}$`, $options: "i" },
  });

  if (existingLabel) {
    throw new BadRequestError("Label with this name already exists in this workspace.");
  }

  const label = await Label.create({
    name: trimmedName,
    color: input.color || "#6366F1",
    workspace: new Types.ObjectId(input.workspace),
    project: input.project ? new Types.ObjectId(input.project) : undefined,
    createdBy: new Types.ObjectId(input.createdBy),
  });

  return label;
};

export const getWorkspaceLabelsService = async (
  workspaceId: string,
): Promise<ILabel[]> => {
  return Label.find({ workspace: new Types.ObjectId(workspaceId) })
    .sort({ name: 1 })
    .populate("createdBy", "name email avatar");
};

export const deleteLabelService = async (
  labelId: string,
): Promise<void> => {
  const label = await Label.findByIdAndDelete(labelId);
  if (!label) {
    throw new NotFoundError("Label not found.");
  }
};
