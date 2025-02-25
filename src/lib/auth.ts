import { db } from "@/db";
import { account } from "@/db/schema/account";
import { session } from "@/db/schema/session";
import { user } from "@/db/schema/user";
import { verification } from "@/db/schema/verification";
import { env } from "@/env";
import { sendMagicLink, sendVerificationRequest } from "@/lib/authSendRequest";
import { createEnumObject } from "@/lib/utils";
import { betterAuth, User as User_Original } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink } from "better-auth/plugins";

export const auth = betterAuth({
  trustedOrigins: [env.NEXT_PUBLIC_BASE_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      session: session,
      account: account,
      verification: verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    // TODO: Add sendResetPassword
  },
  emailVerification: {
    // TODO: Add rate limiting
    expiresIn: env.EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationRequest({
        identifier: user.email,
        url: url,
      });
    },
  },
  socialProviders: {
    // FIXME: Block user from signing in with social providers if there is an credential account with the same email
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),
    magicLink({
      expiresIn: env.MAGIC_LINK_EXPIRES_IN_SECONDS,
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLink({
          identifier: email,
          url,
        });
      },
    }),
    nextCookies(), // make sure nextCookies is the last plugin in the array
  ],
});

// Same as admin plugin roles
export const UserRole = createEnumObject(["user", "admin"]);

export type User = User_Original & {
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
};
