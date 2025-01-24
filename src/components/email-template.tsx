import { MagicLinkMaxAge } from "@/auth.config";
import { siteConfig } from "@/config/site";
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

interface PasswordResetEmailProps {
  resetLink: string;
}

// TODO: Fix background, text colors, and button
export function PasswordResetEmail({ resetLink }: PasswordResetEmailProps) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Password Reset Request</Preview>
        <Body className="bg-background font-sans text-foreground">
          <Container className="mx-auto max-w-[600px]">
            <Section className="mb-3 flex h-[60px] items-center justify-center rounded-[var(--radius)] bg-card">
              <Img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/512px-Test-Logo.svg.png"
                alt={`${siteConfig.name} logo`}
                className="h-[40px] w-auto"
              />
            </Section>

            <Section className="rounded-[var(--radius)] p-6 text-left">
              <Text className="mb-4 text-2xl font-bold">
                We got a request to reset your password
              </Text>
              <Text className="mb-5 text-base">
                A request to edit your password has been made. If you did make
                this request, click the link below. After updating your
                password, you will be asked to sign in again.
              </Text>
              <Button
                href={resetLink}
                className="rounded-md bg-primary px-6 py-3 text-lg text-primary"
              >
                Reset password
              </Button>
              <Text className="mt-5 text-sm">
                If you didn&#39;t request a password reset, please disregard
                this email, and your password will not be changed.
              </Text>
            </Section>

            <Section className="mt-8 text-center">
              <Text className="text-sm text-muted-foreground">
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
      </Html>
    </Tailwind>
  );
}

interface MagicLinkEmailProps {
  magicLink: string;
}

// TODO: Fix background, text colors, and button
export function MagicLinkEmail({ magicLink }: MagicLinkEmailProps) {
  // Calculate time remaining
  const remainingMinutes = MagicLinkMaxAge / 60;
  const remainingHours = MagicLinkMaxAge / 3600;
  const remainingDays = MagicLinkMaxAge / 86400;

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
    <Tailwind>
      <Html>
        <Head />
        <Preview>Sign in to {siteConfig.name}</Preview>
        <Body className="bg-background font-sans text-foreground">
          <Container className="mx-auto max-w-[600px]">
            <Section className="mb-3 flex h-[60px] items-center justify-center rounded-[var(--radius)] bg-card">
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
                className="rounded-md bg-primary px-6 py-3 text-lg text-primary"
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
              <Text className="text-sm text-muted-foreground">
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
      </Html>
    </Tailwind>
  );
}
