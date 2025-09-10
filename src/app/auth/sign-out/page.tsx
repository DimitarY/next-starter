import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
import { auth } from "@/lib/auth";

export default async function Signout() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const userName = session.user.name;
  const userEmail = session.user.email;
  const profileImage = session.user.image || "";

  async function handleSubmit() {
    "use server";
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/auth/sign-in");
  }

  return (
    <div className="mt-[20dvh] flex justify-center px-4">
      <form action={handleSubmit}>
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
            <p className="text-muted-foreground text-sm">
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
