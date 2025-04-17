"use client";

import { FormError, FormSuccess } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { auth } from "@/lib/client/auth";
import { DeleteProfile } from "@/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function DeleteAccount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [deleteEnable, setDeleteEnable] = useState(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const {
    mutate: server_DeleteAccountAction,
    isPending: server_DeleteAccountIsPending,
  } = useMutation({
    mutationFn: async (values: z.infer<typeof DeleteProfile>) => {
      if (!values.accept) {
        return {
          success: false,
          error: null,
          message: "You must accept the delete account",
        };
      }

      const { error } = await auth.deleteUser({
        callbackURL: "/goodbye",
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
      const original_params = new URLSearchParams(params.toString());

      if (!data.success && data.error) {
        switch (data.error.status) {
          case 400: {
            if (
              data.error.code ===
              "SESSION_EXPIRED_REAUTHENTICATE_TO_PERFORM_THIS_ACTION"
            ) {
              // TODO: Add a session refresh page
              setError(
                "Session expired. Please re-authenticate to perform this action.",
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
      } else if (!data.success && data.message) {
        setError(data.message);
      } else {
        setSuccess("Delete account email sent! Please check your inbox.");
      }

      if (original_params.toString() !== params.toString()) {
        router.push(`?${params.toString()}`);
      }
    },
    onError: () => {
      setError("An unexpected error occurred. Please try again.");
    },
    onSettled: () => {
      form.setValue("accept", false);
      setDeleteEnable(false);
    },
  });

  const form = useForm<z.infer<typeof DeleteProfile>>({
    resolver: zodResolver(DeleteProfile),
    defaultValues: {
      accept: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof DeleteProfile>) => {
    server_DeleteAccountAction(values);
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
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="accept"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border-2 p-4">
                  <FormControl>
                    <Checkbox
                      className="border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground data-[state=checked]:border-destructive cursor-pointer"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setDeleteEnable(checked as boolean);
                      }}
                      disabled={server_DeleteAccountIsPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Delete my profile</FormLabel>
                    <FormDescription>
                      If you delete your account, all your data on our site will
                      be deleted permanently.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormSuccess message={success} />
            <FormError message={error} />
            <Button
              variant="destructive"
              type="submit"
              className="cursor-pointer"
              disabled={server_DeleteAccountIsPending || !deleteEnable}
            >
              Delete account
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
