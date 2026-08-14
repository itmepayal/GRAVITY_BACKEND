import dotenv from "dotenv";
import path from "path";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";

dotenv.config({
  path: path.resolve(process.cwd(), envFile),
});

dotenv.config();

type ServerConfig = {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URL: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  CLIENT_URL: string;
  API_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRE: string;
  JWT_REFRESH_EXPIRE: string;
  JWT_REFRESH_EXPIRE_REMEMBER: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 8001,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URL: process.env.MONGODB_URL!,

  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",

  BREVO_API_KEY: process.env.BREVO_API_KEY || "",
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || "",
  CLIENT_URL: process.env.CLIENT_URL || "",
  API_URL: process.env.API_URL || "",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,

  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || "1d",
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "30d",
  JWT_REFRESH_EXPIRE_REMEMBER: process.env.JWT_REFRESH_EXPIRE_REMEMBER!,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
};
