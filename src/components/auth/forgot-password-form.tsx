"use client";

import { AuthErrorMessage } from "@/components/auth/auth-error";
import { FormError, FormSuccess } from "@/components/form-message";
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
import { ForgotPasswordSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ForgotPasswordFormProps {
  className?: string;
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { mutate: ForgotPassword, isPending: ForgotPasswordIsPending } =
    useMutation({
      // FIXME: There is a server side error when user with given mail is not found but client side is passing
      mutationFn: async (values: z.infer<typeof ForgotPasswordSchema>) => {
        const { error } = await auth.forgetPassword({
          email: values.email,
          redirectTo: "/auth/reset-password",
        });

        // TODO: Error handling is not tested
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

        setError("");

        router.push(`?${params.toString()}`);
      },
      onSuccess: (data) => {
        if (!data.success && data.error) {
          switch (data.error.status) {
            case 500: {
              if (data.error.statusText === "Internal Server Error") {
                params.set("error", "Configuration");
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
        } else {
          setSuccess("Password reset email sent! Please check your inbox.");
        }

        router.replace(`?${params.toString()}`);
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
      onSettled: () => {
        form.setValue("email", "");
      },
    });

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ForgotPasswordSchema>) => {
    ForgotPassword(values);
  };

  const { setFocus } = form;

  // Focus email field when an error is set
  useEffect(() => {
    if (error) {
      setFocus("email");
    }
  }, [error, setFocus]);

  return (
    <div className={cn("flex flex-col justify-center gap-1 p-4", className)}>
      <div className="space-y-2 text-left">
        <h1 className="text-3xl">Reset Your Password</h1>
        <p className="pb-2">
          Type in your email and we&#39;ll send you a link to reset your
          password
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      {...field}
                      type="email"
                      disabled={ForgotPasswordIsPending}
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
              disabled={ForgotPasswordIsPending}
            >
              Send Reset Email
            </Button>
          </div>
        </form>
      </Form>
      <AuthErrorMessage className="mt-4" />
    </div>
  );
}
