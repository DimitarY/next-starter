import { env } from "@/env";
import { createEnumObject } from "@/lib/utils";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  plugins: [adminClient(), magicLinkClient()],
});

// Same as admin plugin roles
export const UserRoleClient = createEnumObject(["user", "admin"]);
