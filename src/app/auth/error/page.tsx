import { AuthErrorMessage } from "@/components/auth/auth-error";
import auth from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthError() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="h-full-without-header flex w-full flex-col items-center justify-center">
      <AuthErrorMessage />
    </div>
  );
}
