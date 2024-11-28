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
  SheetTrigger,
} from "@/components/ui/sheet";
import Auth from "@/lib/auth";
import { MainNavItem } from "@/types";
import Link from "next/link";

interface MainNavProps {
  items: MainNavItem[];
}

function AuthButtons() {
  return (
    <>
      <Button asChild variant="outline">
        <Link href="/auth/sign-in">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/sign-up">Sign Up</Link>
      </Button>
    </>
  );
}

export default async function MainNav({ items }: MainNavProps) {
  const session = await Auth(); // TODO: Because of this, every page that use MainNav will be Dynamic

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Icons.menu />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetClose asChild>
            <Link href="/">
              <Icons.logo />
            </Link>
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
                      <Icons.chevronRight className="ml-auto h-5 w-5 transition-all" />
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
                                <div className="text-sm font-medium leading-none group-hover:underline">
                                  {subItem.title}
                                </div>
                                {subItem.description != undefined && (
                                  <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
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
          <div className="mt-4 flex gap-2">
            <ModeToggle />
            {session ? <AccountNav /> : <AuthButtons />}
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-[150px]">
        <Link href="/" className="mr-6 hidden lg:flex">
          <Icons.logo />
          <span className="sr-only">Acme Inc</span>
        </Link>
      </div>
      <NavigationMenu className="hidden lg:flex">
        {items.length ? (
          <NavigationMenuList>
            {items.map((item, index) =>
              "href" in item ? (
                <NavigationMenuLink key={index} asChild>
                  <Link
                    href={item.href}
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
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
                            className="group grid h-auto w-full items-center justify-start gap-1 rounded-md bg-background p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            <div className="text-sm font-medium leading-none group-hover:underline">
                              {subItem.title}
                            </div>
                            {subItem.description != undefined && (
                              <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
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
        {session ? <AccountNav /> : <AuthButtons />}
      </div>
    </>
  );
}
