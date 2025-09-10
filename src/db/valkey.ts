import Valkey from "iovalkey";
import { env } from "@/env";

/**
 * Cache the Valkey connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForValkey = globalThis as unknown as {
  valkey?: Valkey;
};

// Reuse the existing Valkey connection if available
const valkey = globalForValkey.valkey ?? new Valkey(env.VALKEY_URL);

// Cache the connection in development
if (env.NODE_ENV !== "production") {
  globalForValkey.valkey = valkey;
}

export { valkey };
