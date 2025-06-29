import { getUserDecks } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";
import { Protect } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Plus, Crown } from "lucide-react";
import Link from "next/link";
import { CreateDeckDialog } from "./components/CreateDeckDialog";

export default async function DashboardPage() {
  // Fetch user-specific decks using centralized query function
  const userDecks = await getUserDecks();

  // Check user's billing status
  const { has } = await auth();
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const hasThreeDeckLimit = has({ feature: "3_deck_limit" });

  const deckCount = userDecks.length;
  const isAtFreeLimit = hasThreeDeckLimit && deckCount >= 3;
  const isNearFreeLimit = hasThreeDeckLimit && deckCount >= 2;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your flashcard decks and study progress
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasUnlimitedDecks && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Pro Plan - {deckCount} decks
                </Badge>
              )}
              {hasThreeDeckLimit && (
                <Badge variant="outline">{deckCount}/3 decks</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade prompt for free users near limit */}
        {isNearFreeLimit && !isAtFreeLimit && (
          <Alert className="mb-6">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              You're using {deckCount} of 3 free decks.
              <Button variant="link" className="p-0 h-auto ml-1" asChild>
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>{" "}
              for unlimited decks and AI flashcard generation.
            </AlertDescription>
          </Alert>
        )}

        {/* Limit reached warning */}
        {isAtFreeLimit && (
          <Alert className="mb-6">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              You've reached the limit of 3 decks on the free plan.
              <Button variant="link" className="p-0 h-auto ml-1" asChild>
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>{" "}
              to create unlimited decks.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userDecks.length > 0 ? (
            userDecks.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`} className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-xl">{deck.title}</CardTitle>
                    {deck.description && (
                      <CardDescription>{deck.description}</CardDescription>
                    )}
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">
                      Last updated:{" "}
                      {new Date(deck.updatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <CardContent className="pt-6">
                  <div className="text-muted-foreground mb-4">
                    <FileText className="mx-auto h-12 w-12" />
                  </div>
                  <CardTitle className="text-lg mb-2">No decks yet</CardTitle>
                  <CardDescription className="mb-6">
                    Get started by creating your first flashcard deck
                  </CardDescription>
                  <CreateDeckDialog size="lg" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {userDecks.length > 0 && (
          <div className="mt-8 text-center">
            <Protect
              feature="unlimited_decks"
              fallback={
                isAtFreeLimit ? (
                  <Button disabled variant="outline" size="lg">
                    Upgrade to create more decks
                  </Button>
                ) : (
                  <CreateDeckDialog size="lg" variant="outline" />
                )
              }
            >
              <CreateDeckDialog size="lg" variant="outline" />
            </Protect>
          </div>
        )}
      </div>
    </div>
  );
}
