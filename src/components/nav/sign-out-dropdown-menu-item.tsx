"use client";

import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SheetClose } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { auth } from "@/lib/client/auth";

export default function SignOutDropdownMenuItem() {
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await auth.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
        },
      },
    });
  };

  const MenuItem = (
    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2">
      <Icons.logOut />
      <span>Sign out</span>
    </DropdownMenuItem>
  );

  return isMobile ? <SheetClose asChild>{MenuItem}</SheetClose> : MenuItem;
}
