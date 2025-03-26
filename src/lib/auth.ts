import { db } from "@/db";
import { account } from "@/db/schema/account";
import { rateLimit } from "@/db/schema/rate_limit";
import { session } from "@/db/schema/session";
import { user } from "@/db/schema/user";
import { verification } from "@/db/schema/verification";
import { env } from "@/env";
import {
  sendChangeEmailVerification,
  sendDeleteAccountVerification,
  sendMagicLink,
  sendResetPasswordEmail,
  sendVerificationRequest,
} from "@/lib/authSendRequest";
import { createEnumObject } from "@/lib/utils";
import { betterAuth, User as User_Original } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
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
      rateLimit: rateLimit,
    },
  }),
  rateLimit: {
    enabled: true,
    window: 10,
    max: 3,
    customRules: {
      "/sign-up": {
        window: 60,
        max: 3,
      },
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/sign-in/social": {
        window: 5,
        max: 1,
      },
      "/forgot-password": {
        window: env.RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS,
        max: 2,
      },
      "/sign-in/magic-link": {
        window: env.MAGIC_LINK_EXPIRES_IN_SECONDS,
        max: 2,
      },
    },
    storage: "database", // This is not optimal for production
    modelName: "rateLimit",
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    // requireEmailVerification: true, // FIXME: This is sending email verification request on every login attempt. It is too expensive
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({
        identifier: user.email,
        url: url,
      });
    },
    resetPasswordTokenExpiresIn: env.RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
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
        await sendChangeEmailVerification({
          identifier: user.email,
          url,
          newEmail,
        });
      },
      expirationInSeconds: env.EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
    },
    deleteUser: {
      // TODO: When we have INVALID_TOKEN on token is expired we don't go to the callback URL instead we go to JSON response
      enabled: true,
      beforeDelete: async (user: User) => {
        // This user object is returned from session cookieCache
        if (user.role == "admin") {
          // TODO: When we throw we don't go to the callback URL instead we go to JSON response
          throw new APIError("BAD_REQUEST", {
            message: "Admin accounts can't be deleted",
          });
        }
      },
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerification({
          identifier: user.email,
          url,
        });
      },
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
    freshAge: 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
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
