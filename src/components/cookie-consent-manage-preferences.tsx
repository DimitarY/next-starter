"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { siteConfig } from "@/config/site";
import {
  ConsentKey,
  consentList,
  getConsentDescription,
  getConsentName,
  getLearnMoreLink,
} from "@/utils/cookie-consent";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function CookieConsentManagePreferences() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Function to handle dialog open changes
  const handleDialogOpenChange = (isOpen: boolean): void => {
    setIsDialogOpen(isOpen);
  };

  // Function to safely get consent from localStorage
  const getConsentFromLocalStorage = (key: ConsentKey): boolean => {
    const storedConsent = localStorage.getItem(key);
    console.log("storedConsent:", storedConsent);

    // Validate the stored value, ensuring it is one of the recognized representations of a boolean
    if (storedConsent === "true" || storedConsent === "1") {
      return true;
    } else if (storedConsent === "false" || storedConsent === "0") {
      return false;
    }

    // If the value is not recognized, default to false
    return false;
  };

  // Initialize state for each consent key with values from localStorage (if available)
  const [consentStates, setConsentStates] = useState<
    Record<ConsentKey, boolean>
  >(
    consentList.reduce(
      (acc, key) => {
        acc[key] = getConsentFromLocalStorage(key); // Use the function to fetch the consent value
        return acc;
      },
      {} as Record<ConsentKey, boolean>,
    ),
  );

  // Effect hook to load from localStorage when dialog opens
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
  }, [isDialogOpen]); // Dependency array ensures it runs every time `isDialogOpen` changes

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
        <button className="text-blue-500 underline dark:text-blue-400">
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
              <span className="text-sm text-muted-foreground">
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
                      <span className="text-sm text-muted-foreground">
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
