import MagicLinkEmail from "@/components/emails/magic-link";
import VerifyEmailEmail from "@/components/emails/verify-email";
import { siteConfig } from "@/config/site";
import { env } from "@/env";
import { Resend } from "resend";

interface Params {
  identifier: string; // 'to' email address
  url: string;
}

export async function sendMagicLink({
  identifier,
  url,
}: Params): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `${siteConfig.name} <no-reply@${env.RESEND_DOMAIN}>`,
    to: identifier,
    subject: `Sign in to ${siteConfig.name}`,
    react: MagicLinkEmail({ magicLink: url }),
  });

  // TODO: Handle error
  console.log("error", error);
}

export async function sendVerificationRequest({
  identifier,
  url,
}: Params): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `${siteConfig.name} <no-reply@${env.RESEND_DOMAIN}>`,
    to: identifier,
    subject: `Verify your email address`,
    react: VerifyEmailEmail({ verifyLink: url }),
  });

  // TODO: Handle error
  console.log("error", error);
}
