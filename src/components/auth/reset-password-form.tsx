"use client";

import { AuthErrorMessage } from "@/components/auth/auth-error";
import { FormError } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/client/auth";
import { cn } from "@/lib/utils";
import { ResetPasswordSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ResetPasswordFormProps {
  className?: string;
}

export function ResetPasswordForm({ className }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [error, setError] = useState<string>("");

  const { mutate: ResetPassword, isPending: ResetPasswordIsPending } =
    useMutation({
      mutationFn: async (values: z.infer<typeof ResetPasswordSchema>) => {
        const { error } = await auth.resetPassword({
          newPassword: values.password,
          token: params.get("token") ?? undefined,
          // TODO: revoke sessions
        });

        console.log("error", error);

        if (error) {
          return { success: false, error: error };
        } else {
          return { success: true, error: null };
        }
      },
      onSuccess: (data) => {
        if (!data.success && data.error) {
          switch (data.error.status) {
            case 400: {
              if (data.error.code === "INVALID_TOKEN") {
                params.set("error", "INVALID_TOKEN");
              } else {
                params.set("error", "Unknown");
              }
              break;
            }
            default: {
              params.set("error", "Unknown");
              break;
            }
          }

          router.push(`/auth/forgot-password/?error=${params.get("error")}`);
        } else {
          router.push("/auth/sign-in");
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
      onSettled: () => {
        form.reset();
      },
    });

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
    ResetPassword(values);
  };

  const { setFocus } = form;

  // Focus email field when an error is set
  useEffect(() => {
    if (error) {
      setFocus("password");
    }
  }, [error, setFocus]);

  return (
    <div className={cn("flex flex-col justify-center gap-1 p-4", className)}>
      <div className="space-y-2 text-left">
        <h1 className="text-3xl">Change Your Password</h1>
        <p className="pb-2">Type in your new password for your account</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="password"
                      {...field}
                      type="password"
                      disabled={ResetPasswordIsPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <Button
              className="w-full cursor-pointer"
              variant="default"
              type="submit"
              disabled={ResetPasswordIsPending}
            >
              Reset Password
            </Button>
          </div>
        </form>
      </Form>
      <AuthErrorMessage className="mt-4" />
    </div>
  );
}
