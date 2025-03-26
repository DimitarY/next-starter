"use client";

import { FormError, FormSuccess } from "@/components/form-message";
import { ModuleWrapper } from "@/components/profile/common";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  GeneralSettings_ProfileEmail,
  GeneralSettings_ProfileName,
  SecuritySettings_EmailVerification,
} from "@/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { User } from "better-auth/types";
import { CircleCheckBig, TriangleAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

function ChangeName({ className, user }: { className?: string; user: User }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { mutate: UpdateName, isPending: UpdateNameIsPending } = useMutation({
    mutationFn: async (values: z.infer<typeof GeneralSettings_ProfileName>) => {
      if (values.name === user.name) {
        return {
          success: false,
          error: null,
          message: "New name is the same",
        };
      }

      const { error } = await auth.updateUser({
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
      setSuccess("");
      setError("");

      if (params.get("error")) {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        params.delete("error");
        router.push(`?${params.toString()}`);
      }
    },
    onSuccess: (data) => {
      if (!data.success && data.error) {
        switch (data.error.status) {
          case 429: {
            setError("Too many requests. Please try again later.");
            break;
          }
          default: {
            params.set("error", "Unknown");
            break;
          }
        }

        router.push(`?${params.toString()}`);
      } else if (!data.success && data.message) {
        setError(data.message);
      } else {
        setSuccess("Profile information updated successfully");
      }
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
  });

  const form = useForm<z.infer<typeof GeneralSettings_ProfileName>>({
    resolver: zodResolver(GeneralSettings_ProfileName),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof GeneralSettings_ProfileName>,
  ) => {
    UpdateName(values);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    form.reset();

    if (error || success) {
      timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);

      if (success) {
        router.refresh();
      }
    }

    // Cleanup both timers
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, form, router, success]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <h2 className="text-xl font-bold">Change profile name</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-row justify-between gap-2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    disabled={UpdateNameIsPending}
                    placeholder={user.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            variant="default"
            className="cursor-pointer"
            type="submit"
            disabled={UpdateNameIsPending}
          >
            Save changes
          </Button>
        </form>
      </Form>
      <FormSuccess message={success} />
      <FormError message={error} />
    </div>
  );
}

function ChangeEmail({ className, user }: { className?: string; user: User }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { mutate: UpdateEmail, isPending: UpdateEmailIsPending } = useMutation({
    mutationFn: async (
      values: z.infer<typeof GeneralSettings_ProfileEmail>,
    ) => {
      if (values.email === user.email) {
        return {
          success: false,
          error: null,
          message: "New email is the same",
        };
      }

      const { error } = await auth.changeEmail({
        newEmail: values.email,
        callbackURL: window.location.href,
      });

      console.log("error", error);

      if (error) {
        return { success: false, error: error };
      } else {
        return { success: true, error: null };
      }
    },
    onMutate: () => {
      setSuccess("");
      setError("");

      if (params.get("error")) {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        params.delete("error");
        router.push(`?${params.toString()}`);
      }
    },
    onSuccess: (data) => {
      if (!data.success && data.error) {
        switch (data.error.status) {
          case 400: {
            if (data.error.code === "CHANGE_EMAIL_IS_DISABLED") {
              params.set("error", "Configuration");
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

        router.push(`?${params.toString()}`);
      } else if (!data.success && data.message) {
        setError(data.message);
      } else {
        setSuccess(
          user.emailVerified
            ? "Email approval has been sent! Please check your inbox."
            : "Your email has been changed!",
        );
      }
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
  });

  const form = useForm<z.infer<typeof GeneralSettings_ProfileEmail>>({
    resolver: zodResolver(GeneralSettings_ProfileEmail),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof GeneralSettings_ProfileEmail>,
  ) => {
    UpdateEmail(values);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    form.reset();

    if (error || success) {
      timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);

      if (success) {
        router.refresh();
      }
    }

    // Cleanup both timers
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, form, router, success]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <h2 className="text-xl font-bold">Change profile email</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-row justify-between gap-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    disabled={UpdateEmailIsPending}
                    placeholder={user.email}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            variant="default"
            className="cursor-pointer"
            type="submit"
            disabled={UpdateEmailIsPending}
          >
            Save changes
          </Button>
        </form>
      </Form>
      <FormSuccess message={success} />
      <FormError message={error} />
    </div>
  );
}

function VerifyEmail({ className, user }: { className?: string; user: User }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [error, setError] = useState<string>("");

  const { mutate: VerifyEmail, isPending: VerifyEmailIsPending } = useMutation({
    mutationFn: async (
      values: z.infer<typeof SecuritySettings_EmailVerification>,
    ) => {
      const { error } = await auth.sendVerificationEmail({
        email: values.email,
        callbackURL: window.location.href,
      });

      console.log("error", error);

      if (error) {
        return { success: false, error: error };
      } else {
        return { success: true, error: null };
      }
    },
    onMutate: () => {
      setError("");

      if (params.get("error")) {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        params.delete("error");
        router.push(`?${params.toString()}`);
      }
    },
    onSuccess: (data) => {
      if (!data.success && data.error) {
        switch (data.error.status) {
          case 429: {
            setError("Too many requests. Please try again later.");
            break;
          }
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

        router.replace(`?${params.toString()}`);
      } else {
        toast("Verification email sent! Please check your inbox.");
      }
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
  });

  const form = useForm<z.infer<typeof SecuritySettings_EmailVerification>>({
    resolver: zodResolver(SecuritySettings_EmailVerification),
    defaultValues: {
      email: user.email,
    },
  });

  const onSubmit = async (
    values: z.infer<typeof SecuritySettings_EmailVerification>,
  ) => {
    VerifyEmail(values);
  };

  return (
    <div className={cn("flex flex-col justify-center gap-1 p-4", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="space-y-4">
            <Button
              variant="default"
              className="w-full cursor-pointer"
              type="submit"
              disabled={VerifyEmailIsPending}
            >
              {VerifyEmailIsPending ? "Sending..." : "Send Verification Email"}
            </Button>
            <FormError message={error} />
          </div>
        </form>
      </Form>
    </div>
  );
}

export function GeneralSettings({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>
          Update your account details and manage profile information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ModuleWrapper>
          <ChangeName user={user} />
          <ChangeEmail user={user} />
          {(!user.emailVerified && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <TriangleAlert className="text-yellow-500" />
                <p>Email Not Verified</p>
              </div>
              <VerifyEmail user={user} />
            </div>
          )) || (
            <div className="flex items-center gap-2">
              <CircleCheckBig className="text-emerald-500" />
              <p>Email Verified</p>
            </div>
          )}
        </ModuleWrapper>
      </CardContent>{" "}
      <CardFooter className="flex flex-col justify-start gap-2 border-t px-6 py-4 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Use this section to customize your account and profile settings.
        </p>
      </CardFooter>
    </Card>
  );
}
