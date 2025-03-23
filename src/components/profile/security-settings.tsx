"use client";

import { EnableMagicLinkAction, SetPasswordAction } from "@/actions/auth";
import { FormError, FormSuccess } from "@/components/form-message";
import { ModuleWrapper } from "@/components/profile/common";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/client/auth";
import { cn } from "@/lib/utils";
import {
  SecuritySettings_Password,
  SecuritySettings_SetPassword,
} from "@/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Session } from "better-auth";
import { AlertCircle, TriangleAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { VscGithubAlt } from "react-icons/vsc";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import { z } from "zod";

function PasswordUpdateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const {
    mutate: server_PasswordUpdateAction,
    isPending: server_PasswordUpdateIsPending,
  } = useMutation({
    mutationFn: async (values: z.infer<typeof SecuritySettings_Password>) => {
      if (values.currentPassword === values.newPassword) {
        return {
          success: false,
          error: null,
          message: "New password can't be the same as the current password",
        };
      }

      const { error } = await auth.changePassword({
        newPassword: values.newPassword,
        currentPassword: values.currentPassword,
        revokeOtherSessions: values.revokeOtherSessions,
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
    onSuccess: async (data) => {
      const original_params = params;

      if (!data.success && data.error) {
        switch (data.error.status) {
          case 400: {
            if (data.error.code === "INVALID_PASSWORD") {
              setError("Invalid password. Please try again.");
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

        if (original_params.toString() !== params.toString()) {
          router.push(`?${params.toString()}`);
        }
      } else if (!data.success && data.message) {
        setError(data.message);
      } else {
        router.refresh();
      }
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
    onSettled: () => {
      form.reset();
      setPasswordVisible(false);
    },
  });

  const form = useForm<z.infer<typeof SecuritySettings_Password>>({
    resolver: zodResolver(SecuritySettings_Password),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: false,
    },
  });

  const onSubmit = async (
    values: z.infer<typeof SecuritySettings_Password>,
  ) => {
    server_PasswordUpdateAction(values);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    form.reset();

    if (error || success) {
      timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
    }

    if (success) {
      router.refresh();
    }

    // Cleanup both timers
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, form, router, success]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  disabled={server_PasswordUpdateIsPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              {/*TODO: Add password strength meter*/}
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={passwordVisible ? "text" : "password"}
                    disabled={server_PasswordUpdateIsPending}
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  disabled={server_PasswordUpdateIsPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSuccess message={success} />
        <FormError message={error} />
        <Button
          variant="default"
          className="cursor-pointer"
          type="submit"
          disabled={server_PasswordUpdateIsPending}
        >
          Update password
        </Button>
      </form>
    </Form>
  );
}

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { mutate: server_SetPassword, isPending: server_SetPasswordIsPending } =
    useMutation({
      mutationFn: SetPasswordAction,
      onMutate: () => {
        setSuccess("");
        setError("");

        if (params.get("error")) {
          // eslint-disable-next-line drizzle/enforce-delete-with-where
          params.delete("error");
          router.push(`?${params.toString()}`);
        }
      },
      onSuccess: async (success) => {
        if (!success) {
          setError("An unexpected error occurred. Please try again.");
        } else {
          router.refresh();
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
      onSettled: () => {
        form.reset();
      },
    });

  const form = useForm<z.infer<typeof SecuritySettings_SetPassword>>({
    resolver: zodResolver(SecuritySettings_SetPassword),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof SecuritySettings_SetPassword>,
  ) => {
    server_SetPassword(values);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    form.reset();

    if (error || success) {
      timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
    }

    if (success) {
      router.refresh();
    }

    // Cleanup both timers
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, form, router, success]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Set Password</FormLabel>
              {/*TODO: Add password strength meter*/}
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  disabled={server_SetPasswordIsPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  disabled={server_SetPasswordIsPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSuccess message={success} />
        <FormError message={error} />
        <Button
          variant="default"
          className="cursor-pointer"
          type="submit"
          disabled={server_SetPasswordIsPending}
        >
          Set Password
        </Button>
      </form>
    </Form>
  );
}

interface EnableMagicLinkProps {
  className?: string;
  isMagicLinkEnabled: boolean;
}

function EnableMagicLink({
  className,
  isMagicLinkEnabled,
}: EnableMagicLinkProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [useMagicLink, setUseMagicLink] = useState<boolean>(isMagicLinkEnabled);

  const {
    mutate: server_EnableMagicLink,
    isPending: server_EnableMagicLinkIsPending,
  } = useMutation({
    mutationFn: EnableMagicLinkAction,
    onMutate: () => {
      if (params.get("error")) {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        params.delete("error");
        router.push(`?${params.toString()}`);
      }
    },
    onSuccess: async (magicLinkEnabled) => {
      setUseMagicLink(magicLinkEnabled);

      router.refresh();
      toast("Success!", {
        description: magicLinkEnabled
          ? "Magic link login enabled. Password sign-in is now disabled."
          : "Magic link login disabled. Password sign-in is enabled.",
      });
    },
    onError: () => {
      toast("Error!", {
        description: "An unexpected error occurred. Please try again.",
      });
    },
  });

  return (
    <div className={cn("flex flex-col justify-center gap-4 p-2", className)}>
      {useMagicLink && (
        <div className="flex items-center gap-2">
          <TriangleAlert className="text-yellow-500" />
          <p>Password Sign-In is disabled</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-medium">Magic Link Login</p>
          <p className="text-muted-foreground text-sm">
            Enable magic link login. Password login will be disabled.
          </p>
          <p className="text-muted-foreground text-sm">
            Note: When magic link login is enabled, you will no longer be able
            to log in using your password.
          </p>
        </div>
        <Button
          variant={useMagicLink ? "destructive" : "default"}
          className="cursor-pointer"
          onClick={() => {
            server_EnableMagicLink({ enable: !isMagicLinkEnabled });
          }}
          disabled={server_EnableMagicLinkIsPending}
        >
          {useMagicLink ? "Disable Magic Link" : "Enable Magic Link"}
        </Button>
      </div>
    </div>
  );
}

interface ConnectSocialButtonsProps {
  className?: string;
  connectedAccounts: { accountId: string; providerId: string }[];
}

function ConnectSocialButtons({
  className,
  connectedAccounts,
}: ConnectSocialButtonsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [error, setError] = useState<string>("");

  const { mutate: ConnectAccount, isPending: ConnectAccountIsPending } =
    useMutation({
      mutationFn: async (provider: "google" | "github") => {
        const { error } = await auth.linkSocial({
          provider: provider,
          callbackURL: window.location.href,
        });

        console.log("error", error);

        if (error) {
          return { success: false, error: "An unexpected error occurred" };
        } else {
          return { success: true, error: "" };
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
      onSuccess: async (data) => {
        if (!data.success) {
          setError(data.error);
        } else {
          router.refresh();
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
    });

  const { mutate: DisconnectAccount, isPending: DisconnectAccountIsPending } =
    useMutation({
      mutationFn: async (values: { providerId: string; accountId: string }) => {
        const { error } = await auth.unlinkAccount({
          providerId: values.providerId,
          accountId: values.accountId,
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
      onSuccess: async (data) => {
        if (!data.success && data.error) {
          switch (data.error.status) {
            case 400: {
              if (data.error.code === "YOU_CANT_UNLINK_YOUR_LAST_ACCOUNT") {
                setError(
                  "Your can not disconnect from every account without using password or other authentication methods!",
                );
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

          router.push(`?${params.toString()}`);
        } else {
          router.refresh();
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
    });

  const onClick = (provider: "google" | "github") => {
    const account = connectedAccounts.find(
      (account) => account.providerId === provider,
    );

    if (account) {
      DisconnectAccount({
        providerId: account.providerId,
        accountId: account.accountId,
      });
    } else {
      ConnectAccount(provider);
    }
  };

  return (
    <div className={cn("grid w-full items-center gap-2", className)}>
      {error && (
        <Alert variant="destructive" className="bg-popover border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        size="lg"
        className="w-full cursor-pointer rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 dark:border-gray-600 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        variant="link"
        onClick={() => onClick("google")}
        disabled={ConnectAccountIsPending || DisconnectAccountIsPending}
      >
        <FcGoogle className="size-5" />{" "}
        {connectedAccounts.some((account) => account.providerId === "google")
          ? "Disconnect from"
          : "Connect with"}{" "}
        Google
      </Button>
      <Button
        size="lg"
        className="w-full cursor-pointer rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 dark:border-gray-600 dark:bg-black dark:text-white dark:hover:bg-gray-800"
        variant="link"
        onClick={() => onClick("github")}
        disabled={ConnectAccountIsPending || DisconnectAccountIsPending}
      >
        <VscGithubAlt className="size-5" />
        {connectedAccounts.some((account) => account.providerId === "github")
          ? "Disconnect from"
          : "Connect with"}{" "}
        Github
      </Button>
    </div>
  );
}

interface SessionManagementProps {
  className?: string;
  session: Session;
  sessionsList: Session[];
}

function SessionManagement({
  className,
  session,
  sessionsList,
}: SessionManagementProps) {
  const router = useRouter();

  const handleSignOut = async (sessionToken?: string) => {
    if (sessionToken) {
      await auth.revokeSession({
        token: sessionToken,
      });
    } else {
      await auth.revokeOtherSessions();
    }

    // TODO: Revoke cached session cookie

    router.refresh();
  };

  return (
    <div className={cn("flex flex-col gap-6 p-6", className)}>
      <h2 className="text-xl font-bold">Active Sessions</h2>
      <div className="space-y-4">
        {sessionsList.map((userSession) => {
          const parser = new UAParser();

          parser.setUA(userSession.userAgent || "");

          const { browser, os, device } = parser.getResult();
          const deviceType = device.type === "mobile" ? "Phone" : "PC";
          const isCurrentSession = userSession.id === session.id;

          const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;

          const formattedCreatedAt = new Date(
            userSession.createdAt,
          ).toLocaleString(userLocale);
          const formattedExpiresAt = new Date(
            userSession.expiresAt,
          ).toLocaleString(userLocale);

          return (
            <Card
              key={userSession.id}
              className={isCurrentSession ? "border-primary border-2" : ""}
            >
              <CardContent className="space-y-2 p-4">
                <p className="text-sm">
                  <strong>IP Address:</strong> {userSession.ipAddress}
                </p>
                <p className="text-sm">
                  <strong>Device:</strong> {deviceType} (
                  {device.model || "Unknown Model"})
                </p>
                <p className="text-sm">
                  <strong>Operating System:</strong> {os.name ?? "Unknown OS"}
                </p>
                <p className="text-sm">
                  <strong>Browser:</strong> {browser.name ?? "Unknown Browser"}
                </p>
                <p className="text-sm">
                  <strong>Created At:</strong> {formattedCreatedAt}
                </p>
                <p className="text-sm">
                  <strong>Expires At:</strong> {formattedExpiresAt}
                </p>
                {isCurrentSession && (
                  <p className="text-primary font-semibold">
                    This is your current session
                  </p>
                )}
                {!isCurrentSession && (
                  <Button
                    variant="outline"
                    className="mt-2 w-full cursor-pointer"
                    onClick={() => handleSignOut(userSession.token)}
                  >
                    Sign out
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-medium">Sign out</p>
          <p className="text-muted-foreground text-sm">
            Sign out from all other devices
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => handleSignOut()}
        >
          Sign out from all devices
        </Button>
      </div>
    </div>
  );
}

interface SecuritySettingsProps {
  MagicLinkEnable: boolean;
  MagicLinkAllow: boolean;
  UsePassword: boolean;
  Accounts: { accountId: string; providerId: string }[];
  EmailVerified: boolean;
  Session: Session;
  SessionsList: Session[];
}

export function SecuritySettings({
  MagicLinkAllow,
  MagicLinkEnable,
  UsePassword,
  Accounts,
  Session,
  SessionsList,
}: SecuritySettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Manage your security preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <ModuleWrapper>
          {MagicLinkAllow && (
            <EnableMagicLink isMagicLinkEnabled={MagicLinkEnable} />
          )}
          {(MagicLinkAllow && MagicLinkEnable) ||
            (UsePassword && <PasswordUpdateForm />) || <SetPasswordForm />}
          <ConnectSocialButtons connectedAccounts={Accounts} />
          <SessionManagement session={Session} sessionsList={SessionsList} />
        </ModuleWrapper>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
