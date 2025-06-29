"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createCardAction } from "../actions";
import { toast } from "sonner";

interface AddCardDialogProps {
  deckId: number;
  trigger?: React.ReactNode;
}

export default function AddCardDialog({ deckId, trigger }: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!front.trim() || !back.trim()) {
      toast.error("Both front and back content are required");
      return;
    }

    setLoading(true);

    try {
      const result = await createCardAction({
        deckId,
        front: front.trim(),
        back: back.trim(),
      });

      if (result.success) {
        toast.success("Card created successfully!");
        setFront("");
        setBack("");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to create card");
      }
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Failed to create card");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFront("");
    setBack("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
            <DialogDescription>
              Create a new flashcard for this deck. Add content for both the
              front and back of the card.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="front">Front</Label>
              <Textarea
                id="front"
                placeholder="Enter the question or prompt..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="min-h-[100px]"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">Back</Label>
              <Textarea
                id="back"
                placeholder="Enter the answer or explanation..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="min-h-[100px]"
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !front.trim() || !back.trim()}
            >
              {loading ? "Creating..." : "Create Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
