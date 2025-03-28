import { account } from "@/db/schema/account";
import { session } from "@/db/schema/session";
import { user } from "@/db/schema/user";
import { verification } from "@/db/schema/verification";
import { env } from "@/env";
import { drizzle } from "drizzle-orm/node-postgres";
import fs from "fs";
import { Pool } from "pg";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

/**
 * Dynamically load the database CA certificate at runtime.
 * This prevents build-time failures if the certificate is missing.
 * If the certificate file exists, it is read and used for SSL; otherwise, SSL is disabled.
 */
const caPath = "./certificates/database_ca.crt";
const sslConfig = fs.existsSync(caPath)
  ? { ca: fs.readFileSync(caPath) }
  : undefined;

// Reuse the cached connection if it exists
const pool =
  globalForDb.conn ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    ssl: sslConfig,
  });

if (env.NODE_ENV !== "production") globalForDb.conn = pool;

export const db = drizzle(pool, {
  schema: { user, session, account, verification },
});
