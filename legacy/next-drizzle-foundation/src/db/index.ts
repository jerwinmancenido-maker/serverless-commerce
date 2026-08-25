import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

let database: ReturnType<typeof createDatabase> | undefined;

function createDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const pool = new Pool({ connectionString });
  return drizzle({ client: pool, schema });
}

export function getDb() {
  database ??= createDatabase();
  return database;
}

export type Database = ReturnType<typeof getDb>;
export type DatabaseTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];
