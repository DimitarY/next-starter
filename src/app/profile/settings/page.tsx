import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm/sql";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthErrorMessage } from "@/components/auth/auth-error";
import { DeleteAccount } from "@/components/profile/delete-account";
import { GeneralSettings } from "@/components/profile/general-settings";
import { ProfilePictureCard } from "@/components/profile/profile-picture";
import { SecuritySettings } from "@/components/profile/security-settings";
import { account, db, passkey, user } from "@/db";
import { auth } from "@/lib/auth";

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
      usePassword: sql<boolean>`COALESCE(bool_or(${account.password} IS NOT NULL), false)`,
      accounts: sql<{ providerId: string; accountId: string }[]>`
      COALESCE(
        jsonb_agg(DISTINCT jsonb_build_object(
          'providerId', ${account.providerId},
          'accountId', ${account.accountId}
        )) FILTER (WHERE ${account.providerId} IS NOT NULL), '[]'::jsonb
      )`,
      passkeys: sql<{ id: string; name: string; createdAt: string }[]>`
      COALESCE(
        jsonb_agg(DISTINCT jsonb_build_object(
          'id', ${passkey.id},
          'name', ${passkey.name},
          'createdAt', ${passkey.createdAt}
        )) FILTER (WHERE ${passkey.id} IS NOT NULL), '[]'::jsonb
      )`,
      allowMagicLink: user.allowMagicLink,
      useMagicLink: user.useMagicLink,
    })
    .from(user)
    .leftJoin(account, eq(user.id, account.userId))
    .leftJoin(passkey, eq(user.id, passkey.userId))
    .where(eq(user.id, sessionObj.user.id))
    .groupBy(
      user.id,
      user.emailVerified,
      user.allowMagicLink,
      user.useMagicLink,
    )
    .then((rows) => rows.at(0) ?? null); // Get the first result or return null if empty

  if (!userSettingsInfo) {
    // If we get to this point something went horribly wrong
    console.error("Error fetching user settings");
    redirect("/");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <AuthErrorMessage className="mb-4" />
      <ProfilePictureCard user={sessionObj.user} />
      <GeneralSettings user={sessionObj.user} />
      <SecuritySettings
        MagicLinkEnable={userSettingsInfo.useMagicLink}
        MagicLinkAllow={userSettingsInfo.allowMagicLink}
        UsePassword={userSettingsInfo.usePassword}
        TwoFactorEnabled={sessionObj.user.twoFactorEnabled as boolean}
        Accounts={userSettingsInfo.accounts}
        Passkeys={userSettingsInfo.passkeys}
        EmailVerified={userSettingsInfo.emailVerified}
        Session={sessionObj.session}
        SessionsList={sessions}
      />
      {/* Only show delete account option for non-admin users */}
      {sessionObj.user.role !== "admin" && <DeleteAccount />}
    </div>
  );
}
