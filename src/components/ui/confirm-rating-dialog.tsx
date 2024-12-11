'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";

interface ConfirmRatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rating: number;
  type: 'buyer' | 'seller';
}

export function ConfirmRatingDialog({
  isOpen,
  onClose,
  onConfirm,
  rating,
  type
}: ConfirmRatingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Rating</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to rate the {type} {rating} stars? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => {
            onConfirm();
            onClose();
          }}>
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 