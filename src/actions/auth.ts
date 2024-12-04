"use server";

import { signIn, unstable_update } from "@/auth";
import { PasswordResetEmail } from "@/components/email-template";
import { siteConfig } from "@/config/site";
import { db } from "@/db";
import { CheckUserExistsByEmail, RegisterUserByEmail } from "@/db/querys";
import { user } from "@/db/schema/user";
import { env } from "@/env";
import { hashPassword, validateSession } from "@/lib/authUtils";
import { resend } from "@/lib/resend";
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
} from "@/schemas/auth";
import { utapi } from "@/uploadthing/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const LoginAction = async (
  values: z.infer<typeof LoginSchema>,
): Promise<{ success: true } | { success: false; error: string }> => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("LoginAction error:", error);

    return { success: false, error: "Invalid login credentials" };
  }
};

export const RegisterAction = async (
  values: z.infer<typeof RegisterSchema>,
): Promise<{ success: true } | { success: false; error: string }> => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }

  const { name, email, password } = validatedFields.data;
  let userExists = false;
  let success = false;

  try {
    userExists = await CheckUserExistsByEmail(email);

    if (!userExists) {
      const hashedPassword = await hashPassword(password);
      success = await RegisterUserByEmail(name, email, hashedPassword);
    }
  } catch (error) {
    console.error("Error registering user:", error);

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }

  if (userExists) {
    return { success: false, error: "User with this email already exists!" };
  }

  if (success) {
    return { success: true };
  } else {
    return {
      success: false,
      error: "User creation failed. Please try again later.",
    };
  }
};

export const ForgotPasswordAction = async (
  values: z.infer<typeof ForgotPasswordSchema>,
): Promise<{ success: true } | { success: false; error: string }> => {
  const validatedFields = ForgotPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }

  const { email } = validatedFields.data;

  try {
    const { data, error } = await resend.emails.send({
      from: `${siteConfig.name} <no-reply@${env.RESEND_DOMAIN}>`,
      to: [email],
      subject: "Reset password instructions",
      react: PasswordResetEmail({ resetLink: "https://example.com" }),
    });

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

/**
 * Used to optimistically update the user's image
 * without waiting for `onUploadComplete` to finish
 * and updating the database record
 */
export async function UpdateUserImageAction(url: string) {
  await unstable_update({ user: { image: url } });
  revalidatePath("/", "layout");
}

export async function RemoveUserImageAction() {
  try {
    const session = await validateSession();

    if (!session.user.image || !session.user.id) {
      return;
    }

    await unstable_update({ user: { image: null } });

    await db
      .update(user)
      .set({ image: null })
      .where(eq(user.id, session.user.id));

    const key = session.user.image.split("/f/")[1];

    await utapi.deleteFiles(key);
  } catch (error) {
    console.error("Error deleting user image:", error);
    throw error;
  }

  revalidatePath("/", "layout");
}
