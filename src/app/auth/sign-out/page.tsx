import { signOut } from "@/auth";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import auth from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Signout() {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign-in");
  }
  const userName = session.user.name as string;
  const userEmail = session.user.email as string;
  const profileImage = session.user?.image as string;

  // FIXME: Vertical centering is broken
  return (
    <div className="flex flex-grow items-center justify-center px-4">
      <form
        action={async () => {
          "use server";
          await signOut().then(() => redirect("/"));
        }}
      >
        <Card className="w-[350px]">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={profileImage} alt={userName} />
                <AvatarFallback>
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{userName}</CardTitle>
                <CardDescription>{userEmail}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to sign out?
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="destructive" type="submit">
              <Icons.logOut className="mr-2" />
              <span>Sign out</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
