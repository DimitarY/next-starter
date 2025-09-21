"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { siteConfig } from "@/config/site";
import {
  type ConsentKey,
  consentList,
  getConsentDescription,
  getConsentName,
  getLearnMoreLink,
} from "@/utils/cookie-consent";

export default function CookieConsentManagePreferences() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Initialize state with default "false" values to prevent server-side errors
  const [consentStates, setConsentStates] = useState<
    Record<ConsentKey, boolean>
  >(
    consentList.reduce(
      (acc, key) => {
        acc[key] = false; // Default to false on server
        return acc;
      },
      {} as Record<ConsentKey, boolean>,
    ),
  );

  // Function to safely get consent from localStorage (now only called on the client)
  const getConsentFromLocalStorage = (key: ConsentKey): boolean => {
    // Check if window is defined to ensure this code runs in the browser
    if (typeof window !== "undefined") {
      const storedConsent = localStorage.getItem(key);
      // Simplify boolean validation
      return storedConsent === "true";
    }
    return false; // Return false for the server-side
  };

  // Function to handle dialog open changes
  const handleDialogOpenChange = (isOpen: boolean): void => {
    setIsDialogOpen(isOpen);
  };

  // Effect hook to load from localStorage when dialog opens
  // biome-ignore lint/correctness/useExhaustiveDependencies: <getConsentFromLocalStorage update on every re-render>
  useEffect(() => {
    if (isDialogOpen) {
      const updatedConsentStates: Record<ConsentKey, boolean> =
        consentList.reduce(
          (acc, key) => {
            acc[key] = getConsentFromLocalStorage(key); // Safely load consent values on dialog open
            return acc;
          },
          {} as Record<ConsentKey, boolean>,
        );

      setConsentStates(updatedConsentStates);
    }
  }, [isDialogOpen]);

  // Function to handle switching
  const handleSwitchChange = (consentKey: ConsentKey, checked: boolean) => {
    // Update state
    setConsentStates((prevState) => ({
      ...prevState,
      [consentKey]: checked,
    }));

    // Save the updated consent to localStorage
    localStorage.setItem(consentKey, JSON.stringify(checked));
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <button
          className="cursor-pointer text-blue-500 underline dark:text-blue-400"
          type="button"
        >
          Manage preferences
        </button>
      </DialogTrigger>
      <DialogContent className="w-[400px] p-6">
        <DialogTitle>Privacy Settings</DialogTitle>
        <hr />
        <div className="space-y-4">
          <div className="flex justify-between gap-5">
            <Switch checked disabled />
            <div className="flex flex-col gap-2">
              <label className="font-medium">Strictly necessary cookies</label>
              <span className="text-muted-foreground text-sm">
                These cookies are necessary for {siteConfig.name} to function.{" "}
                <Link href="/privacy" className="underline">
                  Learn more
                </Link>
              </span>
            </div>
          </div>
          <div>
            {consentList.map((consentKey) => {
              const name = getConsentName(consentKey);
              const description = getConsentDescription(consentKey);
              const learnMoreLink = getLearnMoreLink(consentKey);

              return (
                <React.Fragment key={consentKey}>
                  <hr className="my-4" />
                  <div className="flex justify-between gap-5">
                    <Switch
                      checked={consentStates[consentKey]}
                      onCheckedChange={(checked: boolean) =>
                        handleSwitchChange(consentKey, checked)
                      }
                    />
                    <div className="flex flex-col gap-2">
                      <label className="font-medium">{name}</label>
                      <span className="text-muted-foreground text-sm">
                        {description}{" "}
                        <Link href={learnMoreLink} className="underline">
                          Learn more
                        </Link>
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
