"use client";

import { LoginAction, MagicLinkAction } from "@/actions/auth";
import { navigate } from "@/actions/navigate";
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
import { cn } from "@/lib/utils";
import { LoginSchema, MagicLinkSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface SignInFormProps {
  className?: string;
}

function MagicLinkForm({
  onShowCredentials,
}: {
  onShowCredentials: (email: string) => void;
}) {
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const {
    mutate: server_MagicLinkAction,
    isPending: server_MagicLinkIsPending,
  } = useMutation({
    mutationFn: MagicLinkAction,
    onMutate: () => {
      setError("");
    },
    onSuccess: async (data) => {
      if (!data.success) {
        setError(data.error);
      } else {
        if (data.useCredentials) {
          // Call the function to show the CredentialsForm and pass the email
          onShowCredentials(form.getValues().email);
        } else {
          setSuccess("Magic link has been sent");
        }
      }
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
  });

  const form = useForm<z.infer<typeof MagicLinkSchema>>({
    resolver: zodResolver(MagicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof MagicLinkSchema>) => {
    server_MagicLinkAction(values);
  };

  const { setFocus } = form;

  // Focus password field when an error is set
  useEffect(() => {
    if (error) {
      setFocus("email");
    }
  }, [error, setFocus]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="space-y-4">
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
                    disabled={server_MagicLinkIsPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            className="w-full"
            variant="default"
            type="submit"
            disabled={server_MagicLinkIsPending}
          >
            Login
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CredentialsForm({ email }: { email?: string }) {
  const search = useSearchParams();
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { mutate: server_LoginAction, isPending: server_LoginActionIsPending } =
    useMutation({
      mutationFn: LoginAction,
      onMutate: () => {
        setError("");
      },
      onSuccess: async (data) => {
        if (!data.success) {
          setError(data.error);
        } else {
          setSuccess(true);
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
      onSettled: () => {
        form.setValue("password", "");
      },
    });

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: email ?? "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    server_LoginAction(values);
  };

  const { setFocus } = form;

  // Redirect to the callbackUrl or the home page after successful login
  useEffect(() => {
    const performRedirect = async () => {
      if (success) {
        const callbackUrl = search.get("callbackUrl");
        await navigate(callbackUrl || "/");
      }
    };

    performRedirect();
  }, [success]);

  // Focus password field when email is provided
  useEffect(() => {
    if (email) {
      setFocus("password");
    }
  }, [email, setFocus]);

  // Focus password field when an error is set
  useEffect(() => {
    if (error) {
      setFocus("password");
    }
  }, [error, setFocus]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="space-y-4">
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
                    disabled={server_LoginActionIsPending}
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
                <FormControl>
                  <Input
                    placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;"
                    {...field}
                    type="password"
                    disabled={server_LoginActionIsPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <Button
            className="w-full"
            variant="default"
            type="submit"
            disabled={server_LoginActionIsPending}
          >
            Login
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function SignInForm({ className }: SignInFormProps) {
  const [credentialLogin, setCredentialsLogin] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  // This function is passed to the MagicLinkForm to update the state when credentials are required
  const handleShowCredentials = (email: string) => {
    setCredentialsLogin(true);
    setEmail(email);
  };

  return (
    <div className={cn("flex flex-col justify-center gap-1 p-4", className)}>
      <div className="space-y-2 text-left">
        <h1 className="text-3xl">Welcome back</h1>
        <p className="">Sign in to your account</p>
      </div>
      <Suspense>
        <AuthSocialButtons />
      </Suspense>
      <div className="mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400">
        or
      </div>
      {credentialLogin ? (
        <CredentialsForm email={email} />
      ) : (
        <MagicLinkForm onShowCredentials={handleShowCredentials} />
      )}{" "}
      <div className="mt-1 gap-1 text-center text-sm font-medium">
        <div>
          <span>Don&#39;t have an account? </span>
          <Link href="/auth/sign-up" className="underline">
            Sign up
          </Link>
        </div>
        <Link href="/auth/forgot-password">Forgot password?</Link>
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
