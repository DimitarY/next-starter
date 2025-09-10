"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/client/auth";

export function PasskeySignIn() {
  const router = useRouter();

  // FIXME: When user close the prompt for passkey from password manager
  // The passkey is rotated and next time user can't log in with passkey if he did not log in with other provider
  useEffect(() => {
    if (
      !PublicKeyCredential.isConditionalMediationAvailable ||
      !PublicKeyCredential.isConditionalMediationAvailable()
    ) {
      return;
    }

    // FIXME: https://github.com/better-auth/better-auth/issues/1587
    const result = auth.signIn.passkey(
      {
        autoFill: true,
      },
      {
        onSuccess: (ctx) => {
          console.log("onSuccess", ctx);
          if (!ctx.response.redirected) {
            router.refresh();
          }
        },
      },
    );
    console.log("result", result);
  }, [router]);

  return (
    <div className="hidden">
      <label htmlFor="name">Username:</label>
      <input type="text" name="name" autoComplete="username webauthn" />
      <label htmlFor="password">Password:</label>
      <input
        type="password"
        name="password"
        autoComplete="current-password webauthn"
      />
    </div>
  );
}
