import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { pool } from "./postgres/pool";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

export const db: Database = drizzle(pool, { schema });
