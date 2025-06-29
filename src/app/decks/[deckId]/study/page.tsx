import { getDeckById, getCardsByDeckId } from "@/db/queries";
import { redirect } from "next/navigation";
import StudyInterface from "./components/StudyInterface";

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const resolvedParams = await params;
  const deckId = parseInt(resolvedParams.deckId);

  if (isNaN(deckId)) {
    redirect("/dashboard");
  }

  try {
    // Fetch deck and cards using centralized query functions
    const [deck, cards] = await Promise.all([
      getDeckById(deckId),
      getCardsByDeckId(deckId),
    ]);

    if (!deck) {
      redirect("/dashboard");
    }

    if (cards.length === 0) {
      redirect(`/decks/${deckId}`);
    }

    return <StudyInterface deck={deck} cards={cards} />;
  } catch (error) {
    console.error("Error loading deck and cards:", error);
    redirect("/dashboard");
  }
}
