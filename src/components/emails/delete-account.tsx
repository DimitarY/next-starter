import { Footer, Header, MyTailwind } from "@/components/emails/common";
import { siteConfig } from "@/config/site";
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

interface DeleteAccountEmailProps {
  deleteAccountLink: string;
}

export default function DeleteAccountEmail({
  deleteAccountLink,
}: DeleteAccountEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm account deletion for {siteConfig.name}</Preview>
      <MyTailwind>
        <Body className="bg-background text-foreground mx-auto max-w-[600px] font-sans">
          <Header />

          <Section className="rounded-[var(--radius)] p-6 text-left">
            <Text className="text-destructive mb-4 text-2xl font-bold">
              Confirm Your Account Deletion
            </Text>
            <Text className="mb-5 text-base">
              You have requested to delete your account from {siteConfig.name}.
              This action is irreversible.
            </Text>
            <Text className="mb-5 text-base">
              If you wish to proceed, click the button below.
            </Text>
            <Button
              href={deleteAccountLink}
              className="bg-destructive text-destructive-foreground rounded-md px-6 py-3 text-lg"
            >
              Delete My Account
            </Button>
            <Text className="mt-5 text-base">
              Or copy this link:
              <br />
              <Link href={deleteAccountLink} className="break-all underline">
                {deleteAccountLink}
              </Link>
            </Text>
            <Text className="mt-5 text-sm">
              If you did not request this, you can safely ignore this email.
              Your account will remain active.
            </Text>
          </Section>

          <Footer />
        </Body>
      </MyTailwind>
    </Html>
  );
}
