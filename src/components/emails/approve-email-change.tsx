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

interface ApproveEmailChangeProps {
  approveLink: string;
  newEmail: string;
}

export default function ApproveEmailChange({
  approveLink,
  newEmail,
}: ApproveEmailChangeProps) {
  const timeText = TimeRemaining({
    timeRemaining: env.EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
  });

  return (
    <Html>
      <Head />
      <Preview>Approve email change for {siteConfig.name}</Preview>
      <MyTailwind>
        <Body className="bg-background text-foreground mx-auto max-w-[600px] font-sans">
          <Header />

          <Section className="rounded-[var(--radius)] p-6 text-left">
            <Text className="mb-4 text-2xl font-bold">
              Approve your email change for {siteConfig.name}
            </Text>
            <Text className="mb-5 text-base">
              You have requested to change your email to:
            </Text>
            <Text className="mb-5 text-lg font-semibold">{newEmail}</Text>
            <Text className="mb-5 text-base">
              Click the button below within the next {timeText} to approve your
              new email address.
            </Text>
            <Button
              href={approveLink}
              className="bg-primary text-primary-foreground rounded-md px-6 py-3 text-lg"
            >
              Approve Email Change
            </Button>
            <Text className="mt-5 text-base">
              Or copy this link:
              <br />
              <Link href={approveLink} className="break-all underline">
                {approveLink}
              </Link>
            </Text>
            <Text className="mt-5 text-sm">
              If you didn&#39;t request an email change, please disregard this
              email, and your email will remain the same.
            </Text>
          </Section>

          <Footer />
        </Body>
      </MyTailwind>
    </Html>
  );
}
