"use client";

import { AuthErrorMessage } from "@/components/auth/auth-error";
import { FormError, FormSuccess } from "@/components/form-message";
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
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/client/auth";
import { cn } from "@/lib/utils";
import {
  SecuritySettings_Password,
  SecuritySettings_SetPassword,
} from "@/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { VscGithubAlt } from "react-icons/vsc";
import { z } from "zod";

interface ConnectSocialButtonsProps {
  className?: string;
  connectedAccounts: string[];
  usePassword: boolean;
  emailVerified: boolean;
  magicLinkEnabled: boolean;
}

export function ConnectSocialButtons({
  className,
  connectedAccounts,
  usePassword,
  emailVerified,
  magicLinkEnabled,
}: ConnectSocialButtonsProps) {
  const [error, setError] = useState<string | undefined>("");

  const router = useRouter();

  const {
    mutate: server_DisconnectAccountAction,
    isPending: server_DisconnectAccountActionIsPending,
  } = useMutation({
    mutationFn: async (provider: string) => {
      const { error } = await auth.unlinkAccount({
        providerId: provider,
      });

      if (error) {
        return { success: false, error: "An unexpected error occurred" };
      } else {
        return { success: true, error: "" };
      }
    },
    onMutate: () => {
      setError("");
    },
    // onSuccess: async (data) => {
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

  const onClick = (provider: "google" | "github") => {
    setError("");

    if (connectedAccounts.includes(provider)) {
      if (
        connectedAccounts.length > 1 ||
        (emailVerified && magicLinkEnabled) ||
        usePassword
      ) {
        server_DisconnectAccountAction(provider);
      } else {
        setError(
          "Your can not disconnect from every account without using magic link or password!",
        );
      }
    } else {
      auth.linkSocial({
        provider: provider,
        callbackURL: window.location.href,
      });
    }
  };

  return (
    <div className={cn("grid w-full items-center gap-2", className)}>
      {error && (
        <Alert className="text-2xl" variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-lg">{error}</AlertDescription>
        </Alert>
      )}
      <Button
        size="lg"
        className="w-full rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 dark:border-gray-600 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        variant="link"
        onClick={() => onClick("google")}
        disabled={server_DisconnectAccountActionIsPending}
      >
        <FcGoogle className="size-5" />{" "}
        {connectedAccounts.includes("google") ? "Disconnect" : "Connect"} with
        Google
      </Button>
      <Button
        size="lg"
        className="w-full rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 dark:border-gray-600 dark:bg-black dark:text-white dark:hover:bg-gray-800"
        variant="link"
        onClick={() => onClick("github")}
        disabled={server_DisconnectAccountActionIsPending}
      >
        <VscGithubAlt className="size-5" />
        {connectedAccounts.includes("github") ? "Disconnect" : "Connect"} with
        Github
      </Button>
      <AuthErrorMessage />
    </div>
  );
}

const ModuleWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const modules = React.Children.toArray(children);

  return modules.map((module, index) => (
    <React.Fragment key={index}>
      {module}
      {index < modules.length - 1 && (
        <hr className="mx-auto my-4 border-gray-800 dark:border-white" />
      )}
    </React.Fragment>
  ));
};

function PasswordUpdateForm() {
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  useEffect(() => {
    let successTimer: NodeJS.Timeout | undefined;
    let errorTimer: NodeJS.Timeout | undefined;

    if (success) {
      successTimer = setTimeout(() => {
        setSuccess("");
      }, 5000);
    }

    if (error) {
      errorTimer = setTimeout(() => {
        setError("");
      }, 5000);
    }

    // Cleanup both timers
    return () => {
      if (successTimer) clearTimeout(successTimer);
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [success, error]);

  const {
    mutate: server_PasswordUpdateAction,
    isPending: server_PasswordUpdateIsPending,
  } = useMutation({
    mutationFn: async (values: z.infer<typeof SecuritySettings_Password>) => {
      // Simulate API call (replace with actual API request logic)
      console.log(values);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    },
    onMutate: () => {
      setSuccess("");
      setError("");
    },
    onSuccess: () => {
      setSuccess("Profile information updated successfully");
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
    onSettled: () => {
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      setPasswordVisible(false);
    },
  });

  const form = useForm<z.infer<typeof SecuritySettings_Password>>({
    resolver: zodResolver(SecuritySettings_Password),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof SecuritySettings_Password>,
  ) => {
    server_PasswordUpdateAction(values);
  };

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
        <FormSuccess message={success} />
        <FormError message={error} />
        <Button
          variant="default"
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
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let successTimer: NodeJS.Timeout | undefined;
    let errorTimer: NodeJS.Timeout | undefined;

    if (success) {
      successTimer = setTimeout(() => {
        setSuccess("");
      }, 5000);
    }

    if (error) {
      errorTimer = setTimeout(() => {
        setError("");
      }, 5000);
    }

    // Cleanup both timers
    return () => {
      if (successTimer) clearTimeout(successTimer);
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [success, error]);

  const {
    mutate: server_SetPasswordAction,
    isPending: server_SetPasswordIsPending,
  } = useMutation({
    mutationFn: async (
      values: z.infer<typeof SecuritySettings_SetPassword>,
    ) => {
      // Simulate API call (replace with actual API request logic)
      console.log(values);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    },
    onMutate: () => {
      setSuccess("");
      setError("");
    },
    onSuccess: () => {
      setSuccess("Profile information updated successfully");
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
    onSettled: () => {
      form.setValue("password", "");
      form.setValue("confirmPassword", "");
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
    server_SetPasswordAction(values);
  };

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
          type="submit"
          disabled={server_SetPasswordIsPending}
        >
          Set Password
        </Button>
      </form>
    </Form>
  );
}

export function SecuritySettings({
  MagicLinkEnable,
  MagicLinkAllow,
  UsePassword,
  Accounts,
  EmailVerified,
}: {
  MagicLinkEnable: boolean;
  MagicLinkAllow: boolean;
  UsePassword: boolean;
  Accounts: string[];
  EmailVerified: boolean;
}) {
  const [isMagicLinkEnabled, setIsMagicLinkEnabled] = useState(MagicLinkEnable);
  const isMagicLinkAllow = MagicLinkAllow;

  const {
    mutate: server_LogoutFromAllDevicesAction,
    isPending: server_LogoutFromAllDevicesIsPending,
  } = useMutation({
    mutationFn: async () => {
      // Simulate API call (replace with actual API request logic)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Successfully logged out from all devices.",
      });
    },
    onError: () => {
      toast({
        title: "Error!",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const {
    mutate: server_EnableMagicLinkAction,
    isPending: server_EnableMagicLinkIsPending,
  } = useMutation({
    mutationFn: async () => {
      // Simulate API call (replace with actual API request logic)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    },
    onSuccess: () => {
      setIsMagicLinkEnabled(!isMagicLinkEnabled);
      toast({
        title: "Success!",
        description: isMagicLinkEnabled
          ? "Magic link login enabled. Password login is now disabled."
          : "Magic link login disabled. Password login is re-enabled.",
      });
    },
    onError: () => {
      toast({
        title: "Error!",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Manage your security preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <ModuleWrapper>
          {isMagicLinkEnabled || (UsePassword && <PasswordUpdateForm />) || (
            <SetPasswordForm />
          )}
          <ConnectSocialButtons
            connectedAccounts={Accounts}
            emailVerified={EmailVerified}
            usePassword={UsePassword}
            magicLinkEnabled={MagicLinkEnable}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium">Logout</p>
              <p className="text-muted-foreground text-sm">
                Logout from all devices
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                server_LogoutFromAllDevicesAction();
              }}
              disabled={server_LogoutFromAllDevicesIsPending}
            >
              Logout from all devices
            </Button>
          </div>
          {isMagicLinkAllow && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium">Magic Link Login</p>
                  <p className="text-muted-foreground text-sm">
                    Enable magic link login. Password login will be disabled.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    server_EnableMagicLinkAction();
                  }}
                  disabled={server_EnableMagicLinkIsPending}
                >
                  {isMagicLinkEnabled
                    ? "Disable Magic Link"
                    : "Enable Magic Link"}
                </Button>
              </div>
              {isMagicLinkEnabled && (
                <p className="text-muted-foreground text-sm">
                  Note: You will no longer be able to log in using your password
                  if this option is enabled.
                </p>
              )}
            </div>
          )}
        </ModuleWrapper>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
