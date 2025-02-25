import ProfileInfo from "@/components/profile/profile-info";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Settings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <ProfileInfo
      className="mx-auto max-w-4xl"
      name={session.user.name}
      image={session.user.image}
      joinedAt={session.user.createdAt}
      selfView={true}
    />
  );
}
