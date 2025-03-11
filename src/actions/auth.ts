"use server";

import { db } from "@/db";
import { user } from "@/db/schema/user";
import { MagicLinkSchema } from "@/schemas/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
