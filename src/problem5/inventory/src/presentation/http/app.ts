import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "../../infrastructure/config/env";
import { AppContainer } from "../../infrastructure/di/container";
import { errorHandler } from "./middlewares/errorHandler";
import { createCategoryRoutes } from "./routes/categoryRoutes";
import { createHealthRoutes } from "./routes/healthRoutes";
import { createProductRoutes } from "./routes/productRoutes";
import { setupSwagger } from "./swagger";

export function createApp(container: AppContainer) {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "validator.swagger.io"],
        },
      },
    })
  );
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));
  app.use(morgan("dev"));

  setupSwagger(app, { port: env.port });

  app.use("/health", createHealthRoutes());
  app.use("/api/categories", createCategoryRoutes(container.categoryController));
  app.use("/api/products", createProductRoutes(container.productController));

  app.use(errorHandler);

  return app;
}
