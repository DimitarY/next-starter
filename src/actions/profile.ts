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
  try {
    const headersList = await headers();

    const sessionObj = await auth.api.getSession({
      headers: headersList,
    });

    if (!sessionObj) {
      return;
    }

    await auth.api.updateUser({
      headers: headersList,
      body: {
        image: url,
      },
    });
  } catch (error) {
    console.error("Error deleting user image:", error);
    throw error;
  }

  revalidatePath("/", "layout");
}

export async function RemoveUserImageAction() {
  try {
    const headersList = await headers();

    const sessionObj = await auth.api.getSession({
      headers: headersList,
    });

    if (!sessionObj) {
      return;
    }

    if (!sessionObj.user.image) {
      return;
    }

    await auth.api.updateUser({
      headers: headersList,
      body: {
        image: "",
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
