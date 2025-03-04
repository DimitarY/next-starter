"use client";

import { AuthErrorMessage } from "@/components/auth/auth-error";
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons";
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
import { RegisterSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { z } from "zod";

interface SignUpFormProps {
  className?: string;
}

export function SignUpForm({ className }: SignUpFormProps) {
  const router = useRouter();
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const {
    mutate: server_RegisterAction,
    isPending: server_RegisterActionIsPending,
  } = useMutation({
    mutationFn: async (values: z.infer<typeof RegisterSchema>) => {
      const { error } = await auth.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      // FIXME: Fix thee error message
      // TODO: Redirect is not working
      if (error) {
        return { success: false, error: error.message as string };
      } else {
        return { success: true, error: "An unexpected error occurred" };
      }
    },
    onMutate: () => {
      setSuccess("");
      setError("");
    },
    onSuccess: async (data) => {
      if (!data.success) {
        setError(data.error);
      } else {
        setSuccess("Registration successful");

        router.push("/auth/sign-in");
      }
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
    onSettled: () => {
      form.setValue("password", "");
      setPasswordVisible(false);
    },
  });

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    server_RegisterAction(values);
  };

  const { setFocus } = form;

  // Focus password field when an error is set
  useEffect(() => {
    if (error) {
      setFocus("password");
    }
  }, [error, setFocus]);

  return (
    <div className={cn("flex flex-col justify-center gap-1 p-4", className)}>
      <div className="space-y-2 text-left">
        <h1 className="text-3xl">Get started</h1>
        <p className="">Create a new account</p>
      </div>
      <Suspense>
        <AuthSocialButtons />
      </Suspense>
      <div className="mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:grow before:bg-stone-400 after:ml-4 after:block after:h-px after:grow after:bg-stone-400">
        or
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={server_RegisterActionIsPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      {...field}
                      type="email"
                      disabled={server_RegisterActionIsPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  {/*TODO: Add password strength meter*/}
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="password"
                        {...field}
                        type={passwordVisible ? "text" : "password"}
                        disabled={server_RegisterActionIsPending}
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute top-2 right-2 pr-1 text-gray-500"
                      >
                        {passwordVisible ? (
                          <FaEyeSlash className="size-5" />
                        ) : (
                          <FaEye className="size-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormSuccess message={success} />
            <FormError message={error} />
            <Button
              className="w-full"
              variant="default"
              type="submit"
              disabled={server_RegisterActionIsPending}
            >
              Register
            </Button>
          </div>
        </form>
      </Form>
      <div className="mt-1 gap-1 text-center text-sm font-medium">
        <span>Have an account? </span>
        <Link href="/auth/sign-in" className="underline">
          Sign in
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
