import { AuthErrorMessage } from "@/components/auth/auth-error";
import { DeleteAccount } from "@/components/profile/delete-account";
import { GeneralSettings } from "@/components/profile/general-settings";
import { ProfilePictureCard } from "@/components/profile/profile-picture";
import { SecuritySettings } from "@/components/profile/security-settings";
import { db } from "@/db";
import { account } from "@/db/schema/account";
import { user } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm/sql";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Settings() {
  const sessionObj = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionObj) {
    redirect("/");
  }

  const sessions = await auth.api.listSessions({
    headers: await headers(),
  });

  const userSettingsInfo = await db
    .select({
      id: user.id,
      emailVerified: user.emailVerified,
      usePassword: sql<boolean>`bool_or(${account.password} IS NOT NULL)`,
      accounts: sql<string[]>`
          COALESCE(array_agg(DISTINCT ${account.providerId}) FILTER (WHERE ${account.providerId} IS NOT NULL), ARRAY[]::TEXT[])`,
      allowMagicLink: user.allowMagicLink,
      useMagicLink: user.useMagicLink,
    })
    .from(user)
    .leftJoin(account, eq(user.id, account.userId))
    .where(eq(user.id, sessionObj.user.id))
    .groupBy(
      user.id,
      user.name,
      user.image,
      user.createdAt,
      user.emailVerified,
      user.allowMagicLink,
      user.useMagicLink,
    );

  const allowMagicLink = userSettingsInfo[0].allowMagicLink;
  const magicLinkEnabled = userSettingsInfo[0].useMagicLink;
  const usePassword = userSettingsInfo[0].usePassword;
  const accounts = userSettingsInfo[0].accounts;
  const emailVerified = userSettingsInfo[0].emailVerified;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <AuthErrorMessage className="mb-4" />
      <ProfilePictureCard user={sessionObj.user} />
      <GeneralSettings user={sessionObj.user} />
      <SecuritySettings
        MagicLinkEnable={magicLinkEnabled}
        MagicLinkAllow={allowMagicLink}
        UsePassword={usePassword}
        Accounts={accounts}
        EmailVerified={emailVerified}
        Session={sessionObj.session}
        SessionsList={sessions}
      />
      <DeleteAccount />
    </div>
  );
}
