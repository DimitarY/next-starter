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

interface MagicLinkEmailProps {
  magicLink: string;
}

export default function MagicLinkEmail({ magicLink }: MagicLinkEmailProps) {
  const timeText = TimeRemaining({
    timeRemaining: env.MAGIC_LINK_EXPIRES_IN_SECONDS,
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
              Your one-time login link is ready!
            </Text>
            <Text className="mb-5 text-base">
              Click the button below within the next {timeText} to log into your
              account.
            </Text>
            <Button
              href={magicLink}
              className="bg-primary text-primary-foreground rounded-md px-6 py-3 text-lg"
            >
              Log in to {siteConfig.name}
            </Button>
            <Text className="mt-5 text-base">
              Or copy this link:
              <br />
              <Link href={magicLink} className="break-all underline">
                {magicLink}
              </Link>
            </Text>
            <Text className="mt-5 text-sm">
              If you did not request this email, you can safely ignore it.
            </Text>
          </Section>

          <Footer />
        </Body>
      </MyTailwind>
    </Html>
  );
}
