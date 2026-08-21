import bcrypt from "bcryptjs";
import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  authProvider: "local" | "google";
  googleId?: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  emailVerificationOTP?: string;
  emailVerificationOTPExpires?: Date;
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;
  is2FAEnabled: boolean;
  twoFAEnabled?: string;
  twoFAotp?: string;
  twoFAExpire?: Date;
  requiresTwoFA?: boolean;
  refreshToken?: string;
  notificationPreferences?: {
    emailNotifications: boolean;
    taskAssigned: boolean;
    mentionAlerts: boolean;
    weeklyDigest: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  compareOtp(candidateOtp: string): Promise<boolean>;
  compareTwoFAOTP(candidateOtp: string): Promise<boolean>;
  compareResetPasswordOTP(candidateOTP: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: function (this: IUser) {
        return this.authProvider === "local";
      },
      select: false,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
      select: false,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOTP: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationOTPExpires: {
      type: Date,
      default: null,
      select: false,
    },

    resetPasswordOTP: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordOTPExpires: {
      type: Date,
      default: null,
      select: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    is2FAEnabled: {
      type: Boolean,
      default: false,
    },

    twoFAEnabled: {
      type: String,
      default: null,
      select: false,
    },

    twoFAotp: {
      type: String,
      default: null,
      select: false,
    },

    twoFAExpire: {
      type: Date,
      default: null,
      select: false,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      taskAssigned: { type: Boolean, default: true },
      mentionAlerts: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.emailVerificationOTP;
    delete ret.emailVerificationOTPExpires;
    delete ret.resetPasswordOTP;
    delete ret.resetPasswordOTPExpires;
    delete ret.twoFAEnabled;
    delete ret.twoFAotp;
    delete ret.twoFAExpire;
    delete ret.googleId;
    delete ret.refreshToken;
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isModified("emailVerificationOTP") && this.emailVerificationOTP) {
    this.emailVerificationOTP = await bcrypt.hash(
      this.emailVerificationOTP,
      10,
    );
  }

  if (this.isModified("resetPasswordOTP") && this.resetPasswordOTP) {
    this.resetPasswordOTP = await bcrypt.hash(this.resetPasswordOTP, 10);
  }

  if (this.isModified("twoFAotp") && this.twoFAotp) {
    this.twoFAotp = await bcrypt.hash(this.twoFAotp, 10);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.compareOtp = async function (
  candidateOtp: string,
): Promise<boolean> {
  if (!this.emailVerificationOTP) return false;
  return bcrypt.compare(candidateOtp, this.emailVerificationOTP);
};

userSchema.methods.compareTwoFAOTP = async function (
  candidateOtp: string,
): Promise<boolean> {
  if (!this.twoFAotp) return false;
  return bcrypt.compare(candidateOtp, this.twoFAotp);
};

userSchema.methods.compareResetPasswordOTP = async function (
  otp: string,
): Promise<boolean> {
  if (!this.resetPasswordOTP) return false;
  return bcrypt.compare(otp, this.resetPasswordOTP);
};

const User = model<IUser>("User", userSchema);

export default User;
