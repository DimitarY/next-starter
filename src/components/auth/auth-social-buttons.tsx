"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/client/auth";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { VscGithubAlt } from "react-icons/vsc";

interface AuthSocialButtonsProps {
  className?: string;
  googleButtonText?: string;
  githubButtonText?: string;
}

export function AuthSocialButtons({
  className,
  googleButtonText = "Sign in with Google",
  githubButtonText = "Sign in with Github",
}: AuthSocialButtonsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const callbackUrl = searchParams.get("callbackUrl");

  const onClick = async (provider: "google" | "github") => {
    const { error } = await auth.signIn.social({
      provider: provider,
      callbackURL: callbackUrl || "/",
      errorCallbackURL: window.location.href,
    });

    console.log("error", error);

    if (error) {
      const original_params = new URLSearchParams(params.toString());

      switch (error.status) {
        case 403: {
          params.set("error", "AccessDenied");
          if (error.code === "INVALID_ORIGIN") {
            params.set("error", "Configuration");
          }
          break;
        }
        case 429: {
          params.set("error", "TooManyRequests");
          break;
        }
        default: {
          params.set("error", "Unknown");
          break;
        }
      }

      if (original_params.toString() !== params.toString()) {
        router.replace(`?${params.toString()}`);
      }
    }
  };

  return (
    <div className={cn("grid w-full items-center gap-2", className)}>
      <Button
        size="lg"
        className="w-full cursor-pointer rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 dark:border-gray-600 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        variant="link"
        onClick={() => onClick("google")}
      >
        <FcGoogle className="size-5" /> {googleButtonText}
      </Button>
      <Button
        size="lg"
        className="w-full cursor-pointer rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 dark:border-gray-600 dark:bg-black dark:text-white dark:hover:bg-gray-800"
        variant="link"
        onClick={() => onClick("github")}
      >
        <VscGithubAlt className="size-5" /> {githubButtonText}
      </Button>
    </div>
  );
}
