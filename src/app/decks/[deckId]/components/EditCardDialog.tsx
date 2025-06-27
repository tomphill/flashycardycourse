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
import { updateCardAction } from "../actions";
import { toast } from "sonner";

interface EditCardDialogProps {
  cardId: number;
  currentFront: string;
  currentBack: string;
  trigger: React.ReactNode;
}

export default function EditCardDialog({
  cardId,
  currentFront,
  currentBack,
  trigger,
}: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [front, setFront] = useState(currentFront);
  const [back, setBack] = useState(currentBack);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!front.trim() || !back.trim()) {
      toast.error("Both front and back content are required");
      return;
    }

    setLoading(true);

    try {
      const result = await updateCardAction({
        cardId,
        front: front.trim(),
        back: back.trim(),
      });

      if (result.success) {
        toast.success("Card updated successfully!");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to update card");
      }
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error("Failed to update card");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFront(currentFront);
      setBack(currentBack);
    }
    setOpen(newOpen);
  };

  const handleCancel = () => {
    setFront(currentFront);
    setBack(currentBack);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the content for both the front and back of this flashcard.
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
