import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  emptyStringAsUndefined: true,
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().url(),
    RESEND_API_KEY: z.string(),
    RESEND_DOMAIN: z.string(),
    CUID_FINGERPRINT: z.string(),
    AUTH_SECRET: z.string(),
    AUTH_URL: z.string().url(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    AUTH_GITHUB_ID: z.string(),
    AUTH_GITHUB_SECRET: z.string(),
    UPLOADTHING_TOKEN: z.string(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
});
