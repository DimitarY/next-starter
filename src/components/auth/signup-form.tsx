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
import {
  PasswordInput,
  PasswordInputAdornmentToggle,
  PasswordInputInput,
} from "@/components/ui/password-input";
import { Progress } from "@/components/ui/progress";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/client/auth";
import { cn } from "@/lib/utils";
import { RegisterSchema } from "@/schemas/auth";
import {
  checkPasswordCriteria,
  getPasswordStrength,
  getStrengthColorClass,
  getStrengthLabel,
  getStrengthTextColorClass,
} from "@/utils/password-strength";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface SignUpFormProps {
  className?: string;
}

export function SignUpForm({ className }: SignUpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { mutate: RegisterMutation, isPending: RegisterMutationIsPending } =
    useMutation({
      mutationFn: async (values: z.infer<typeof RegisterSchema>) => {
        const { error } = await auth.signUp.email({
          email: values.email,
          password: values.password,
          name: values.name,
        });

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
            case 403: {
              if (data.error.code === "INVALID_ORIGIN") {
                params.set("error", "Configuration");
              } else {
                params.set("error", "AccessDenied");
              }
              break;
            }
            case 422: {
              if (data.error.code === "USER_ALREADY_EXISTS") {
                setError("User with this email already exists");
              } else {
                params.set("error", "Unknown");
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
        form.setValue("confirmPassword", "");
      },
    });

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setPasswordVisible(false);
    setConfirmPasswordVisible(false);

    RegisterMutation(values);
  };

  const { setFocus } = form;

  // Watch the password field for real-time strength calculation and criteria checking
  const password = form.watch("password");
  const passwordStrength = getPasswordStrength(password);
  const strengthLabel = getStrengthLabel(passwordStrength);
  const strengthColorClass = getStrengthColorClass(passwordStrength);
  const strengthTextColorClass = getStrengthTextColorClass(passwordStrength);

  const passwordCriteria = checkPasswordCriteria(password);

  // Focus password field when an error is set
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setFocus("password");
      }, 10); // Small delay ensures React updates first
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
                      disabled={RegisterMutationIsPending}
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
                      disabled={RegisterMutationIsPending}
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
                  <PasswordInput
                    visible={passwordVisible}
                    onVisibleChange={setPasswordVisible}
                  >
                    <FormControl>
                      <PasswordInputInput
                        autoComplete="new-password"
                        placeholder="Password"
                        {...field}
                        disabled={RegisterMutationIsPending}
                      />
                    </FormControl>
                    <PasswordInputAdornmentToggle />
                  </PasswordInput>
                  <div className="mt-2 space-y-1">
                    <Progress
                      value={passwordStrength}
                      className={cn("h-2", strengthColorClass)}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        strengthTextColorClass,
                      )}
                    >
                      {strengthLabel}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {passwordCriteria.map((criterion, index) => (
                      <li
                        key={index}
                        className={cn(
                          "flex items-center gap-2",
                          criterion.isValid ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {criterion.isValid ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        <span>{criterion.label}</span>
                      </li>
                    ))}
                  </ul>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <PasswordInput
                    visible={confirmPasswordVisible}
                    onVisibleChange={setConfirmPasswordVisible}
                  >
                    <FormControl>
                      <PasswordInputInput
                        autoComplete="new-password"
                        placeholder="Confirm Password"
                        {...field}
                        disabled={RegisterMutationIsPending}
                      />
                    </FormControl>
                    <PasswordInputAdornmentToggle />
                  </PasswordInput>
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
              disabled={RegisterMutationIsPending}
            >
              Register
            </Button>
          </div>
        </form>
      </Form>
      <div className="mt-1 gap-1 text-center text-sm font-medium">
        <span>Have an account?</span>{" "}
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
