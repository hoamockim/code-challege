import { env } from "./infrastructure/config/env";
import {
  closeDatabase,
  connectDatabase,
} from "./infrastructure/database/postgres/pool";
import { createContainer } from "./infrastructure/di/container";
import { createApp } from "./presentation/http/app";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const container = createContainer();
  const app = createApp(container);

  const server = app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
