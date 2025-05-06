import ProfileInfo from "@/components/profile/profile-info";
import { db, user } from "@/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProfileView({ params }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const resolvedParams = await params;

  if (session && session.user.id === resolvedParams.id) {
    redirect("/profile");
  }

  const userObjArray = await db // Changed to userObjArray
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      joinedAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, resolvedParams.id));

  if (userObjArray.length === 0) {
    notFound();
  }

  const userObj = userObjArray[0];

  return (
    <ProfileInfo
      className="mx-auto max-w-4xl"
      name={userObj.name}
      image={userObj.image}
      joinedAt={userObj.joinedAt}
    />
  );
}
