import MagicLinkEmail from "@/components/emails/magic-link";
import { siteConfig } from "@/config/site";
import { env } from "@/env";
import { render } from "@react-email/render";

interface Provider {
  from: string;
}

interface VerificationParams {
  identifier: string; // 'to' email address
  provider: Provider;
  url: string;
}

export async function sendVerificationRequest(
  params: VerificationParams,
): Promise<void> {
  const { identifier: email, provider, url } = params;

  // Using API
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: provider.from,
      to: email,
      subject: `Sign in to ${siteConfig.name}`,
      html: await render(MagicLinkEmail({ magicLink: url }), { pretty: true }),
      text: await render(MagicLinkEmail({ magicLink: url }), {
        plainText: true,
      }),
    }),
  });

  // TODO: Handle error
  if (!res.ok) {
    console.error("Resend error: " + JSON.stringify(await res.json()));
  }

  // Using resend package
  // Can't be used with container
  // auth.config is constructed at build time
  // but env.RESEND_API_KEY is provided at run time
  // const { error } = await resend.emails.send({
  //   from: provider.from,
  //   to: email,
  //   subject: `Sign in to ${siteConfig.name}`,
  //   react: MagicLinkEmail({ magicLink: url }),
  // });
  //
  // // TODO: Handle error
  // console.log("error", error);
}
