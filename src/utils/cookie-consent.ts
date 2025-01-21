import { siteConfig } from "@/config/site";

export const consentList = ["consent-ph"]; // as const ensures exact string literals are inferred

export type ConsentKey = (typeof consentList)[number]; // Type that represents any value in consentList

// Function to get the consent description
export const getConsentName = (consentKey: ConsentKey): string => {
  const consentDescriptions: Record<ConsentKey, string> = {
    "consent-ph": "Telemetry",
  };

  return consentDescriptions[consentKey];
};

// Function to get the consent description
export const getConsentDescription = (consentKey: ConsentKey): string => {
  const consentDescriptions: Record<ConsentKey, string> = {
    "consent-ph": `By opting in to sending telemetry data, ${siteConfig.name} can improve the overall user experience.`,
  };

  return consentDescriptions[consentKey];
};

// Function to get the "Learn More" URL
export const getLearnMoreLink = (consentKey: ConsentKey): string => {
  const learnMoreLinks: Record<ConsentKey, string> = {
    "consent-ph": "/privacy", // Link specific to this consent type
  };

  return learnMoreLinks[consentKey];
};
