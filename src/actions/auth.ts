"use server";

import PasswordResetEmail from "@/components/emails/password-reset";
import { siteConfig } from "@/config/site";
import { db } from "@/db";
import { user } from "@/db/schema/user";
import { env } from "@/env";
import { ForgotPasswordSchema, MagicLinkSchema } from "@/schemas/auth";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { z } from "zod";

export const ForgotPasswordAction = async (
  values: z.infer<typeof ForgotPasswordSchema>,
): Promise<{ success: true } | { success: false; error: string }> => {
  const validatedFields = ForgotPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }

  const { email } = validatedFields.data;

  try {
    const userExists: boolean =
      (await db.select().from(user).where(eq(user.email, email))).length > 0;

    if (!userExists) {
      return {
        success: false,
        error: "No user found with the provided email address.",
      };
    }

    const resend = new Resend(env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: `${siteConfig.name} <no-reply@${env.RESEND_DOMAIN}>`,
      to: [email],
      subject: "Reset password instructions",
      react: PasswordResetEmail({ resetLink: "https://example.com" }),
    });

    // TODO: Handle error
    console.log("data:", data);
    console.log("error", error);

    if (error) {
      return {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("ForgotPasswordAction error:", error);

    return { success: false, error: "An unexpected error occurred." };
  }
};

export const MagicLinkAction = async (
  values: z.infer<typeof MagicLinkSchema>,
): Promise<
  | { success: true; useCredentials: true }
  | { success: true; useCredentials: false }
  | { success: false; error: string }
> => {
  const validatedFields = MagicLinkSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }

  const { email } = validatedFields.data;

  try {
    const userExists = await db
      .select({ useMagicLink: user.useMagicLink })
      .from(user)
      .where(eq(user.email, email));

    const foundUser = userExists[0];

    if (!foundUser) {
      return { success: false, error: "User not found" };
    } else if (foundUser.useMagicLink) {
      return { success: true, useCredentials: false };
    } else {
      return { success: true, useCredentials: true };
    }
  } catch (error) {
    console.error("MagicLinkAction error:", error);

    return { success: false, error: "Invalid login credentials" };
  }
};
