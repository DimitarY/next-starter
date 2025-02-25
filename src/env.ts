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
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_GOOGLE_CLIENT_ID: z.string(),
    BETTER_AUTH_GOOGLE_CLIENT_SECRET: z.string(),
    BETTER_AUTH_GITHUB_CLIENT_ID: z.string(),
    BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    MAGIC_LINK_EXPIRES_IN_SECONDS: z
      .string()
      .default((60 * 5).toString())
      .transform((val) => Number(val)),
    EMAIL_VERIFICATION_EXPIRES_IN_SECONDS: z
      .string()
      .default((3600).toString())
      .transform((val) => Number(val)),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
});
