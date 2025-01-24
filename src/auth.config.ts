import { MagicLinkEmail } from "@/components/email-template";
import { siteConfig } from "@/config/site";
import { GetUserByEmail } from "@/db/querys";
import { UserInterface } from "@/db/schema/user";
import { env } from "@/env";
import { comparePassword } from "@/lib/authUtils";
import { resend } from "@/lib/resend";
import { LoginSchema } from "@/schemas/auth";
import { NextAuthConfig, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

export const SessionMaxAge = 60 * 60 * 24 * 30; // 30 days
export const MagicLinkMaxAge = 60 * 60; // 1 hour

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        let email;
        let password;
        let userRecord: UserInterface | null;
        let pwMatch;

        try {
          const { email: lEmail, password: lPassword } =
            await LoginSchema.parseAsync(credentials);
          email = lEmail;
          password = lPassword;

          userRecord = await GetUserByEmail(email);
        } catch (error) {
          console.error("Error authorizing credentials:", error);
          return null;
        }

        if (!userRecord) {
          console.error("Credentials authorize: User not found.");
          return null;
        }

        if (!userRecord.hash) {
          console.error("Credentials authorize: User has no password.");
          return null;
        }

        try {
          pwMatch = await comparePassword(password, userRecord.hash);
        } catch (error) {
          console.error("Error authorizing credentials:", error);
          return null;
        }

        if (!pwMatch) {
          console.error("Credentials authorize: Invalid password.");
          return null;
        }

        // Convert UserInterface to User
        const user: User = {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          hash: userRecord.hash != null,
          image: userRecord.image,
          joinedAt: userRecord.joinedAt,
          emailVerified: userRecord.emailVerified,
          role: userRecord.role,
          allowMagicLink: userRecord.allowMagicLink,
          useMagicLink: userRecord.useMagicLink,
          accounts: userRecord.accounts,
        };

        // return a user object with their profile data
        return user;
      },
    }),
    Google,
    Github,
    Resend({
      maxAge: MagicLinkMaxAge,
      from: `${siteConfig.name} <no-reply@${env.RESEND_DOMAIN}>` as string,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { from },
      }) {
        const { data, error } = await resend.emails.send({
          from: from as string,
          to: [email],
          subject: `Sign in to ${siteConfig.name}`,
          react: MagicLinkEmail({ magicLink: url }),
        });

        // TODO: Handle error
        console.log("data:", data);
        console.log("error", error);
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
    signOut: "/auth/sign-out",
  },
  session: {
    maxAge: SessionMaxAge,
  },
} satisfies NextAuthConfig;
