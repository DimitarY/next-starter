"use server";

import { db } from "@/db";
import { user } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { utapi } from "@/uploadthing/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Used to optimistically update the user's image
 * without waiting for `onUploadComplete` to finish
 * and updating the database record
 */
export async function UpdateUserImageAction(url: string) {
  // FIXME: Update
  // await unstable_update({ user: { image: url } });
  console.log("URL:", url); // REMOVE_ME
  revalidatePath("/", "layout");
}

export async function RemoveUserImageAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return;
    }

    if (!session.user.image || !session.user.id) {
      return;
    }

    // FIXME: Update
    // await unstable_update({ user: { image: null } });

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
