import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getUserDecks() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
}

export async function getDeckById(deckId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const deck = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .limit(1);

  return deck[0] || null;
}

export async function createDeck(data: {
  title: string;
  description?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const newDeck = await db
    .insert(decksTable)
    .values({
      ...data,
      userId,
    })
    .returning();

  return newDeck[0];
}

export async function updateDeck(
  deckId: number,
  data: { title?: string; description?: string }
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const updatedDeck = await db
    .update(decksTable)
    .set(data)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning();

  return updatedDeck[0] || null;
}

export async function deleteDeck(deckId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
}
