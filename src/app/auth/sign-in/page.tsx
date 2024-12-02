import { SignInForm } from "@/components/auth/signin-form";
import Auth from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Signup() {
  const session = await Auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="mx-6 mt-2 flex flex-row items-center justify-center gap-2">
      <Suspense>
        <SignInForm className="rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 p-4 dark:from-zinc-800 dark:to-zinc-900 dark:text-white" />
      </Suspense>
    </div>
  );
}
