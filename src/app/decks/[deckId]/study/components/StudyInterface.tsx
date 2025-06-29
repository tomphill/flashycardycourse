"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Shuffle,
} from "lucide-react";
import Link from "next/link";

interface StudyCard {
  id: number;
  front: string;
  back: string;
  deckId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Deck {
  id: number;
  title: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StudyInterfaceProps {
  deck: Deck;
  cards: StudyCard[];
}

export default function StudyInterface({ deck, cards }: StudyInterfaceProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState<StudyCard[]>([...cards]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setSessionCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleCorrect = () => {
    setCorrectCount(correctCount + 1);
    handleNext();
  };

  const handleIncorrect = () => {
    setIncorrectCount(incorrectCount + 1);
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSessionCompleted(false);
    setStudyCards([...cards]);
  };

  const progress =
    studyCards.length > 0
      ? ((currentCardIndex + 1) / studyCards.length) * 100
      : 0;

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard events during active study session (not on completion screen)
      if (sessionCompleted) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            setIsFlipped(false);
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (currentCardIndex < studyCards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setIsFlipped(false);
          } else {
            setSessionCompleted(true);
          }
          break;
        case " ": // Spacebar
          event.preventDefault();
          setIsFlipped(!isFlipped);
          break;
        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentCardIndex, studyCards.length, isFlipped, sessionCompleted]);

  if (sessionCompleted) {
    const accuracy =
      studyCards.length > 0
        ? Math.round((correctCount / studyCards.length) * 100)
        : 0;

    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Study Session Complete!
              </CardTitle>
              <CardDescription>Great job studying {deck.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {correctCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-600">
                    {incorrectCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleRestart} className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Study Again
                </Button>
                <Link href={`/decks/${deck.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Deck
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentCard = studyCards[currentCardIndex];

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link href={`/decks/${deck.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Deck
            </Button>
          </Link>
        </div>

        {/* Study Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{deck.title}</h1>
            <Button variant="outline" size="sm" onClick={handleShuffle}>
              <Shuffle className="mr-2 h-4 w-4" />
              Shuffle
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Card {currentCardIndex + 1} of {studyCards.length}
              </span>
              <span>
                {correctCount} correct, {incorrectCount} incorrect
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="text-xs text-muted-foreground text-center">
              Use ← → arrow keys to navigate • Spacebar to flip
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-6">
          <Card
            className="h-80 cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={handleFlip}
          >
            <CardContent className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-4">
                  {isFlipped ? "Back" : "Front"}
                </div>
                <div className="text-lg leading-relaxed">
                  {isFlipped ? currentCard.back : currentCard.front}
                </div>
                {!isFlipped && (
                  <div className="mt-6 text-sm text-muted-foreground">
                    Click to reveal answer
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button variant="outline" onClick={handleFlip}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Flip Card
            </Button>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentCardIndex === studyCards.length - 1}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Answer Controls (only show when card is flipped) */}
          {isFlipped && (
            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={handleIncorrect}
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Incorrect
              </Button>
              <Button
                variant="default"
                onClick={handleCorrect}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Correct
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
