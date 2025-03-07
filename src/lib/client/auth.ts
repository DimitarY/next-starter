import { createEnumObject } from "@/lib/utils";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  // Because the auth server is running on the same domain as client, we don't need to specify the baseURL
  // https://better-auth.vercel.app/docs/concepts/client
  // baseURL: env.NEXT_PUBLIC_BASE_URL,
  plugins: [adminClient(), magicLinkClient()],
});

// Same as admin plugin roles
export const UserRoleClient = createEnumObject(["user", "admin"]);
