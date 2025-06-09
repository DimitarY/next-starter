/**
 * This file exports database connections and schemas for the application.
 * The actual implementations are in separate files:
 * - drizzle.ts: PostgreSQL connection using Drizzle ORM
 * - valkey.ts: Valkey connection using iovalkey
 *
 * All database schemas are also exported from here to centralize imports.
 */

// Database connections
export { db } from "./drizzle";
export { valkey } from "./valkey";

// Database schemas
export { account } from "./schema/account";
export { passkey } from "./schema/passkey";
export { session } from "./schema/session";
export { twoFactor } from "./schema/two_factor";
export { user } from "./schema/user";
export { verification } from "./schema/verification";
