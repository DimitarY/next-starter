import { siteConfig } from "@/config/site";
import { env } from "@/env";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface MagicLinkEmailProps {
  magicLink: string;
}

// TODO: Fix background, text colors, and button
export default function MagicLinkEmail({ magicLink }: MagicLinkEmailProps) {
  // Calculate time remaining
  const remainingMinutes = env.MAGIC_LINK_EXPIRES_IN_SECONDS / 60;
  const remainingHours = env.MAGIC_LINK_EXPIRES_IN_SECONDS / 3600;
  const remainingDays = env.MAGIC_LINK_EXPIRES_IN_SECONDS / 86400;

  // Determine the correct time unit and text
  let timeText = "";
  if (remainingDays >= 1) {
    timeText = `${Math.floor(remainingDays)} day${Math.floor(remainingDays) > 1 ? "s" : ""}`;
  } else if (remainingHours >= 1) {
    timeText = `${Math.floor(remainingHours)} hour${Math.floor(remainingHours) > 1 ? "s" : ""}`;
  } else {
    timeText = `${Math.floor(remainingMinutes)} minute${Math.floor(remainingMinutes) > 1 ? "s" : ""}`;
  }

  return (
    <Html>
      <Head />
      <Preview>Sign in to {siteConfig.name}</Preview>
      <Tailwind>
        <Body className="bg-background text-foreground font-sans">
          <Container className="mx-auto max-w-[600px]">
            <Section className="bg-card mb-3 flex h-[60px] items-center justify-center rounded-[var(--radius)]">
              <Img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/512px-Test-Logo.svg.png"
                alt={`${siteConfig.name} logo`}
                className="h-[40px] w-auto"
              />
            </Section>

            <Section className="rounded-[var(--radius)] p-6 text-left">
              <Text className="mb-4 text-2xl font-bold">
                Your one-time login link is ready!
              </Text>
              <Text className="mb-5 text-base">
                Click the button below within the next {timeText} to log into
                your account.
              </Text>
              <Button
                href={magicLink}
                className="bg-primary text-primary rounded-md px-6 py-3 text-lg"
              >
                Log in to {siteConfig.name}
              </Button>
              <Text className="mt-5 text-base">
                Or copy this link:
                <br />
                <Link
                  href={magicLink}
                  className="text-accent-foreground underline"
                >
                  {/*FIXME: Fix the wrap*/}
                  {magicLink}
                </Link>
              </Text>
              <Text className="mt-5 text-sm">
                If you did not request this email, you can safely ignore it.
              </Text>
            </Section>

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
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
