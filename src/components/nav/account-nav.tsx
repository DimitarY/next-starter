"use client";

import type { Session } from "better-auth";
import Link from "next/link";
import { Icons } from "@/components/icons";
import SignOutDropdownMenuItem from "@/components/nav/sign-out-dropdown-menu-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SheetClose } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";
import type { User } from "@/lib/auth";
import { UserRoleClient } from "@/lib/client/auth";

interface userSession {
  session: Session;
  user: User;
}

export function AccountNav({ session }: { session: userSession }) {
  const isMobile = useIsMobile();

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Avatar>
              <AvatarImage
                src={session.user.image || ""}
                alt={session.user.name}
              />
              <AvatarFallback>
                {session.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Welcome {session.user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="cursor-pointer">
              {isMobile ? (
                <SheetClose asChild>
                  <Link href="/profile" className="flex gap-2">
                    <Icons.user />
                    <span>Profile</span>
                  </Link>
                </SheetClose>
              ) : (
                <Link href="/profile" className="flex gap-2">
                  <Icons.user />
                  <span>Profile</span>
                </Link>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              {isMobile ? (
                <SheetClose asChild>
                  <Link href="/profile/settings" className="flex gap-2">
                    <Icons.settings />
                    <span>Settings</span>
                  </Link>
                </SheetClose>
              ) : (
                <Link href="/profile/settings" className="flex gap-2">
                  <Icons.settings />
                  <span>Settings</span>
                </Link>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {session.user.role === UserRoleClient.admin && (
            <DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                {isMobile ? (
                  <SheetClose asChild>
                    <Link href="/dashboard" className="flex gap-2">
                      <Icons.dashboard />
                      <span>Admin panel</span>
                    </Link>
                  </SheetClose>
                ) : (
                  <Link href="/dashboard" className="flex gap-2">
                    <Icons.dashboard />
                    <span>Admin panel</span>
                  </Link>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}
          <DropdownMenuSeparator />
          <SignOutDropdownMenuItem />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
