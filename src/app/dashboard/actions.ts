"use server";

import { createDeck } from "@/db/queries";
import { z } from "zod";
import { redirect } from "next/navigation";

const CreateDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
});

type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

export async function createDeckAction(input: CreateDeckInput) {
  try {
    // Validate input with Zod
    const validatedInput = CreateDeckSchema.parse(input);

    // Use centralized query function
    const newDeck = await createDeck(validatedInput);

    // Redirect to the new deck page
    redirect(`/decks/${newDeck.id}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw error;
  }
}
