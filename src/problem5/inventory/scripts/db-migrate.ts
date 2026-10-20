import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../src/infrastructure/database/db";
import { pool } from "../src/infrastructure/database/postgres/pool";

async function waitForDatabase(): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const client = await pool.connect();
      client.release();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Database did not become ready");
}

async function main(): Promise<void> {
  await waitForDatabase();
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Drizzle migrations applied");
  await pool.end();
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  await pool.end();
  process.exit(1);
});
