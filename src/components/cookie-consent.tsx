"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { consentList } from "@/utils/cookie-consent";
import { CookieIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Utility function to set local storage values
const setConsentStatus = (keys: string[], value: string) => {
  keys.forEach((key) => {
    localStorage.setItem(key, value);
  });
};

// Utility function to check if all consents exist in local storage
const areAllConsentsSet = (keys: string[]): boolean => {
  return keys.every((key) => localStorage.getItem(key) !== null);
};

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hide, setHide] = useState<boolean>(false);

  const accept = () => {
    setConsentStatus(consentList, "true");
    setIsOpen(false);
    setTimeout(() => setHide(true), 700);
  };

  const decline = () => {
    setConsentStatus(consentList, "false");
    setIsOpen(false);
    setTimeout(() => setHide(true), 700);
  };

  useEffect(() => {
    if (areAllConsentsSet(consentList)) {
      setHide(true);
    } else {
      setIsOpen(true);
    }
  }, []);

  return (
    <div
      className={cn(
        "fixed right-0 bottom-0 left-0 z-200 w-full duration-700 sm:bottom-4 sm:left-4 sm:max-w-md",
        !isOpen
          ? "translate-y-8 opacity-0 transition-[opacity,transform]"
          : "translate-y-0 opacity-100 transition-[opacity,transform]",
        hide && "hidden",
      )}
    >
      <div className="border-border bg-background dark:bg-card m-3 rounded-md border shadow-lg">
        <div className="grid gap-2">
          <div className="border-border flex h-14 items-center justify-between border-b p-4">
            <h1 className="text-lg font-medium">We use cookies</h1>
            <CookieIcon className="h-[1.2rem] w-[1.2rem]" />
          </div>
          <div className="p-4">
            <p className="text-start text-sm font-normal">
              We use cookies to ensure you get the best experience on our
              website. For more information on how we use cookies, please see
              our cookie policy.
              <br />
              <br />
              <span className="text-xs">
                By clicking &#34;
                <span className="font-medium opacity-80">Accept</span>&#34;, you
                agree to our use of cookies.
              </span>
              <br />
              <Link href="/privacy" className="text-xs underline">
                Learn more
              </Link>
            </p>
          </div>
          <div className="border-border dark:bg-background/20 flex flex-col gap-2 border-t p-4 py-5">
            <Button onClick={accept} className="w-full cursor-pointer">
              Accept
            </Button>
            <Button
              onClick={decline}
              className="w-full cursor-pointer"
              variant="secondary"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
