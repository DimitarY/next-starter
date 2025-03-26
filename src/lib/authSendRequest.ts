import ApproveEmailChange from "@/components/emails/approve-email-change";
import DeleteAccountEmail from "@/components/emails/delete-account";
import MagicLinkEmail from "@/components/emails/magic-link";
import PasswordResetEmail from "@/components/emails/password-reset";
import VerifyEmailEmail from "@/components/emails/verify-email";
import { siteConfig } from "@/config/site";
import { env } from "@/env";
import { Resend } from "resend";

interface Params {
  identifier: string; // 'to' email address
  url: string;
}

export async function sendResetPasswordEmail({
  identifier,
  url,
}: Params): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `${siteConfig.name} <no-reply@${env.RESEND_DOMAIN}>`,
    to: identifier,
    subject: "Reset password instructions",
    react: PasswordResetEmail({ resetLink: url }),
  });

  if (error) {
    // Propagate the error back to better-auth
    throw new Error(`Reset password email failed: ${error.message}`);
  }
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

  if (error) {
    // Propagate the error back to better-auth
    throw new Error(`Verification email failed: ${error.message}`);
  }
}

export async function sendChangeEmailVerification({
  identifier,
  url,
  newEmail,
}: Params & { newEmail: string }): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `${siteConfig.name} <no-reply@${env.RESEND_DOMAIN}>`,
    to: identifier,
    subject: `Approve email change`,
    react: ApproveEmailChange({ approveLink: url, newEmail }),
  });

  if (error) {
    // Propagate the error back to better-auth
    throw new Error(`Verification email failed: ${error.message}`);
  }
}

export async function sendDeleteAccountVerification({
  identifier,
  url,
}: Params): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `${siteConfig.name} <no-reply@${env.RESEND_DOMAIN}>`,
    to: identifier,
    subject: `Account Deletion Request`,
    react: DeleteAccountEmail({ deleteAccountLink: url }),
  });

  if (error) {
    // Propagate the error back to better-auth
    throw new Error(`Delete account email failed: ${error.message}`);
  }
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

  if (error) {
    // Propagate the error back to better-auth
    throw new Error(`Magic link email failed: ${error.message}`);
  }
}
