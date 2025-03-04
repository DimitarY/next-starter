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

interface VerifyEmailEmailProps {
  verifyLink: string;
}

// TODO: Fix background, text colors, and button
export default function VerifyEmailEmail({
  verifyLink,
}: VerifyEmailEmailProps) {
  // Calculate time remaining
  const remainingMinutes = env.EMAIL_VERIFICATION_EXPIRES_IN_SECONDS / 60;
  const remainingHours = env.EMAIL_VERIFICATION_EXPIRES_IN_SECONDS / 3600;
  const remainingDays = env.EMAIL_VERIFICATION_EXPIRES_IN_SECONDS / 86400;

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
                Verify your email address for {siteConfig.name}
              </Text>
              <Text className="mb-5 text-base">
                Click the button below within the next {timeText} to verify your
                email.
              </Text>
              <Button
                href={verifyLink}
                className="bg-primary text-primary rounded-md px-6 py-3 text-lg"
              >
                Verify email
              </Button>
              <Text className="mt-5 text-base">
                Or copy this link:
                <br />
                <Link
                  href={verifyLink}
                  className="text-accent-foreground underline"
                >
                  {/*FIXME: Fix the wrap*/}
                  {verifyLink}
                </Link>
              </Text>
              <Text className="mt-5 text-sm">
                {/*TODO: Implement this*/}
                If you did not validate your email within the 7 days, your
                account will be deleted.
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
