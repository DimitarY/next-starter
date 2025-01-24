"use server";

import { signIn, unstable_update } from "@/auth";
import PasswordResetEmail from "@/components/emails/password-reset";
import { siteConfig } from "@/config/site";
import { db } from "@/db";
import {
  CheckUserExistsAndUseMagicLinkByEmail,
  CheckUserExistsByEmail,
  RegisterUserByEmail,
} from "@/db/querys";
import { account } from "@/db/schema/account";
import { user } from "@/db/schema/user";
import { env } from "@/env";
import { hashPassword, validateSession } from "@/lib/authUtils";
import { resend } from "@/lib/resend";
import {
  ForgotPasswordSchema,
  LoginSchema,
  MagicLinkSchema,
  RegisterSchema,
} from "@/schemas/auth";
import { utapi } from "@/uploadthing/server";
import { and, eq } from "drizzle-orm";
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
    const userExist = await CheckUserExistsByEmail(email);

    if (!userExist) {
      return {
        success: false,
        error: "No user found with the provided email address.",
      };
    }

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
    const { exists, useMagicLink } =
      await CheckUserExistsAndUseMagicLinkByEmail(email);

    if (!exists) {
      return { success: false, error: "User not found" };
    } else if (!useMagicLink) {
      return { success: true, useCredentials: true };
    } else {
      signIn("resend", {
        email,
        redirect: false,
      });
      return { success: true, useCredentials: false };
    }
  } catch (error) {
    console.error("MagicLinkAction error:", error);

    return { success: false, error: "Invalid login credentials" };
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

export const DisconnectAccountAction = async (
  provider: string,
): Promise<{ success: true } | { success: false; error: string }> => {
  try {
    const session = await validateSession();

    const deletedAccount = await db
      .delete(account)
      .where(
        and(
          eq(account.userId, session.user.id as string),
          eq(account.provider, provider),
        ),
      )
      .returning();

    if (deletedAccount) {
      return { success: true };
    }
    return { success: false, error: "Something went wrong!" };
  } catch (error) {
    console.error("Error disconnecting account:", error);

    return { success: false, error: "Something went wrong!" };
  }
};
