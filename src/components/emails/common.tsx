import { siteConfig } from "@/config/site";
import { Img, Link, Section, Tailwind, Text } from "@react-email/components";
import { ReactNode } from "react";

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
              foreground: "#1f1e2e",
              card: "#ffffff",
              "card-foreground": "#1f1e2e",
              popover: "#ffffff",
              "popover-foreground": "#1f1e2e",
              primary: "#43b273",
              "primary-foreground": "#ffefff",
              secondary: "#e6e6f7",
              "secondary-foreground": "#1f1f1a",
              muted: "#e6e6f7",
              "muted-foreground": "#636380",
              accent: "#e6e6f7",
              "accent-foreground": "#1f1f1a",
              destructive: "#e60000",
              "destructive-foreground": "#fefefe",
              border: "#d0d0e6",
              input: "#d0d0e6",
              ring: "#43b273",
            },
            borderRadius: {
              radius: "0.5rem",
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
