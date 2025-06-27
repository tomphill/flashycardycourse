import { getUserDecks } from "@/db/queries";
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
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { CreateDeckDialog } from "./components/CreateDeckDialog";

export default async function DashboardPage() {
  // Fetch user-specific decks using centralized query function
  const userDecks = await getUserDecks();

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your flashcard decks and study progress
          </p>
        </div>

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
            <CreateDeckDialog size="lg" variant="outline" />
          </div>
        )}
      </div>
    </div>
  );
}
