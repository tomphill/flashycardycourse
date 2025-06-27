"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteDeckAction } from "../actions";
import { Trash2 } from "lucide-react";

interface DeleteDeckDialogProps {
  deckId: number;
  deckTitle: string;
  cardCount: number;
  trigger: React.ReactNode;
}

export default function DeleteDeckDialog({
  deckId,
  deckTitle,
  cardCount,
  trigger,
}: DeleteDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteDeckAction({ deckId });
      if (result.success) {
        // Close dialog and navigate immediately
        setOpen(false);
        // Use replace to avoid going back to deleted deck page
        router.replace("/dashboard");
      } else {
        console.error("Failed to delete deck:", result.error);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting deck:", error);
      setIsDeleting(false);
    }
    // Don't set isDeleting to false in finally if deletion succeeded
    // to prevent any further UI updates during navigation
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Deck
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this deck? This action cannot be
            undone and will also delete all {cardCount} card
            {cardCount !== 1 ? "s" : ""} in this deck.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded border-l-4 border-destructive">
            <p className="text-sm font-medium mb-1">Deck Title:</p>
            <p className="text-sm text-muted-foreground">{deckTitle}</p>
            {cardCount > 0 && (
              <p className="text-sm text-destructive mt-2">
                ⚠️ This will permanently delete {cardCount} card
                {cardCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Deck"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
