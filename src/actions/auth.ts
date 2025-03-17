"use server";

import { db } from "@/db";
import { user } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { MagicLinkSchema } from "@/schemas/auth";
import { SecuritySettings_SetPassword } from "@/schemas/settings";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

export const SetPasswordAction = async (
  values: z.infer<typeof SecuritySettings_SetPassword>,
): Promise<boolean> => {
  const validatedFields = SecuritySettings_SetPassword.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }

  const { password } = validatedFields.data;

  try {
    const sessionObj = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionObj) {
      return false;
    }

    const { status } = await auth.api.setPassword({
      headers: await headers(),
      body: {
        newPassword: password,
      },
    });

    return status;
  } catch (error) {
    console.error("SetPasswordAction error:", error);
    throw error;
  }
};

export const EnableMagicLinkAction = async ({
  enable,
}: {
  enable: boolean;
}) => {
  try {
    const sessionObj = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionObj) {
      return false;
    }

    const result = await db
      .update(user)
      .set({ useMagicLink: enable })
      .where(eq(user.id, sessionObj.user.id))
      .returning({ useMagicLink: user.useMagicLink });

    return result[0].useMagicLink;
  } catch (error) {
    console.error("EnableMagicLinkAction error:", error);
    throw error;
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
