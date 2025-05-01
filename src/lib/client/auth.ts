import { createEnumObject } from "@/lib/utils";
import {
  adminClient,
  magicLinkClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  // Because the auth server is running on the same domain as client, we don't need to specify the baseURL
  // https://better-auth.vercel.app/docs/concepts/client
  // baseURL: env.NEXT_PUBLIC_BASE_URL,
  plugins: [
    passkeyClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/two-factor"; // Handle the 2FA verification redirect
      },
    }),
    adminClient(),
    magicLinkClient(),
  ],
});

// Same as admin plugin roles
export const UserRoleClient = createEnumObject(["user", "admin"]);
