"use server";

import { auth } from "@/lib/auth";
import { utapi } from "@/uploadthing/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Used to optimistically update the user's image
 * without waiting for `onUploadComplete` to finish
 * and updating the database record
 */
export async function UpdateUserImageAction(url: string) {
  // FIXME: Cached session is not updated
  // await unstable_update({ user: { image: url } });
  console.log("URL:", url); // REMOVE_ME
  revalidatePath("/", "layout");
}

export async function RemoveUserImageAction() {
  try {
    const sessionObj = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionObj) {
      return;
    }

    if (!sessionObj.user.image) {
      return;
    }

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        image: null,
      },
    });

    const key = sessionObj.user.image.split("/f/")[1];

    await utapi.deleteFiles(key);
  } catch (error) {
    console.error("Error deleting user image:", error);
    throw error;
  }

  revalidatePath("/", "layout");
}
