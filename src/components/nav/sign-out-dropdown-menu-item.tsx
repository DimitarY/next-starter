"use client";

import { Icons } from "@/components/icons";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/client/auth";
import { useRouter } from "next/navigation";

export default function SignOutDropdownMenuItem() {
  const router = useRouter();

  return (
    <DropdownMenuItem
      onClick={async () =>
        await auth.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.refresh();
            },
          },
        })
      }
      className="cursor-pointer gap-2"
    >
      <Icons.logOut />
      <span>Sign out</span>
    </DropdownMenuItem>
  );
}
