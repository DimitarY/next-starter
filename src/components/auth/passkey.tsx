"use client";

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/client/auth";

export function PasskeySignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // The passkey is rotated, and next time the user can't log in with passkey if
  // he did not log in with another provider or with passkey manually
  useEffect(() => {
    if (
      !("PublicKeyCredential" in window) ||
      !PublicKeyCredential.isConditionalMediationAvailable ||
      !PublicKeyCredential.isConditionalMediationAvailable()
    ) {
      return;
    }

    void auth.signIn.passkey({
      autoFill: true,
      fetchOptions: {
        onSuccess() {
          router.refresh();
        },
        onError(context) {
          console.error("Authentication failed:", context.error.message);
        },
      },
    });
  }, [router]);

  const handlePasskeyClick = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await auth.signIn.passkey({
        autoFill: true,
        fetchOptions: {
          onSuccess() {
            router.refresh();
          },
          onError(context) {
            console.error("Authentication failed:", context.error.message);
          },
        },
      });

      if (error) {
        console.error("Passkey sign-in error:", error.message);
      }
      return data;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <>
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
      <Button onClick={handlePasskeyClick} disabled={loading} variant="outline">
        <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
        {loading ? "Waiting for passkey…" : "Sign in with Passkey"}
      </Button>
    </>
  );
}
