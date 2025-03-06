"use client";

import { Icons } from "@/components/icons";
import { AccountNav } from "@/components/nav/account-nav";
import { ModeToggle } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { User } from "@/lib/auth";
import { MainNavItem } from "@/types";
import { Session } from "better-auth";
import Link from "next/link";

interface userSession {
  session: Session;
  user: User;
}

interface MainNavProps {
  items: MainNavItem[];
  session: userSession | null;
}

function MobileNav({ items, session }: MainNavProps) {
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer lg:hidden"
          >
            <Icons.menu />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-4">
          <SheetTitle className="sr-only">Mobile navigation</SheetTitle>
          <SheetClose asChild>
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <Icons.logo />
              </Link>
            </Button>
          </SheetClose>
          {items.length ? (
            <div className="grid gap-2 py-6">
              {items.map((item, index) =>
                "href" in item ? (
                  <SheetClose key={index} asChild>
                    <Link
                      href={item.href}
                      className="flex w-full items-center py-2 font-semibold"
                    >
                      {item.title}
                    </Link>
                  </SheetClose>
                ) : (
                  <Collapsible key={index} className="grid gap-4 py-2">
                    <CollapsibleTrigger className="flex w-full items-center font-semibold [&[data-state=open]>svg]:rotate-90">
                      {item.title}
                      <Icons.chevronRight className="ml-auto size-5 transition-all" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid gap-2">
                        {item.subItems.map((subItem, subIndex) => (
                          <div
                            key={subIndex}
                            className="rounded-md border px-4 py-3 font-mono text-sm"
                          >
                            <SheetClose asChild>
                              <Link
                                href={subItem.href}
                                className="group grid h-auto w-full justify-start gap-1"
                              >
                                <div className="text-sm leading-none font-medium group-hover:underline">
                                  {subItem.title}
                                </div>
                                {subItem.description != undefined && (
                                  <div className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                    {subItem.description}
                                  </div>
                                )}
                              </Link>
                            </SheetClose>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ),
              )}
            </div>
          ) : null}
          <SheetFooter className="flex flex-row flex-wrap gap-2">
            {session ? (
              <>
                <AccountNav session={session} />
                <ModeToggle />
              </>
            ) : (
              <>
                <ModeToggle />
                <div>
                  <SheetClose asChild>
                    <Button asChild variant="outline">
                      <Link href="/auth/sign-in">Sign In</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild>
                      <Link href="/auth/sign-up">Sign Up</Link>
                    </Button>
                  </SheetClose>
                </div>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <div className="w-[150px]">
        <Link href="/" className="mr-6 hidden lg:flex">
          <Icons.logo />
          <span className="sr-only">Acme Inc</span>
        </Link>
      </div>
    </>
  );
}

function DesktopNav({ items, session }: MainNavProps) {
  return (
    <>
      <NavigationMenu className="hidden lg:flex">
        {items.length ? (
          <NavigationMenuList>
            {items.map((item, index) =>
              "href" in item ? (
                <NavigationMenuLink key={index} asChild>
                  <Link
                    href={item.href}
                    className="group bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-active:bg-accent/50 data-[state=open]:bg-accent/50 inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                  >
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              ) : (
                <NavigationMenuItem key={index}>
                  <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-1 p-2">
                      {item.subItems.map((subItem, subIndex) => (
                        <NavigationMenuLink key={subIndex} asChild>
                          <Link
                            href={subItem.href}
                            className="group bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-active:bg-accent/50 data-[state=open]:bg-accent/50 grid h-auto w-full items-center justify-start gap-1 rounded-md p-4 text-sm font-medium transition-colors focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                          >
                            <div className="text-sm leading-none font-medium group-hover:underline">
                              {subItem.title}
                            </div>
                            {subItem.description != undefined && (
                              <div className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                {subItem.description}
                              </div>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        ) : null}
      </NavigationMenu>
      <div className="ml-auto hidden gap-2 lg:flex">
        <ModeToggle />
        {session ? (
          <AccountNav session={session} />
        ) : (
          <>
            <Button asChild variant="outline">
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </>
  );
}

export function MainNavClient(props: MainNavProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <MobileNav items={props.items} session={props.session} />
      ) : (
        <DesktopNav items={props.items} session={props.session} />
      )}
    </>
  );
}
