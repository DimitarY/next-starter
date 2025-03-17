import { env } from "@/env";
import { type Config } from "drizzle-kit";

export default {
  schema: "src/db/schema/*",
  dialect: "postgresql",
  out: "src/db/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["!pg_stat_statements", "!pg_stat_statements_info"],
} satisfies Config;
