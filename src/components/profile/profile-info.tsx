import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { User } from "better-auth/types";
import Image from "next/image";
import Link from "next/link";

export default function ProfileInfo(props: {
  className?: string;
  name: string;
  image: User["image"] | undefined;
  joinedAt: Date;
  selfView?: boolean;
}) {
  return (
    <Card
      className={cn(
        props.className,
        "w-full max-w-2xl rounded-lg bg-emerald-50/80 p-4 shadow-md dark:bg-gray-800",
      )}
    >
      <CardContent className="flex flex-col items-center md:flex-row md:space-x-6">
        <Image
          src={props.image ?? "/fallback.svg"}
          alt="Profile Picture"
          width={128}
          height={128}
          className="rounded-2xl"
          priority
        />
        <div className="mt-4 w-full text-center md:mt-0 md:text-left">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {props.name}
          </h2>
          <div className="mt-4 flex flex-col md:flex-row md:space-x-2">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
              <Icons.calendar />
              <span>{formatDate(props.joinedAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      {props.selfView && (
        <CardFooter>
          <Button variant="outline" className="w-full md:w-auto" asChild>
            <Link href="/profile/settings">Edit Profile</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
