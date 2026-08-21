import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../config/cloudinary.config";
import User, { IUser } from "../../models/user.model";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/errors/app.error";

export const getCurrentUserService = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  return user;
};

export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (user.authProvider !== "local") {
    throw new BadRequestError(
      "Password change is not available for Google accounts.",
    );
  }

  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();
};

export const changeProfileService = async (
  userId: string,
  data: {
    name?: string;
  },
  file?: Express.Multer.File,
) => {
  const user = await User.findById(userId).select("+googleId");

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (data.name) {
    user.name = data.name;
  }

  if (file) {
    if (user.avatar) {
      const publicId = user.avatar.split("/").pop()?.split(".")[0];

      if (publicId) {
        await deleteFromCloudinary(`gravity/users/${publicId}`);
      }
    }
    const uploaded = await uploadToCloudinary(
      file.path,
      "gravity/users",
      "image",
    );

    user.avatar = uploaded.url;
  }

  await user.save();
  return user;
};

export const updateNotificationPreferencesService = async (
  userId: string,
  preferences: {
    emailNotifications?: boolean;
    taskAssigned?: boolean;
    mentionAlerts?: boolean;
    weeklyDigest?: boolean;
  },
): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  user.notificationPreferences = {
    ...user.notificationPreferences,
    ...preferences,
  } as any;

  await user.save();
  return user;
};

export const getAllUsersService = async (): Promise<IUser[]> => {
  const users = await User.find()
    .select("_id name email avatar")
    .sort({ name: 1 });

  return users;
};
