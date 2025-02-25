import { db } from "@/db";
import { user } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { FileRouter } from "uploadthing/next";
import { createUploadthing } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

export const utapi = new UTApi();

const f = createUploadthing();
/**
 * This is your Uploadthing file router. For more information:
 * @see https://docs.uploadthing.com/api-reference/server#file-routes
 */

export const uploadRouter = {
  profilePicture: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
      additionalProperties: {
        width: 512,
        aspectRatio: 1,
      },
    },
  })
    .middleware(async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) throw new UploadThingError("Unauthorized");

      const currentImageKey = session.user.image?.split("/f/")[1];

      return { userId: session.user.id, currentImageKey };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      /**
       * Update the user's image in the database
       */
      await db
        .update(user)
        .set({ image: file.url })
        .where(eq(user.id, metadata.userId));

      /**
       * Delete the old image if it exists
       */
      if (metadata.currentImageKey) {
        await utapi.deleteFiles(metadata.currentImageKey);
      }
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
