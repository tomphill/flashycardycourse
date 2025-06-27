import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  // If user is logged in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignedOut>
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-foreground">FlashyCardy</h1>
            <h2 className="text-2xl text-muted-foreground">
              Your personal flashcard platform
            </h2>
          </div>

          <div className="flex gap-4 justify-center">
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <Button>Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
              <Button variant="outline">Sign Up</Button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">
            Redirecting to dashboard...
          </h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </SignedIn>
    </div>
  );
}
