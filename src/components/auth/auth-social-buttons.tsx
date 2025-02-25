"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/client/auth";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const onClick = async (provider: "google" | "github") => {
    await auth.signIn.social({
      provider: provider,
      callbackURL: callbackUrl || "/",
    });
  };

  return (
    <div className={cn("grid w-full items-center gap-2", className)}>
      <Button
        size="lg"
        className="w-full rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 dark:border-gray-600 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        variant="link"
        onClick={() => onClick("google")}
      >
        <FcGoogle className="h-5 w-5" /> {googleButtonText}
      </Button>
      <Button
        size="lg"
        className="w-full rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 dark:border-gray-600 dark:bg-black dark:text-white dark:hover:bg-gray-800"
        variant="link"
        onClick={() => onClick("github")}
      >
        <VscGithubAlt className="h-5 w-5" /> {githubButtonText}
      </Button>
    </div>
  );
}
