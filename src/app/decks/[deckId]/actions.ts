"use server";

import {
  createCard,
  updateCard,
  deleteCard,
  updateDeck,
  deleteDeck,
  getDeckById,
} from "@/db/queries";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { generateFlashcardsWithAI } from "@/lib/ai";

// Validation schemas
const CreateCardSchema = z.object({
  deckId: z.number().positive(),
  front: z
    .string()
    .min(1, "Front content is required")
    .max(1000, "Front content is too long"),
  back: z
    .string()
    .min(1, "Back content is required")
    .max(1000, "Back content is too long"),
});

const UpdateCardSchema = z.object({
  cardId: z.number().positive(),
  front: z
    .string()
    .min(1, "Front content is required")
    .max(1000, "Front content is too long")
    .optional(),
  back: z
    .string()
    .min(1, "Back content is required")
    .max(1000, "Back content is too long")
    .optional(),
});

const DeleteCardSchema = z.object({
  cardId: z.number().positive(),
});

const UpdateDeckSchema = z.object({
  deckId: z.number(),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
});

const DeleteDeckSchema = z.object({
  deckId: z.number().positive(),
});

const AIGenerationSchema = z.object({
  deckId: z.number().positive(),
});

// Types
type CreateCardInput = z.infer<typeof CreateCardSchema>;
type UpdateCardInput = z.infer<typeof UpdateCardSchema>;
type DeleteCardInput = z.infer<typeof DeleteCardSchema>;
type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;
type DeleteDeckInput = z.infer<typeof DeleteDeckSchema>;
type AIGenerationInput = z.infer<typeof AIGenerationSchema>;

export async function createCardAction(input: CreateCardInput) {
  try {
    const validatedInput = CreateCardSchema.parse(input);

    const newCard = await createCard(validatedInput);

    // Revalidate the deck page to show the new card
    revalidatePath(`/decks/${validatedInput.deckId}`);

    return { success: true, card: newCard };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation failed: ${error.errors
          .map((e: z.ZodIssue) => e.message)
          .join(", ")}`,
      };
    }

    console.error("Error creating card:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create card",
    };
  }
}

export async function updateCardAction(input: UpdateCardInput) {
  try {
    const validatedInput = UpdateCardSchema.parse(input);

    const updatedCard = await updateCard(validatedInput.cardId, {
      front: validatedInput.front,
      back: validatedInput.back,
    });

    if (!updatedCard) {
      return {
        success: false,
        error: "Card not found or you don't have permission to update it",
      };
    }

    // Revalidate the deck page to show the updated card
    // We need to get the deckId from the card, but we don't have it directly
    // For now, we'll revalidate all deck pages (not ideal, but works)
    revalidatePath("/decks/[deckId]", "page");

    return { success: true, card: updatedCard };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation failed: ${error.errors
          .map((e: z.ZodIssue) => e.message)
          .join(", ")}`,
      };
    }

    console.error("Error updating card:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update card",
    };
  }
}

export async function deleteCardAction(input: DeleteCardInput) {
  try {
    const validatedInput = DeleteCardSchema.parse(input);

    await deleteCard(validatedInput.cardId);

    // Revalidate all deck pages to remove the deleted card
    revalidatePath("/decks/[deckId]", "page");

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation failed: ${error.errors
          .map((e: z.ZodIssue) => e.message)
          .join(", ")}`,
      };
    }

    console.error("Error deleting card:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete card",
    };
  }
}

export async function updateDeckAction(input: UpdateDeckInput) {
  try {
    const validatedInput = UpdateDeckSchema.parse(input);

    const updatedDeck = await updateDeck(validatedInput.deckId, {
      title: validatedInput.title,
      description: validatedInput.description,
    });

    if (!updatedDeck) {
      throw new Error("Deck not found or unauthorized");
    }

    // Revalidate the deck page to show updated data
    revalidatePath(`/decks/${validatedInput.deckId}`);

    return { success: true, deck: updatedDeck };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw error;
  }
}

export async function deleteDeckAction(input: DeleteDeckInput) {
  try {
    const validatedInput = DeleteDeckSchema.parse(input);

    await deleteDeck(validatedInput.deckId);

    // Revalidate the dashboard to remove the deleted deck
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation failed: ${error.errors
          .map((e: z.ZodIssue) => e.message)
          .join(", ")}`,
      };
    }

    console.error("Error deleting deck:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete deck",
    };
  }
}

export async function generateAIFlashcardsAction(input: AIGenerationInput) {
  try {
    // 1. Validate input
    const validatedInput = AIGenerationSchema.parse(input);

    // 2. Check authentication and billing
    const { has, userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const hasAIFeature =
      has({ feature: "ai_flashcard_generation" }) || has({ plan: "pro" });
    if (!hasAIFeature) {
      return {
        success: false,
        error: "AI flashcard generation requires a Pro subscription",
      };
    }

    // 3. Verify deck ownership (using centralized query)
    const deck = await getDeckById(validatedInput.deckId);
    if (!deck) {
      return {
        success: false,
        error: "Deck not found or unauthorized",
      };
    }

    // 4. Check if deck has both title and description
    if (!deck.description || deck.description.trim() === "") {
      return {
        success: false,
        error:
          "Please add a description to your deck before generating AI flashcards",
      };
    }

    // 4. Generate flashcards with AI
    const result = await generateFlashcardsWithAI(
      deck.title,
      deck.description || undefined,
      20, // Generate 20 cards as requested
      "medium"
    );

    // 5. Save generated cards to database (using centralized queries)
    const createdCards = [];
    for (const flashcard of result.flashcards) {
      const card = await createCard({
        deckId: validatedInput.deckId,
        front: flashcard.front,
        back: flashcard.back,
      });
      createdCards.push(card);
    }

    // 6. Revalidate the deck page to show the new cards
    revalidatePath(`/decks/${validatedInput.deckId}`);

    return {
      success: true,
      cards: createdCards,
      metadata: result.metadata,
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation failed: ${error.errors
          .map((e: z.ZodIssue) => e.message)
          .join(", ")}`,
      };
    }

    console.error("Error generating AI flashcards:", error);

    // Handle specific AI errors
    if (error instanceof Error) {
      if (error.message.includes("AI_ParseError")) {
        return {
          success: false,
          error:
            "Failed to generate valid flashcards. Please try again with a different prompt.",
        };
      }
      if (error.message.includes("AI_RateLimitError")) {
        return {
          success: false,
          error: "AI service is currently busy. Please try again in a moment.",
        };
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate flashcards",
    };
  }
}
