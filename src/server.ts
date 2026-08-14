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

app.use(
  cors({
    origin: serverConfig.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/v1", v1Router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(serverConfig.PORT, () => {
      logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);

      logger.info(
        `Swagger docs: http://localhost:${serverConfig.PORT}/api-docs`,
      );

      logger.info("Press Ctrl+C to stop the server.");
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
