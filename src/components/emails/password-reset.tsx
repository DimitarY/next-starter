import {
  Body,
  Button,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import {
  Footer,
  Header,
  MyTailwind,
  TimeRemaining,
} from "@/components/emails/common";
import { env } from "@/env";

interface PasswordResetEmailProps {
  resetLink: string;
}

export default function PasswordResetEmail({
  resetLink,
}: PasswordResetEmailProps) {
  const timeText = TimeRemaining({
    timeRemaining: env.RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS,
  });

  return (
    <Html>
      <Head />
      <Preview>Password Reset Request</Preview>
      <MyTailwind>
        <Body className="bg-background text-foreground mx-auto max-w-[600px] font-sans">
          <Header />

          <Section className="rounded-[var(--radius)] p-6 text-left">
            <Text className="mb-4 text-2xl font-bold">
              We got a request to reset your password
            </Text>
            <Text className="mb-5 text-base">
              A request to edit your password has been made. If you did make
              this request, click the link below within the next {timeText}.
              After updating your password, you will be asked to sign in again.
            </Text>
            <Button
              href={resetLink}
              className="bg-primary text-primary-foreground rounded-md px-6 py-3 text-lg"
            >
              Reset password
            </Button>
            <Text className="mt-5 text-base">
              Or copy this link:
              <br />
              <Link href={resetLink} className="break-all underline">
                {resetLink}
              </Link>
            </Text>
            <Text className="mt-5 text-sm">
              If you did&#39;t request a password reset, please disregard this
              email, and your password will not be changed.
            </Text>
          </Section>

          <Footer />
        </Body>
      </MyTailwind>
    </Html>
  );
}
