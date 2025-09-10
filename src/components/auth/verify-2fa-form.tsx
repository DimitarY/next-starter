"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AuthErrorMessage } from "@/components/auth/auth-error";
import { FormError, FormSuccess } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/client/auth";
import { cn } from "@/lib/utils";
import { Verify2faSchema } from "@/schemas/auth";

interface Verify2faFormProps {
  className?: string;
}

export function Verify2faForm({ className }: Verify2faFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { mutate: Verify2faMutation, isPending: Verify2faMutationIsPending } =
    useMutation({
      mutationFn: async (values: z.infer<typeof Verify2faSchema>) => {
        const { error } = await auth.twoFactor.verifyTotp(
          {
            code: values.verify2fa,
          },
          {
            onSuccess: (ctx) => {
              if (!ctx.response.redirected) {
                router.refresh();
              }
            },
          },
        );

        console.log("error", error);

        if (error) {
          return { success: false, error: error };
        } else {
          return { success: true, error: null };
        }
      },
      onMutate: () => {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        params.delete("error");

        setSuccess("");
        setError("");

        router.replace(`?${params.toString()}`);
      },
      onSuccess: async (data) => {
        if (!data.success && data.error) {
          switch (data.error.status) {
            case 401: {
              if (data.error.code === "INVALID_TWO_FACTOR_COOKIE") {
                params.set("error", "TimedOut");
              } else if (
                data.error.code === "INVALID_TWO_FACTOR_AUTHENTICATION"
              ) {
                setError("Invalid two factor code");
              } else {
                params.set("error", "Unknown");
              }
              break;
            }
            case 403: {
              if (data.error.code === "INVALID_ORIGIN") {
                params.set("error", "Configuration");
              } else {
                params.set("error", "AccessDenied");
              }
              break;
            }
            case 429: {
              setError("Too many requests. Please try again later.");
              break;
            }
            default: {
              params.set("error", "Unknown");
              break;
            }
          }

          router.replace(`?${params.toString()}`);
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
      onSettled: () => {
        form.reset();
      },
    });

  const form = useForm<z.infer<typeof Verify2faSchema>>({
    resolver: zodResolver(Verify2faSchema),
    defaultValues: {
      verify2fa: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof Verify2faSchema>) => {
    Verify2faMutation(values);
  };

  const { setFocus } = form;

  // Focus password field when an error is set
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setFocus("verify2fa");
      }, 10); // Small delay ensures React updates first
    }
  }, [error, setFocus]);

  return (
    <div className={cn("flex flex-col justify-center gap-1 p-4", className)}>
      <div className="space-y-2 text-left">
        <h1 className="text-3xl">Two-Factor Authentication</h1>
        <p className="">Enter an authenticator app code or a recovery code:</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="verify2fa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Two-factor code"
                      {...field}
                      disabled={Verify2faMutationIsPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormSuccess message={success} />
            <FormError message={error} />
            <Button
              className="w-full cursor-pointer"
              variant="default"
              type="submit"
              disabled={Verify2faMutationIsPending}
            >
              Login
            </Button>
          </div>
        </form>
      </Form>
      <div className="mt-1 gap-1 text-center text-sm font-medium">
        <span>Lost all 2FA devices and backup codes?</span>{" "}
        <Link href="/auth/two-factor/recovery" className="underline">
          Try recovery
        </Link>
      </div>
      <AuthErrorMessage className="mt-4" />
      <span className="text-foreground-lighter mt-4 text-xs sm:text-center">
        By continuing, you agree to {siteConfig.name}{" "}
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>
        {" and "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        , and to receive periodic emails with updates.
      </span>
    </div>
  );
}
