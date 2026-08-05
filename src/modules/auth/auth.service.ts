import User, { IUser } from "../../models/user.model";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/errors/app.error";
import { generateOTP } from "../../utils/helpers/otp";
import {
  EmailSchemaType,
  LoginSchemaType,
  RefreshTokenSchemaType,
  RegisterSchemaType,
  ResetPasswordSchemaType,
  VerifySchemaType,
} from "../../validators/auth.validator";
import { sendEmail } from "../../utils/helpers/send-email";
import { verifyEmailTemplate } from "../../utils/templates/verify-email";
import { AuthTokens } from "../../types";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/helpers/jwt";
import { resetPasswordTemplate } from "../../utils/templates/reset-password";
import { loginOTPTemplate } from "../../utils/templates/login-otp";
import { serverConfig } from "../../config";
import { verifyGoogleToken } from "../../utils/helpers/google";

export const loginService = async (data: LoginSchemaType): Promise<any> => {
  const { email, password, remember } = data;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const isMatched = await user.comparePassword(password);

  if (!isMatched) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  if (!user.isEmailVerified) {
    throw new UnauthorizedError("Please verify your email before logging in.");
  }

  if (user.is2FAEnabled) {
    const otp = generateOTP();

    user.twoFAotp = otp;
    user.twoFAExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your Login OTP",
      html: loginOTPTemplate(user.name, otp),
    });

    return {
      requiresTwoFA: true,
      email: user.email,
    };
  }

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
  });

  const refreshToken = generateRefreshToken(
    { id: user._id.toString(), email: user.email },
    remember ? serverConfig.JWT_REFRESH_EXPIRE_REMEMBER : undefined,
  );

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();

  await user.save();

  return {
    requiresTwoFA: false,
    user,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export const verifyService = async (data: VerifySchemaType): Promise<IUser> => {
  const { email, otp } = data;

  const user = await User.findOne({ email }).select(
    "+emailVerificationOTP +emailVerificationOTPExpires",
  );

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (user.isEmailVerified) {
    throw new BadRequestError("Email is already verified.");
  }

  if (!user.emailVerificationOTP || !user.emailVerificationOTPExpires) {
    throw new BadRequestError("Invalid OTP.");
  }

  const isValidOTP = await user.compareOtp(otp);

  if (!isValidOTP) {
    throw new BadRequestError("Invalid OTP.");
  }

  if (user.emailVerificationOTPExpires < new Date()) {
    throw new BadRequestError("OTP has expired.");
  }

  user.isEmailVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpires = undefined;

  await user.save();

  return user;
};

export const registerService = async (
  data: RegisterSchemaType,
): Promise<IUser> => {
  const { email, name, password } = data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ConflictError("Email already exists.");
  }

  const otp = generateOTP();

  const user = await User.create({
    name,
    email,
    password,
    emailVerificationOTP: otp,
    emailVerificationOTPExpires: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: verifyEmailTemplate(user.name, otp),
  });

  return user;
};

export const resendVerifyEmailService = async (
  email: string,
): Promise<void> => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (user.isEmailVerified) {
    throw new BadRequestError("Email is already verified.");
  }

  const otp = generateOTP();
  user.emailVerificationOTP = otp;
  user.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: verifyEmailTemplate(user.name, otp),
  });
};

export const forgotPasswordService = async (
  data: EmailSchemaType,
): Promise<void> => {
  const { email } = data;

  const user = await User.findOne({ email });

  if (!user) {
    return;
  }

  const otp = generateOTP();

  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Reset Your Password",
    html: resetPasswordTemplate(user.name, otp),
  });
};

export const resetPasswordService = async (
  data: ResetPasswordSchemaType,
): Promise<void> => {
  const { email, otp, password } = data;

  const user = await User.findOne({ email }).select(
    "+resetPasswordOTP +resetPasswordOTPExpires",
  );

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (!user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
    throw new BadRequestError("Invalid OTP.");
  }

  const isValidOTP = await user.compareResetPasswordOTP(otp);

  if (!isValidOTP) {
    throw new BadRequestError("Invalid OTP.");
  }

  if (user.resetPasswordOTPExpires < new Date()) {
    throw new BadRequestError("OTP expired.");
  }

  user.password = password;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;
  user.refreshToken = undefined;

  await user.save();
};

export const logoutService = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  user.refreshToken = undefined;

  await user.save();
};

export const enableTwoFAService = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (user.is2FAEnabled) {
    throw new BadRequestError("Two-factor authentication is already enabled.");
  }

  user.is2FAEnabled = true;

  await user.save();

  return user;
};

export const verifyTwoFactorService = async (
  email: string,
  otp: string,
): Promise<{
  user: IUser;
  tokens: AuthTokens;
}> => {
  const user = await User.findOne({ email }).select("+twoFAotp +twoFAExpire");

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (!user.twoFAotp || !user.twoFAExpire) {
    throw new BadRequestError("Invalid OTP.");
  }

  if (user.twoFAExpire < new Date()) {
    throw new BadRequestError("OTP has expired.");
  }

  const isValidOTP = await user.compareTwoFAOTP(otp);

  if (!isValidOTP) {
    throw new BadRequestError("Invalid OTP.");
  }

  user.twoFAotp = undefined;
  user.twoFAExpire = undefined;

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    id: user._id.toString(),
    email: user.email,
  });

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();

  await user.save();

  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export const disableTwoFAService = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (!user.is2FAEnabled) {
    throw new BadRequestError("Two-factor authentication is already disabled.");
  }

  user.is2FAEnabled = false;

  user.twoFAotp = undefined;
  user.twoFAExpire = undefined;

  await user.save();

  return user;
};

export const googleLoginService = async (idToken: string) => {
  if (!idToken) {
    throw new BadRequestError("Google ID token is required.");
  }

  const { email, name, picture, googleId, emailVerified } =
    await verifyGoogleToken(idToken);

  let user = await User.findOne({ email }).select("+refreshToken");

  if (!user) {
    user = await User.create({
      email,
      name: name || email.split("@")[0],
      avatar: picture || "",
      authProvider: "google",
      googleId,
      isEmailVerified: emailVerified,
      lastLogin: new Date(),
    });
  } else {
    if (user.authProvider === "local") {
      throw new BadRequestError(
        "This email is already registered with email and password. Please login using your password.",
      );
    }

    if (user.googleId && user.googleId !== googleId) {
      throw new UnauthorizedError("Google account does not match.");
    }

    if (!user.isEmailVerified && emailVerified) {
      user.isEmailVerified = true;
    }

    if ((!user.avatar || user.avatar === "") && picture) {
      user.avatar = picture;
    }

    user.lastLogin = new Date();
  }

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    id: user._id.toString(),
    email: user.email,
  });

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export const refreshTokenService = async (
  data: RefreshTokenSchemaType,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const { refreshToken } = data;

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired refresh token.");
  }

  const user = await User.findById(payload.id).select("+refreshToken");

  if (!user) {
    throw new UnauthorizedError("User not found.");
  }

  if (!user.refreshToken || user.refreshToken !== refreshToken) {
    throw new UnauthorizedError(
      "Refresh token is invalid or has been revoked.",
    );
  }

  const newAccessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
  });

  const newRefreshToken = generateRefreshToken({
    id: user._id.toString(),
    email: user.email,
  });

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
