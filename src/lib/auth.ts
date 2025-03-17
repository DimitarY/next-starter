import { db } from "@/db";
import { account } from "@/db/schema/account";
import { session } from "@/db/schema/session";
import { user } from "@/db/schema/user";
import { verification } from "@/db/schema/verification";
import { env } from "@/env";
import {
  sendChangeEmailVerification,
  sendMagicLink,
  sendResetPasswordEmail,
  sendVerificationRequest,
} from "@/lib/authSendRequest";
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
    // requireEmailVerification: true, // FIXME: This is sending email verification request on every login attempt. It is too expensive
    sendResetPassword: async ({ user, url }) => {
      // TODO: Add rate limiting
      await sendResetPasswordEmail({
        identifier: user.email,
        url: url,
      });
    },
    resetPasswordTokenExpiresIn: env.RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // TODO: Add rate limiting
      await sendVerificationRequest({
        identifier: user.email,
        url: url,
      });
    },
    expiresIn: env.EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
    sendOnSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      // This function triggers when a user have a verified email and changes their email
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        // TODO: Add rate limiting
        await sendChangeEmailVerification({
          identifier: user.email,
          url,
          newEmail,
        });
      },
      expirationInSeconds: env.EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
    },
  },
  account: {
    accountLinking: {
      enabled: false,
      allowMultipleAccounts: true,
      allowDifferentEmails: true,
      trustedProviders: ["google", "github"],
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60, // Cache duration in seconds
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // TODO: Add rate limiting
        await sendMagicLink({
          identifier: email,
          url,
        });
      },
      expiresIn: env.MAGIC_LINK_EXPIRES_IN_SECONDS,
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
