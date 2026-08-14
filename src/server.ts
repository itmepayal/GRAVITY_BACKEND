import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { serverConfig } from "./config";
import { swaggerSpec } from "./config/swagger.config";

import v1Router from "./routers/v1/index.router";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

import logger from "./config/logger.config";
import { connectDB } from "./config/db.config";

const app = express();

// =========================
// CORS
// =========================

const allowedOrigins = [
  ...serverConfig.CLIENT_URL,
  ...(serverConfig.API_URL ? [serverConfig.API_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`Blocked by CORS: ${origin}`);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  }),
);

app.use(express.json());

// =========================
// Root
// =========================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gravity API is running",
    docs: "/api-docs",
  });
});

// =========================
// Health Check
// =========================
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy
 */
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gravity API is healthy",
    status: "OK",
    environment: serverConfig.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// =========================
// API Routes
// =========================

app.use("/api/v1", v1Router);

// =========================
// Swagger Documentation
// =========================

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =========================
// Error Handling
// =========================

app.use(notFoundHandler);
app.use(errorHandler);

// =========================
// Start Server
// =========================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(serverConfig.PORT, () => {
      logger.info(`Server is running on port ${serverConfig.PORT}`);
      logger.info(`Swagger docs: ${serverConfig.API_URL}/api-docs`);
      logger.info("Press Ctrl+C to stop the server.");
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
