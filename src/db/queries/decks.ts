import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { decksTable, cardsTable } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function getUserDecks() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await db
    .select({
      id: decksTable.id,
      title: decksTable.title,
      description: decksTable.description,
      userId: decksTable.userId,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
      cardCount: sql<number>`COUNT(${cardsTable.id})`.as('cardCount'),
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id)
    .orderBy(desc(decksTable.updatedAt));
}

export async function canCreateDeck(): Promise<{
  canCreate: boolean;
  reason?: string;
}> {
  const { has, userId } = await auth();
  if (!userId) return { canCreate: false, reason: "Unauthorized" };

  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });

  if (hasUnlimitedDecks) {
    return { canCreate: true };
  }

  // Check deck count for free users
  const deckCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(decksTable)
    .where(eq(decksTable.userId, userId));

  const currentCount = deckCount[0]?.count || 0;

  if (currentCount >= 3) {
    return {
      canCreate: false,
      reason:
        "Free users can only create 3 decks. Upgrade to Pro for unlimited decks.",
    };
  }

  return { canCreate: true };
}

export async function getDeckCount(): Promise<number> {
  const { userId } = await auth();
  if (!userId) return 0;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(decksTable)
    .where(eq(decksTable.userId, userId));

  return result[0]?.count || 0;
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

  // Check if user can create deck
  const { canCreate, reason } = await canCreateDeck();
  if (!canCreate) {
    throw new Error(reason);
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
