"use client";

import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

enum Error {
  Configuration = "Configuration",
  OAuthAccountNotLinked = "OAuthAccountNotLinked",
  AccessDenied = "AccessDenied",
  Verification = "Verification",
  Default = "Default",
}

const errorMap = {
  [Error.Configuration]: (
    <p>
      We're experiencing a technical issue. Please try again later or contact
      support if the problem continues.
    </p>
  ),
  [Error.OAuthAccountNotLinked]: (
    <p>
      It looks like your email is already linked to another account. Please sign
      in using the provider you used before.
    </p>
  ),
  [Error.AccessDenied]: (
    <p>
      You don’t have permission to access this feature. If this was unexpected,
      please contact support for assistance.
    </p>
  ),
  [Error.Verification]: (
    <p>
      Your verification link is no longer valid. It may have expired or already
      been used. Please request a new one.
    </p>
  ),
  [Error.Default]: (
    <p>
      Something went wrong. Please try again or reach out to support if you
      continue to experience this issue.
    </p>
  ),
};

interface AuthErrorMessageProps {
  className?: string;
}

function AuthError({ className }: AuthErrorMessageProps) {
  const search = useSearchParams();
  const error = search.get("error") as Error;

  if (error != null) {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center",
          className,
        )}
      >
        <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-lg border border-gray-200 bg-destructive p-6 text-center text-destructive">
          <h5 className="mb-2 flex flex-row items-center justify-center gap-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Oops! Something went wrong
          </h5>
          <div className="font-normal text-gray-700 dark:text-gray-400">
            {errorMap[error] || "Please contact us if this error persists."}
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export function AuthErrorMessage({ className }: AuthErrorMessageProps) {
  return (
    <Suspense>
      <AuthError className={className} />
    </Suspense>
  );
}
