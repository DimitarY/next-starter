import { Recover2faForm } from "@/components/auth/recover-2fa-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Signup() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <div className="mx-6 mt-2 flex flex-row items-center justify-center gap-2">
      <Suspense>
        <Recover2faForm className="rounded-lg bg-linear-to-br from-slate-200 to-slate-300 p-4 dark:from-zinc-800 dark:to-zinc-900 dark:text-white" />
      </Suspense>
    </div>
  );
}
