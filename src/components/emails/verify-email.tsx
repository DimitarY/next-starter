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
import { siteConfig } from "@/config/site";
import { env } from "@/env";

interface VerifyEmailEmailProps {
  verifyLink: string;
}

export default function VerifyEmailEmail({
  verifyLink,
}: VerifyEmailEmailProps) {
  const timeText = TimeRemaining({
    timeRemaining: env.EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
  });

  return (
    <Html>
      <Head />
      <Preview>Sign in to {siteConfig.name}</Preview>
      <MyTailwind>
        <Body className="bg-background text-foreground mx-auto max-w-[600px] font-sans">
          <Header />

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
              className="bg-primary text-primary-foreground rounded-md px-6 py-3 text-lg"
            >
              Verify email
            </Button>
            <Text className="mt-5 text-base">
              Or copy this link:
              <br />
              <Link href={verifyLink} className="break-all underline">
                {verifyLink}
              </Link>
            </Text>
          </Section>

          <Footer />
        </Body>
      </MyTailwind>
    </Html>
  );
}
