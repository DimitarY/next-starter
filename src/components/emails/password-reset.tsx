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
export default function PasswordResetEmail({
  resetLink,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Password Reset Request</Preview>
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
                We got a request to reset your password
              </Text>
              <Text className="mb-5 text-base">
                A request to edit your password has been made. If you did make
                this request, click the link below. After updating your
                password, you will be asked to sign in again.
              </Text>
              <Button
                href={resetLink}
                className="bg-primary text-primary rounded-md px-6 py-3 text-lg"
              >
                Reset password
              </Button>
              <Text className="mt-5 text-sm">
                If you didn&#39;t request a password reset, please disregard
                this email, and your password will not be changed.
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
