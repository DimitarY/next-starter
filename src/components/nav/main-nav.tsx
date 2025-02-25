import { MainNavClient } from "@/components/nav/main-nav-client";
import { auth } from "@/lib/auth";
import { MainNavItem } from "@/types";
import { headers } from "next/headers";

interface MainNavProps {
  items: MainNavItem[];
}

export async function MainNav({ items }: MainNavProps) {
  const userSession = await auth.api.getSession({
    headers: await headers(),
  });

  return <MainNavClient items={items} session={userSession} />;
}
