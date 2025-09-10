import { headers } from "next/headers";
import type { FileRouter } from "uploadthing/next";
import { createUploadthing } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";

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
    .onUploadComplete(async ({ metadata }) => {
      /**
       * Delete the old image if it exists
       */
      if (metadata.currentImageKey) {
        await utapi.deleteFiles(metadata.currentImageKey);
      }
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
