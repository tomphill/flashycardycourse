import { getDeckById, getCardsByDeckId } from "@/db/queries";
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

import { ArrowLeft, Plus, Edit, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import AddCardDialog from "./components/AddCardDialog";
import EditDeckDialog from "./components/EditDeckDialog";
import EditCardDialog from "./components/EditCardDialog";
import DeleteCardDialog from "./components/DeleteCardDialog";
import DeleteDeckDialog from "./components/DeleteDeckDialog";
import AIGenerationButton from "./components/AIGenerationButton";

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const resolvedParams = await params;
  const deckId = parseInt(resolvedParams.deckId);

  if (isNaN(deckId)) {
    redirect("/dashboard");
  }

  try {
    // First check if deck exists and user has access
    const deck = await getDeckById(deckId);

    if (!deck) {
      return (
        <div className="container mx-auto py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Link href="/dashboard">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <div className="text-muted-foreground mb-4">
                  <Trash2 className="mx-auto h-16 w-16" />
                </div>
                <CardTitle className="text-2xl mb-2">Deck Not Found</CardTitle>
                <CardDescription className="text-lg mb-6">
                  The deck you&apos;re looking for doesn&apos;t exist or you
                  don&apos;t have permission to view it.
                </CardDescription>
                <Link href="/dashboard">
                  <Button size="lg">Return to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Then fetch cards for the verified deck
    const cards = await getCardsByDeckId(deckId);

    const cardCount = cards.length;

    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Deck Header */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">
                      {deck.title}
                    </CardTitle>
                    {deck.description && (
                      <CardDescription className="text-lg">
                        {deck.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <EditDeckDialog
                      deckId={deckId}
                      currentTitle={deck.title}
                      currentDescription={deck.description || undefined}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      }
                    />
                    <DeleteDeckDialog
                      deckId={deckId}
                      deckTitle={deck.title}
                      cardCount={cardCount}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="secondary">{cardCount} cards</Badge>
                  <Badge variant="outline">
                    Created {new Date(deck.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <Link href={`/decks/${deckId}/study`}>
                  <Button className="w-full" disabled={cardCount === 0}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Study Session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Cards Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Cards</h2>
              {cardCount > 0 && (
                <div className="flex gap-2">
                  <AIGenerationButton
                    deckId={deckId}
                    deckDescription={deck.description || undefined}
                  />
                  <AddCardDialog
                    deckId={deckId}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Card
                      </Button>
                    }
                  />
                </div>
              )}
            </div>

            {cardCount > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <Card
                    key={card.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="space-y-3 pt-6">
                      <div>
                        <h4 className="font-medium mb-1">Front</h4>
                        <p className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          {card.front}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Back</h4>
                        <p className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          {card.back}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <EditCardDialog
                          cardId={card.id}
                          currentFront={card.front}
                          currentBack={card.back}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                          }
                        />
                        <DeleteCardDialog
                          cardId={card.id}
                          cardFront={card.front}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent className="pt-6">
                  <div className="text-muted-foreground mb-4">
                    <Plus className="mx-auto h-12 w-12" />
                  </div>
                  <CardTitle className="text-lg mb-2">No cards yet</CardTitle>
                  <CardDescription className="mb-6">
                    Add your first flashcard to start studying
                  </CardDescription>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <AIGenerationButton
                      deckId={deckId}
                      deckDescription={deck.description || undefined}
                      size="lg"
                    />
                    <AddCardDialog
                      deckId={deckId}
                      trigger={
                        <Button size="lg">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Card
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading deck:", error);

    // Check if it's an unauthorized/not found error
    if (
      error instanceof Error &&
      (error.message.includes("unauthorized") ||
        error.message.includes("not found"))
    ) {
      return (
        <div className="container mx-auto py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Link href="/dashboard">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <div className="text-muted-foreground mb-4">
                  <Trash2 className="mx-auto h-16 w-16" />
                </div>
                <CardTitle className="text-2xl mb-2">Deck Not Found</CardTitle>
                <CardDescription className="text-lg mb-6">
                  The deck you&apos;re looking for doesn&apos;t exist or you
                  don&apos;t have permission to view it.
                </CardDescription>
                <Link href="/dashboard">
                  <Button size="lg">Return to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // For other errors, redirect to dashboard
    redirect("/dashboard");
  }
}
