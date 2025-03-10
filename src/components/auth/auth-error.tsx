"use client";

import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

enum Error {
  Configuration = "Configuration",
  AccountNotLinked = "account_not_linked",
  AccessDenied = "AccessDenied",
  Verification = "Verification",
  Unknown = "Unknown",
}

const errorMap = {
  [Error.Configuration]: (
    <p>
      We&#39;re experiencing a technical issue. Please try again later or
      contact support if the problem continues.
    </p>
  ),
  [Error.AccountNotLinked]: (
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
  // FIXME: Not implemented
  [Error.Verification]: (
    <p>
      Your verification link is no longer valid. It may have expired or already
      been used. Please request a new one.
    </p>
  ),
  [Error.Unknown]: (
    <p>
      Something went wrong. Please try again or reach out to support if you
      continue to experience this issue.
    </p>
  ),
};

interface AuthErrorMessageProps {
  className?: string;
}

// FIXME: Need to integrate this with better-auth
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
        <div className="bg-destructive text-destructive flex w-full max-w-sm flex-col items-center justify-center rounded-lg border border-gray-200 p-6 text-center">
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
