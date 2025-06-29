import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Define Zod schema for flashcard structure
const FlashcardSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string().min(1, "Front content required"),
      back: z.string().min(1, "Back content required"),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      tags: z.array(z.string()).optional(),
    })
  ),
  metadata: z
    .object({
      topic: z.string(),
      totalCards: z.number(),
      estimatedStudyTime: z.number().optional(),
    })
    .optional(),
});

type FlashcardGenerationResult = z.infer<typeof FlashcardSchema>;

// Helper function to detect if this is language learning content
function isLanguageLearning(title: string, description?: string): boolean {
  const content = `${title} ${description || ""}`.toLowerCase();

  // Very specific patterns that clearly indicate language learning
  const specificPatterns = [
    /\benglish\s+to\s+\w+/i,
    /\w+\s+to\s+english/i,
    /\b\w+\s+vocabulary\b/i,
    /\b\w+\s+translation/i,
    /learn\s+to\s+speak\s+\w+/i,
    /\b\w+\s+phrases\b/i,
    /\b\w+\s+words\b/i,
  ];

  // Language names with specific learning context
  const languageNames = [
    "spanish",
    "french",
    "german",
    "italian",
    "portuguese",
    "russian",
    "chinese",
    "japanese",
    "korean",
    "arabic",
    "hindi",
    "indonesian",
    "dutch",
    "swedish",
    "norwegian",
    "danish",
    "polish",
    "turkish",
    "hebrew",
    "thai",
    "vietnamese",
    "hungarian",
    "finnish",
    "czech",
  ];

  // Check for explicit language learning patterns first
  if (specificPatterns.some((pattern) => pattern.test(content))) {
    return true;
  }

  // Check for language names combined with clear learning indicators
  const hasLanguageName = languageNames.some((lang) => content.includes(lang));
  const hasLearningContext =
    content.includes("vocabulary") ||
    content.includes("translation") ||
    content.includes("phrases") ||
    content.includes("words") ||
    /learn\s+\w+\s+language/i.test(content);

  return hasLanguageName && hasLearningContext;
}

// Helper function to detect source and target languages
function detectLanguages(
  title: string,
  description?: string
): { source: string; target: string } {
  const content = `${title} ${description || ""}`.toLowerCase();

  // Common patterns for language learning
  const patterns = [
    /(?:learning|learn)\s+(\w+)/i,
    /english\s+to\s+(\w+)/i,
    /(\w+)\s+to\s+english/i,
    /(\w+)\s+vocabulary/i,
    /(\w+)\s+language/i,
    /(\w+)\s+translation/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const detectedLang = match[1].toLowerCase();

      // Determine source and target based on context
      if (content.includes("english to")) {
        return { source: "English", target: capitalizeFirst(detectedLang) };
      } else if (content.includes("to english")) {
        return { source: capitalizeFirst(detectedLang), target: "English" };
      } else {
        // Default assumption: learning the detected language from English
        return { source: "English", target: capitalizeFirst(detectedLang) };
      }
    }
  }

  // Default fallback
  return { source: "English", target: "Target Language" };
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function generateFlashcardsWithAI(
  title: string,
  description?: string,
  cardCount: number = 20,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<FlashcardGenerationResult> {
  const prompt = description ? `${title}: ${description}` : title;
  const isLangLearning = isLanguageLearning(title, description);

  let systemPrompt: string;

  if (isLangLearning) {
    const { source, target } = detectLanguages(title, description);

    systemPrompt = `Generate ${cardCount} flashcards for language learning: ${prompt}

    For language learning content, create simple translation pairs:
    - Front: Word or phrase in ${source}
    - Back: Direct translation in ${target}
    - Difficulty: ${difficulty}
    - Focus on practical, commonly used vocabulary
    - No explanations or additional context needed
    
    Requirements:
    - Create exactly ${cardCount} flashcards
    - Use direct translations only
    - Cover useful everyday vocabulary
    - Progress from basic to more complex based on difficulty level
    
    Topic: ${prompt}`;
  } else {
    systemPrompt = `Generate ${cardCount} educational flashcards about: ${prompt}
    
    Create effective study cards based on the content:
    - Front: Clear questions, terms, or prompts
    - Back: Accurate answers or explanations
    - Difficulty level: ${difficulty}
    - Cover key concepts and information
    
    Requirements:
    - Create exactly ${cardCount} flashcards
    - Make cards appropriate for active recall
    - Focus on important concepts and facts
    - Ensure accuracy and educational value
    - Progress from basic to more advanced based on difficulty
    
    Topic: ${prompt}`;
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"), // Cost-effective model for flashcards
    schema: FlashcardSchema,
    prompt: systemPrompt,
    temperature: 0.7, // Balanced creativity and consistency
  });

  return object;
}
