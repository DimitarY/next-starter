"use client";

import { EnableMagicLinkAction, SetPasswordAction } from "@/actions/auth";
import { FormError, FormSuccess } from "@/components/form-message";
import { Icons } from "@/components/icons";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/client/auth";
import { cn } from "@/lib/utils";
import {
  SecuritySettings_CreatePasskey,
  SecuritySettings_EditPasskey,
  SecuritySettings_Password,
  SecuritySettings_SetPassword,
  SecuritySettings_TwoFactorDelete,
  SecuritySettings_TwoFactorGenerate,
  SecuritySettings_TwoFactorVerify,
} from "@/schemas/settings";
import {
  checkPasswordCriteria,
  getPasswordStrength,
  getStrengthColorClass,
  getStrengthLabel,
  getStrengthTextColorClass,
} from "@/utils/password-strength";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Session } from "better-auth";
import { AlertCircle, Check, TriangleAlert, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { VscGithubAlt } from "react-icons/vsc";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import { z } from "zod";

function PasswordUpdateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

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
      const original_params = new URLSearchParams(params.toString());

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
          case 429: {
            setError("Too many requests. Please try again later.");
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
        setDialogOpen(false);
      }
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
    onSettled: () => {
      form.reset();
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

  // Watch the password field for real-time strength calculation and criteria checking
  const password = form.watch("newPassword");
  const passwordStrength = getPasswordStrength(password);
  const strengthLabel = getStrengthLabel(passwordStrength);
  const strengthColorClass = getStrengthColorClass(passwordStrength);
  const strengthTextColorClass = getStrengthTextColorClass(passwordStrength);

  const passwordCriteria = checkPasswordCriteria(password);

  const onSubmit = async (
    values: z.infer<typeof SecuritySettings_Password>,
  ) => {
    setPasswordVisible(false);
    setNewPasswordVisible(false);
    setConfirmPasswordVisible(false);

    server_PasswordUpdateAction(values);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (error || success) {
      timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
    }

    if (success) {
      router.refresh();
      setDialogOpen(false);
    }

    // Cleanup timer
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, router, success]);

  return (
    <Dialog
      modal={false}
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (open) {
          setError("");
          setSuccess("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full cursor-pointer">Update Password</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          // Only prevent closing when interacting with password manager prompts
          // Allow clicking outside the dialog for other interactions
          if (
            e.target &&
            (e.target as HTMLElement).closest("[data-radix-focus-guard]")
          ) {
            e.preventDefault();
          }
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Update Password</DialogTitle>
              <DialogDescription>
                Change your account password
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <PasswordInput
                    visible={passwordVisible}
                    onVisibleChange={setPasswordVisible}
                  >
                    <FormControl>
                      <PasswordInputInput
                        autoComplete="password"
                        placeholder="Confirm Password"
                        {...field}
                      />
                    </FormControl>
                    <PasswordInputAdornmentToggle />
                  </PasswordInput>
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
                  <PasswordInput
                    visible={newPasswordVisible}
                    onVisibleChange={setNewPasswordVisible}
                  >
                    <FormControl>
                      <PasswordInputInput
                        autoComplete="new-password"
                        placeholder="Confirm Password"
                        {...field}
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
                        autoComplete="password"
                        placeholder="Confirm Password"
                        {...field}
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
            <DialogFooter>
              <Button
                variant="default"
                className="cursor-pointer"
                type="submit"
                disabled={server_PasswordUpdateIsPending}
              >
                Update password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

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

  // Watch the password field for real-time strength calculation and criteria checking
  const password = form.watch("password");
  const passwordStrength = getPasswordStrength(password);
  const strengthLabel = getStrengthLabel(passwordStrength);
  const strengthColorClass = getStrengthColorClass(passwordStrength);
  const strengthTextColorClass = getStrengthTextColorClass(passwordStrength);

  const passwordCriteria = checkPasswordCriteria(password);

  const onSubmit = async (
    values: z.infer<typeof SecuritySettings_SetPassword>,
  ) => {
    setPasswordVisible(false);
    setConfirmPasswordVisible(false);

    server_SetPassword(values);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (error || success) {
      timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
    }

    if (success) {
      router.refresh();
      setDialogOpen(false);
    }

    // Cleanup timer
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, router, success]);

  return (
    <Dialog
      modal={false}
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (open) {
          setError("");
          setSuccess("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full cursor-pointer">Set Password</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          // Only prevent closing when interacting with password manager prompts
          // Allow clicking outside the dialog for other interactions
          if (
            e.target &&
            (e.target as HTMLElement).closest("[data-radix-focus-guard]")
          ) {
            e.preventDefault();
          }
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Set Password</DialogTitle>
              <DialogDescription>
                Create a password for your account
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Set Password</FormLabel>
                  <PasswordInput
                    visible={passwordVisible}
                    onVisibleChange={setPasswordVisible}
                  >
                    <FormControl>
                      <PasswordInputInput
                        autoComplete="new-password"
                        placeholder="Confirm Password"
                        {...field}
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
            <DialogFooter>
              <Button
                variant="default"
                className="cursor-pointer"
                type="submit"
                disabled={server_SetPasswordIsPending}
              >
                Set Password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// TODO: Add remove password

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

function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [setupStep, setSetupStep] = useState<"generate" | "verify" | "backup">(
    "generate",
  );

  const { mutate: GenerateTwoFactor, isPending: GenerateTwoFactorIsPending } =
    useMutation({
      mutationFn: async (
        values: z.infer<typeof SecuritySettings_TwoFactorGenerate>,
      ) => {
        const result = await auth.twoFactor.enable({
          password: values.password,
        });

        console.log(result);

        if (result?.error) {
          return { success: false, error: result.error };
        } else {
          return {
            success: true,
            error: null,
            result: result.data,
          };
        }
      },
      onMutate: () => {
        setPasswordVisible(false);
        setSuccess("");
        setError("");

        if (params.get("error")) {
          // eslint-disable-next-line drizzle/enforce-delete-with-where
          params.delete("error");
          router.push(`?${params.toString()}`);
        }
      },
      onSuccess: async (data) => {
        const original_params = new URLSearchParams(params.toString());

        if (!data.success && data.error) {
          switch (data.error.status) {
            case 400: {
              if (data.error.code === "INVALID_PASSWORD") {
                setError("Invalid password");
              } else {
                params.set("error", "Unknown");
              }
              break;
            }
            case 403: {
              if (data.error.code === "SESSION_IS_NOT_FRESH") {
                setError(
                  "Session is not fresh. Please re-authenticate to perform this action.",
                );
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

          if (original_params.toString() !== params.toString()) {
            router.push(`?${params.toString()}`);
          }
        } else if (data.success && data.result) {
          setQrCodeUrl(data.result.totpURI);
          setSecret(
            new URL(data.result.totpURI).searchParams.get("secret") || "",
          );
          setBackupCodes(data.result.backupCodes);
          setSetupStep("verify");
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
      onSettled: () => {
        formGenerate.reset();
      },
    });

  const {
    mutate: VerifyAndEnableTwoFactor,
    isPending: VerifyAndEnableTwoFactorIsPending,
  } = useMutation({
    mutationFn: async (
      values: z.infer<typeof SecuritySettings_TwoFactorVerify>,
    ) => {
      const result = await auth.twoFactor.verifyTotp({
        code: values.code,
      });

      if (result?.error) {
        return { success: false, error: result.error };
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
      const original_params = new URLSearchParams(params.toString());

      if (!data.success && data.error) {
        switch (data.error.status) {
          case 400: {
            if (data.error.code === "INVALID_TWO_FACTOR_AUTHENTICATION") {
              setError("Invalid verification code. Please try again.");
            } else {
              params.set("error", "Unknown");
            }
            break;
          }
          case 403: {
            if (data.error.code === "SESSION_IS_NOT_FRESH") {
              setError(
                "Session is not fresh. Please re-authenticate to perform this action.",
              );
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

        if (original_params.toString() !== params.toString()) {
          router.push(`?${params.toString()}`);
        }
      } else {
        setSuccess("Two-factor authentication has been enabled successfully!");

        // Show backup codes instead of closing dialog
        setSetupStep("backup");
      }
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
    onSettled: () => {
      formVerify.reset();
    },
  });

  const formGenerate = useForm<
    z.infer<typeof SecuritySettings_TwoFactorGenerate>
  >({
    resolver: zodResolver(SecuritySettings_TwoFactorGenerate),
    defaultValues: {
      password: "",
    },
  });

  const formVerify = useForm<z.infer<typeof SecuritySettings_TwoFactorVerify>>({
    resolver: zodResolver(SecuritySettings_TwoFactorVerify),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (error || success) {
      timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
    }

    // Cleanup timer
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, router, success]);

  const wasDialogOpen = useRef(false);

  useEffect(() => {
    if (wasDialogOpen.current && !dialogOpen) {
      router.refresh();
    }
    wasDialogOpen.current = dialogOpen;
  }, [dialogOpen, wasDialogOpen, router]);

  const onSubmitGenerate = async (
    values: z.infer<typeof SecuritySettings_TwoFactorGenerate>,
  ) => {
    GenerateTwoFactor(values);
  };

  const onSubmitVerify = async (
    values: z.infer<typeof SecuritySettings_TwoFactorVerify>,
  ) => {
    VerifyAndEnableTwoFactor(values);
  };

  return (
    <Dialog
      modal={false}
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (open) {
          setError("");
          setSuccess("");
          setSetupStep("generate");
          setQrCodeUrl("");
          setSecret("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          Setup Two-Factor Authentication
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          // Only prevent closing when interacting with password manager prompts
          // Allow clicking outside the dialog for other interactions
          if (
            e.target &&
            (e.target as HTMLElement).closest("[data-radix-focus-guard]")
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            {setupStep === "generate"
              ? "Set up two-factor authentication for your account"
              : setupStep === "verify"
                ? "Verify your authenticator app"
                : "Save your backup codes"}
          </DialogDescription>
        </DialogHeader>

        {setupStep === "generate" ? (
          <div className="space-y-4">
            <div className="text-muted-foreground text-sm">
              <p>
                Two-factor authentication adds an extra layer of security to
                your account.
              </p>
              <p className="mt-2">
                You&#39;ll need an authenticator app like Google Authenticator,
                Authy, or Microsoft Authenticator.
              </p>
            </div>
            <Form {...formGenerate}>
              <form
                onSubmit={formGenerate.handleSubmit(onSubmitGenerate)}
                className="space-y-4"
              >
                <FormField
                  control={formGenerate.control}
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
                            autoComplete="password"
                            placeholder="Confirm Password"
                            {...field}
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
                <DialogFooter>
                  <Button
                    variant="default"
                    className="cursor-pointer"
                    type="submit"
                    disabled={GenerateTwoFactorIsPending}
                  >
                    {GenerateTwoFactorIsPending ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Generate QR Code
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        ) : setupStep === "verify" ? (
          <Form {...formVerify}>
            <form
              onSubmit={formVerify.handleSubmit(onSubmitVerify)}
              className="space-y-4"
            >
              {qrCodeUrl && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-md border bg-white p-2">
                    <QRCode value={qrCodeUrl || ""} />
                  </div>
                  <div className="text-center text-sm">
                    <p>Scan this QR code with your authenticator app</p>
                    <p className="mt-2 font-mono text-xs">
                      Or enter this code manually:
                      <button
                        className="text-xs font-bold"
                        onClick={() => {
                          navigator.clipboard.writeText(secret).then();
                          toast("Secret copied successful");
                        }}
                      >
                        {secret}
                      </button>
                    </p>
                  </div>
                </div>
              )}
              <FormField
                control={formVerify.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter 6-digit code"
                        disabled={VerifyAndEnableTwoFactorIsPending}
                        maxLength={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormSuccess message={success} />
              <FormError message={error} />
              <DialogFooter>
                <Button
                  variant="default"
                  className="cursor-pointer"
                  type="submit"
                  disabled={VerifyAndEnableTwoFactorIsPending}
                >
                  {VerifyAndEnableTwoFactorIsPending ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Verify and Enable
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="text-muted-foreground text-sm">
              <p>
                Two-factor authentication has been enabled successfully! Please
                save these backup codes in a secure location. You can use these
                codes to access your account if you lose access to your
                authenticator app.
              </p>
            </div>

            <div className="bg-muted mt-4 rounded-md border p-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join("\n")).then();
                  toast("Success!", {
                    description: "Backup codes copied to clipboard.",
                  });
                }}
              >
                <Icons.copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>

            <FormSuccess message={success} />
            <FormError message={error} />

            <DialogFooter>
              <Button
                variant="default"
                className="cursor-pointer"
                onClick={() => {
                  setDialogOpen(false);
                  setSetupStep("generate");
                  setQrCodeUrl("");
                  setSecret("");
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TwoFactorStatus({
  isTwoFactorEnabled,
}: {
  isTwoFactorEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const params = new URLSearchParams(searchParams.toString());
  const [error, setError] = useState<string>("");

  const { mutate: DisableTwoFactor, isPending: DisableTwoFactorIsPending } =
    useMutation({
      mutationFn: async (
        values: z.infer<typeof SecuritySettings_TwoFactorDelete>,
      ) => {
        const result = await auth.twoFactor.disable({
          password: values.password,
        });

        console.log("result", result);

        if (result?.error) {
          return { success: false, error: result.error };
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
        const original_params = new URLSearchParams(params.toString());

        if (!data.success && data.error) {
          switch (data.error.status) {
            case 400: {
              if (data.error.code === "INVALID_PASSWORD") {
                setError("Invalid password");
              } else {
                params.set("error", "Unknown");
              }
              break;
            }
            case 403: {
              if (data.error.code === "SESSION_IS_NOT_FRESH") {
                // TODO: Add a session refresh page
                setError(
                  "Session is not fresh. Please re-authenticate to perform this action.",
                );
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

          if (original_params.toString() !== params.toString()) {
            router.push(`?${params.toString()}`);
          }
        } else {
          toast("Success!", {
            description: "Two-factor authentication has been disabled.",
          });
          router.refresh();
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
    });

  const form = useForm<z.infer<typeof SecuritySettings_TwoFactorDelete>>({
    resolver: zodResolver(SecuritySettings_TwoFactorDelete),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (error) {
      timer = setTimeout(() => {
        setError("");
      }, 5000);
    }

    // Cleanup timer
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, router]);

  const onSubmitGenerate = async (
    values: z.infer<typeof SecuritySettings_TwoFactorDelete>,
  ) => {
    setPasswordVisible(false);

    DisableTwoFactor(values);
  };

  return (
    <div className="flex flex-col justify-center gap-4 p-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-medium">Two-Factor Authentication</p>
          <p className="text-muted-foreground text-sm">
            {isTwoFactorEnabled
              ? "Your account is protected with two-factor authentication."
              : "Add an extra layer of security to your account with two-factor authentication."}
          </p>
        </div>
        {isTwoFactorEnabled ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="cursor-pointer" variant="destructive">
                {DisableTwoFactorIsPending ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Disable 2FA
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[425px]"
              onPointerDownOutside={(e) => {
                // Only prevent closing when interacting with password manager prompts
                // Allow clicking outside the dialog for other interactions
                if (
                  e.target &&
                  (e.target as HTMLElement).closest("[data-radix-focus-guard]")
                ) {
                  e.preventDefault();
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>Remove Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  Permanently remove you&#39;re Teo-Factor Authentication
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-muted-foreground text-sm">
                  <p>
                    Two-factor authentication adds an extra layer of security to
                    your account.
                  </p>
                  <p className="mt-2">
                    You&#39;ll need an authenticator app like Google
                    Authenticator, Authy, or Microsoft Authenticator.
                  </p>
                </div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitGenerate)}
                    className="space-y-4"
                  >
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
                                autoComplete="password"
                                placeholder="Confirm Password"
                                {...field}
                              />
                            </FormControl>
                            <PasswordInputAdornmentToggle />
                          </PasswordInput>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormError message={error} />
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        className="cursor-pointer"
                        type="submit"
                        disabled={DisableTwoFactorIsPending}
                      >
                        {DisableTwoFactorIsPending ? (
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Disable 2FA
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <TwoFactorForm />
        )}
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
      mutationFn: async (provider: "google" | "facebook" | "github") => {
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
        const original_params = new URLSearchParams(params.toString());

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
            case 403: {
              if (data.error.code === "SESSION_IS_NOT_FRESH") {
                // TODO: Add a session refresh page
                setError(
                  "Session is not fresh. Please re-authenticate to perform this action.",
                );
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

          if (original_params.toString() !== params.toString()) {
            router.push(`?${params.toString()}`);
          }
        } else {
          router.refresh();
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
    });

  const onClick = (provider: "google" | "facebook" | "github") => {
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
        className="w-full cursor-pointer rounded-md border border-gray-300 bg-[#1877F2] text-white hover:bg-[#166FE5] dark:border-gray-600 dark:bg-[#1877F2] dark:text-white dark:hover:bg-[#166FE5]"
        variant="link"
        onClick={() => onClick("facebook")}
        disabled={ConnectAccountIsPending || DisconnectAccountIsPending}
      >
        <FaFacebook className="size-5 text-white" />{" "}
        {connectedAccounts.some((account) => account.providerId === "facebook")
          ? "Disconnect from"
          : "Connect with"}{" "}
        Facebook
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
    <div className={cn("flex flex-col gap-6", className)}>
      <p className="text-base font-medium">Active Sessions</p>
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
              <CardContent className="space-y-2">
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

interface PasskeyManagementProps {
  className?: string;
  passkeys: { id: string; name: string; createdAt: string }[];
}

function PasskeyManagement({ className, passkeys }: PasskeyManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [error, setError] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

  const { mutate: RegisterPasskey, isPending: RegisterPasskeyIsPending } =
    useMutation({
      mutationFn: async (
        values: z.infer<typeof SecuritySettings_CreatePasskey>,
      ) => {
        if (passkeys.some((passkey) => passkey.name === values.name)) {
          return {
            success: false,
            error: null,
            message: "Cannot add a passkey with the same name",
          };
        }

        const result = await auth.passkey.addPasskey({ name: values.name });

        console.log("result", result);

        if (result?.error) {
          // TODO: Error code is not defined as type, but it is defined in the API
          return {
            success: false,
            error: result.error as {
              code?: string | undefined;
              message?: string | undefined;
              status: number;
              statusText: string;
            },
          };
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
        const original_params = new URLSearchParams(params.toString());

        if (!data.success && data.error) {
          switch (data.error.status) {
            case 400: {
              if (
                data.error.message ===
                "The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission."
              ) {
                setError(
                  "You have denied the request. Please re-authenticate to perform this action.",
                );
              }
              break;
            }
            case 403: {
              if (data.error.code === "SESSION_IS_NOT_FRESH") {
                // TODO: Add a session refresh page
                setError(
                  "Session is not fresh. Please re-authenticate to perform this action.",
                );
              } else {
                params.set("error", "Unknown");
              }
              break;
            }
            case 429: {
              setError("Too many requests. Please try again later.");
              break;
            }
            case 500: {
              if (data.error.code === "FAILED_TO_VERIFY_REGISTRATION") {
                setError(
                  "Failed to verify registration. Please try again later.",
                );
              } else if (data.error.statusText === "Internal Server Error") {
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
        } else if (!data.success && data.message) {
          setError(data.message);
        } else {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          router.refresh();
        }

        if (original_params.toString() !== params.toString()) {
          router.push(`?${params.toString()}`);
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
      onSettled: () => {
        formCreate.reset();
      },
    });

  const { mutate: UpdatePasskey, isPending: UpdatePasskeyIsPending } =
    useMutation({
      mutationFn: async (
        values: z.infer<typeof SecuritySettings_EditPasskey>,
      ) => {
        // Check if any other passkey has the same name
        if (passkeys.some((passkey) => passkey.name === values.name)) {
          return {
            success: false,
            error: null,
            message: "A passkey with this name already exists",
          };
        }

        const result = await auth.passkey.updatePasskey({
          id: values.id,
          name: values.name,
        });

        console.log("result", result);

        if (result?.error) {
          return {
            success: false,
            error: result.error,
          };
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
        const original_params = new URLSearchParams(params.toString());

        if (!data.success && data.error) {
          switch (data.error.status) {
            case 403: {
              if (data.error.code === "SESSION_IS_NOT_FRESH") {
                // TODO: Add a session refresh page
                setError(
                  "Session is not fresh. Please re-authenticate to perform this action.",
                );
              } else {
                params.set("error", "Unknown");
              }
              break;
            }
            case 429: {
              setError("Too many requests. Please try again later.");
              break;
            }
            case 500: {
              if (data.error.code === "FAILED_TO_VERIFY_REGISTRATION") {
                setError(
                  "Failed to verify registration. Please try again later.",
                );
              } else if (data.error.statusText === "Internal Server Error") {
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
        } else if (!data.success && data.message) {
          setError(data.message);
        } else {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          router.refresh();
        }

        if (original_params.toString() !== params.toString()) {
          router.push(`?${params.toString()}`);
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
      onSettled: () => {
        formUpdate.reset();
      },
    });

  const { mutate: DeletePasskey, isPending: DeletePasskeyIsPending } =
    useMutation({
      mutationFn: async ({ passkeyId }: { passkeyId: string }) => {
        const result = await auth.passkey.deletePasskey({ id: passkeyId });

        console.log("result", result);

        if (result?.error) {
          return {
            success: false,
            error: result.error,
          };
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
        const original_params = new URLSearchParams(params.toString());

        if (!data.success && data.error) {
          switch (data.error.status) {
            case 403: {
              if (data.error.code === "SESSION_IS_NOT_FRESH") {
                // TODO: Add a session refresh page
                setError(
                  "Session is not fresh. Please re-authenticate to perform this action.",
                );
              } else {
                params.set("error", "Unknown");
              }
              break;
            }
            case 429: {
              setError("Too many requests. Please try again later.");
              break;
            }
            case 500: {
              if (data.error.code === "FAILED_TO_VERIFY_REGISTRATION") {
                setError(
                  "Failed to verify registration. Please try again later.",
                );
              } else if (data.error.statusText === "Internal Server Error") {
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
          router.refresh();
        }

        if (original_params.toString() !== params.toString()) {
          router.push(`?${params.toString()}`);
        }
      },
      onError: () => {
        setError("An unexpected error occurred. Please try again.");
      },
    });

  const formCreate = useForm<z.infer<typeof SecuritySettings_CreatePasskey>>({
    resolver: zodResolver(SecuritySettings_CreatePasskey),
    defaultValues: {
      name: "",
    },
  });

  const onSubmitCreate = async (
    values: z.infer<typeof SecuritySettings_CreatePasskey>,
  ) => {
    RegisterPasskey(values);
  };

  const formUpdate = useForm<z.infer<typeof SecuritySettings_EditPasskey>>({
    resolver: zodResolver(SecuritySettings_EditPasskey),
    defaultValues: {
      id: "",
      name: "",
    },
  });

  const onSubmitUpdate = async (
    values: z.infer<typeof SecuritySettings_EditPasskey>,
  ) => {
    UpdatePasskey(values);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <p className="text-base font-medium">Passkeys</p>
      <div className="space-y-4">
        {(passkeys.length == 0 && (
          <div className="flex items-center justify-center gap-2">
            <p>No passkeys found</p>
          </div>
        )) ||
          passkeys.map((passkey) => {
            const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;

            const formattedCreatedAt = new Date(
              passkey.createdAt,
            ).toLocaleString(userLocale);

            return (
              <Card key={passkey.id} className="boarder-2">
                <CardContent className="flex flex-row justify-between space-y-2">
                  <div>
                    <p className="text-sm">
                      <strong>Name:</strong> {passkey.name}
                    </p>
                    <p className="text-sm">
                      <strong>Created At:</strong> {formattedCreatedAt}
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-end gap-2">
                    <Dialog
                      modal={false}
                      open={editDialogOpen}
                      onOpenChange={(open) => {
                        setCreateDialogOpen(false);
                        setEditDialogOpen(open);
                        if (open) {
                          formUpdate.setValue("id", passkey.id);
                          setError("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="cursor-pointer">
                          <Icons.pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="sm:max-w-[425px]"
                        onPointerDownOutside={(e) => {
                          // Only prevent closing when interacting with password manager prompts
                          // Allow clicking outside the dialog for other interactions
                          if (
                            e.target &&
                            (e.target as HTMLElement).closest(
                              "[data-radix-focus-guard]",
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Form {...formUpdate}>
                          <form
                            onSubmit={formUpdate.handleSubmit(onSubmitUpdate)}
                            className="space-y-4"
                          >
                            <DialogHeader>
                              <DialogTitle>Update Passkey</DialogTitle>
                              <DialogDescription>
                                Update the name of the passkey
                              </DialogDescription>
                            </DialogHeader>
                            <FormField
                              control={formUpdate.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="text"
                                      placeholder="My Passkey"
                                      disabled={UpdatePasskeyIsPending}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormError message={error} />
                            <DialogFooter>
                              <Button
                                variant="default"
                                className="cursor-pointer"
                                type="submit"
                                onClick={() =>
                                  console.log(
                                    "form values",
                                    formUpdate.getValues(),
                                  )
                                }
                                disabled={UpdatePasskeyIsPending}
                              >
                                Update
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => DeletePasskey({ passkeyId: passkey.id })}
                      disabled={
                        UpdatePasskeyIsPending || DeletePasskeyIsPending
                      }
                    >
                      <Icons.thrash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
      <Separator />
      <Dialog
        modal={false}
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          setEditDialogOpen(false);
          if (open) {
            setError("");
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className="w-full cursor-pointer">
            <Icons.plus /> Create Passkey
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          onPointerDownOutside={(e) => {
            // Only prevent closing when interacting with password manager prompts
            // Allow clicking outside the dialog for other interactions
            if (
              e.target &&
              (e.target as HTMLElement).closest("[data-radix-focus-guard]")
            ) {
              e.preventDefault();
            }
          }}
        >
          <Form {...formCreate}>
            <form
              onSubmit={formCreate.handleSubmit(onSubmitCreate)}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Create Passkey</DialogTitle>
                <DialogDescription>
                  Create a new passkey to access your account
                </DialogDescription>
              </DialogHeader>
              <FormField
                control={formCreate.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="My Passkey"
                        disabled={RegisterPasskeyIsPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormError message={error} />
              <DialogFooter>
                <Button
                  variant="default"
                  className="cursor-pointer"
                  type="submit"
                  disabled={RegisterPasskeyIsPending}
                >
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SecuritySettingsProps {
  MagicLinkEnable: boolean;
  MagicLinkAllow: boolean;
  UsePassword: boolean;
  TwoFactorEnabled: boolean;
  Accounts: { accountId: string; providerId: string }[];
  Passkeys: { id: string; name: string; createdAt: string }[];
  EmailVerified: boolean;
  Session: Session;
  SessionsList: Session[];
}

export function SecuritySettings({
  MagicLinkAllow,
  MagicLinkEnable,
  UsePassword,
  TwoFactorEnabled,
  Accounts,
  Passkeys,
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
          {!(MagicLinkAllow && MagicLinkEnable) && (
            <div className="flex flex-col gap-6">
              <p className="text-base font-medium">Password</p>
              <div className="space-y-4">
                {UsePassword ? <PasswordUpdateForm /> : <SetPasswordForm />}
              </div>
            </div>
          )}
          {MagicLinkAllow && (
            <EnableMagicLink isMagicLinkEnabled={MagicLinkEnable} />
          )}
          <TwoFactorStatus isTwoFactorEnabled={TwoFactorEnabled} />
          <ConnectSocialButtons connectedAccounts={Accounts} />
          <SessionManagement session={Session} sessionsList={SessionsList} />
          <PasskeyManagement passkeys={Passkeys} />
        </ModuleWrapper>
      </CardContent>
      <CardFooter className="flex flex-col justify-start gap-2 border-t px-6 py-4 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Security settings allow you to manage your account security
          preferences.
        </p>
      </CardFooter>
    </Card>
  );
}
