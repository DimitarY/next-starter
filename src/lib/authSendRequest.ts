import type { ReactElement } from "react";
import { Resend } from "resend";
import ApproveEmailChange from "@/components/emails/approve-email-change";
import DeleteAccountEmail from "@/components/emails/delete-account";
import MagicLinkEmail from "@/components/emails/magic-link";
import PasswordResetEmail from "@/components/emails/password-reset";
import VerifyEmailEmail from "@/components/emails/verify-email";
import { siteConfig } from "@/config/site";
import { env } from "@/env";

interface Params {
  identifier: string; // 'to' email address
  url: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  react: ReactElement;
  errorType: string;
}

/**
 * Base function to handle email sending with common logic
 */
async function sendEmail({
  to,
  subject,
  react,
  errorType,
}: SendEmailParams): Promise<void> {
  if (
    env.NODE_ENV === "development" &&
    process.env.DISABLE_EMAILS_FOR_TESTING === "true"
  ) {
    console.warn(
      "⚠️ Email sending is disabled by DISABLE_EMAILS_FOR_TESTING in development mode",
    );
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `${siteConfig.name} <no-reply@${env.RESEND_DOMAIN}>`,
    to,
    subject,
    react,
  });

  if (error) {
    // Propagate the error back to better-auth
    throw new Error(`${errorType} email failed: ${error.message}`);
  }
}

export async function sendResetPasswordEmail({
  identifier,
  url,
}: Params): Promise<void> {
  await sendEmail({
    to: identifier,
    subject: "Reset password instructions",
    react: PasswordResetEmail({ resetLink: url }),
    errorType: "Reset password",
  });
}

export async function sendVerificationRequest({
  identifier,
  url,
}: Params): Promise<void> {
  await sendEmail({
    to: identifier,
    subject: "Verify your email address",
    react: VerifyEmailEmail({ verifyLink: url }),
    errorType: "Verification",
  });
}

export async function sendChangeEmailVerification({
  identifier,
  url,
  newEmail,
}: Params & { newEmail: string }): Promise<void> {
  await sendEmail({
    to: identifier,
    subject: "Approve email change",
    react: ApproveEmailChange({ approveLink: url, newEmail }),
    errorType: "Verification",
  });
}

export async function sendDeleteAccountVerification({
  identifier,
  url,
}: Params): Promise<void> {
  await sendEmail({
    to: identifier,
    subject: "Account Deletion Request",
    react: DeleteAccountEmail({ deleteAccountLink: url }),
    errorType: "Delete account",
  });
}

export async function sendMagicLink({
  identifier,
  url,
}: Params): Promise<void> {
  await sendEmail({
    to: identifier,
    subject: `Sign in to ${siteConfig.name}`,
    react: MagicLinkEmail({ magicLink: url }),
    errorType: "Magic link",
  });
}
