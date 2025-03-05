"use client";

import { FormError } from "@/components/form-message";
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
import { DeleteProfile } from "@/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function DeleteAccount() {
  const [deleteEnable, setDeleteEnable] = useState(false);
  const [error, setError] = useState<string | undefined>("");

  useEffect(() => {
    let errorTimer: NodeJS.Timeout | undefined;

    if (error) {
      errorTimer = setTimeout(() => {
        setError("");
      }, 5000);
    }

    // Cleanup both timers
    return () => {
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [error]);

  const {
    mutate: server_DeleteAccountAction,
    isPending: server_DeleteAccountIsPending,
  } = useMutation({
    mutationFn: async (values: z.infer<typeof DeleteProfile>) => {
      console.log(values);
      // Simulate API call (replace with actual API request logic)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    },
    onMutate: () => {
      setError("");
    },
    onSuccess: () => {
      toast("Success!", {
        description: "Successfully logged out from all devices.",
      });
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
  });

  const onSubmit = async (values: z.infer<typeof DeleteProfile>) => {
    server_DeleteAccountAction(values);
  };

  return (
    <Card className="border-red-500 dark:border-red-500">
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
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      className="border-red-500 data-[state=checked]:border-black data-[state=checked]:bg-red-500 dark:data-[state=checked]:border-white"
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
            <FormError message={error} />
            <Button
              variant="destructive"
              type="submit"
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
