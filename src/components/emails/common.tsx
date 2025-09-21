import { Img, Link, Section, Tailwind, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

interface MyTailwindProps {
  children: ReactNode;
}

export function MyTailwind({ children }: MyTailwindProps) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              background: "#ffffff",
              foreground: "#242324",
              card: "#ffffff",
              "card-foreground": "#242324",
              popover: "#ffffff",
              "popover-foreground": "#242324",
              primary: "#00b569",
              "primary-foreground": "#f5fdf7",
              secondary: "#f6f5f7",
              "secondary-foreground": "#353436",
              muted: "#f6f5f7",
              "muted-foreground": "#8c8a8d",
              accent: "#f6f5f7",
              "accent-foreground": "#353436",
              destructive: "#e52200",
              "destructive-foreground": "#fefefe",
              border: "#e9e8ea",
              input: "#e9e8ea",
              ring: "#00b569",
            },
            borderRadius: {
              radius: "0.65rem",
            },
          },
        },
      }}
    >
      {children}
    </Tailwind>
  );
}

export function Header() {
  return (
    <Section className="bg-card mb-3 flex h-[60px] items-center justify-center rounded-[var(--radius)]">
      <Img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/512px-Test-Logo.svg.png"
        alt={`${siteConfig.name} logo`}
        className="h-[40px] w-auto"
      />
    </Section>
  );
}

export function Footer() {
  return (
    <Section className="mt-8 text-center">
      <Text className="text-muted-foreground text-sm">
        © {new Date().getFullYear()} {siteConfig.name}
        <br />
        <Link
          href={`${siteConfig.url}/privacy`}
          className="text-accent-foreground underline"
        >
          Privacy Policy
        </Link>
        {" | "}
        <Link
          href={`${siteConfig.url}/terms`}
          className="text-accent-foreground underline"
        >
          Terms of Service
        </Link>
      </Text>
    </Section>
  );
}

export function TimeRemaining({ timeRemaining }: { timeRemaining: number }) {
  // Calculate time remaining
  const remainingMinutes = timeRemaining / 60;
  const remainingHours = timeRemaining / 3600;
  const remainingDays = timeRemaining / 86400;

  // Determine the correct time unit and text
  let timeText = "";
  if (remainingDays >= 1) {
    timeText = `${Math.floor(remainingDays)} day${Math.floor(remainingDays) > 1 ? "s" : ""}`;
  } else if (remainingHours >= 1) {
    timeText = `${Math.floor(remainingHours)} hour${Math.floor(remainingHours) > 1 ? "s" : ""}`;
  } else {
    timeText = `${Math.floor(remainingMinutes)} minute${Math.floor(remainingMinutes) > 1 ? "s" : ""}`;
  }

  return timeText;
}
