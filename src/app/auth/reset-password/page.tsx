import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ResetPassword({ searchParams }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  const params = await searchParams;

  if (params.error || !params.token) {
    redirect(`/auth/forgot-password/?error=${params.error}`);
  }

  return (
    <div className="mx-6 mt-2 flex flex-row items-center justify-center gap-2">
      <ResetPasswordForm className="rounded-lg bg-linear-to-br from-slate-200 to-slate-300 p-4 dark:from-zinc-800 dark:to-zinc-900 dark:text-white" />
    </div>
  );
}
