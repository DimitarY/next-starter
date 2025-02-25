"use client";

import { FormError, FormSuccess } from "@/components/form-message";
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
import { GeneralSettings_Profile } from "@/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { User } from "better-auth/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function GeneralSettings(props: { user: User }) {
  const name = props.user.name || "";
  const email = props.user.email || "";

  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const {
    mutate: server_ProfileInformationUpdateAction,
    isPending: server_ProfileInformationUpdateIsPending,
  } = useMutation({
    mutationFn: async (values: z.infer<typeof GeneralSettings_Profile>) => {
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
  });

  const form = useForm<z.infer<typeof GeneralSettings_Profile>>({
    resolver: zodResolver(GeneralSettings_Profile),
    defaultValues: {
      name: name || "",
      email: email || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof GeneralSettings_Profile>) => {
    server_ProfileInformationUpdateAction(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>
          Update your account details and manage profile information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={server_ProfileInformationUpdateIsPending}
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
                      {...field}
                      type="email"
                      disabled={server_ProfileInformationUpdateIsPending}
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
              disabled={server_ProfileInformationUpdateIsPending}
            >
              Save changes
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col justify-start gap-2 border-t px-6 py-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Use this section to customize your account and profile settings.
        </p>
      </CardFooter>
    </Card>
  );
}
