"use client";

import { useState } from "react";
import { Protect } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { generateAIFlashcardsAction } from "../actions";

interface AIGenerationButtonProps {
  deckId: number;
  deckDescription?: string;
  size?: "sm" | "lg";
}

export default function AIGenerationButton({
  deckId,
  deckDescription,
  size = "sm",
}: AIGenerationButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const hasDescription = deckDescription && deckDescription.trim() !== "";

  const handleGenerate = async () => {
    if (!hasDescription) {
      alert(
        "Please add a description to your deck before generating AI flashcards."
      );
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAIFlashcardsAction({ deckId });

      if (result.success) {
        // Success - cards will be automatically shown due to revalidatePath
        console.log(
          `Generated ${result.cards?.length || 0} cards successfully`
        );
      } else {
        // Handle error
        console.error("AI Generation failed:", result.error);
        alert(result.error); // TODO: Replace with proper toast notification
      }
    } catch (error) {
      console.error("AI Generation error:", error);
      alert("Failed to generate flashcards. Please try again."); // TODO: Replace with proper toast notification
    } finally {
      setIsGenerating(false);
    }
  };

  // If deck doesn't have a description, show disabled button with tooltip
  if (!hasDescription) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <Button variant="outline" size={size} disabled>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Please add a description to your deck to enable AI generation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Protect
      feature="ai_flashcard_generation"
      fallback={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/pricing">
                <Button variant="outline" size={size}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI flashcard generation is a Pro feature. Click to upgrade!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    >
      <Button
        variant="outline"
        size={size}
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </>
        )}
      </Button>
    </Protect>
  );
}
