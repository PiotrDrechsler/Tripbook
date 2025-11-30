import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateTripForm } from "@/components/trips/CreateTripForm";

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTripModal({ isOpen, onClose, onSuccess }: CreateTripModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]" aria-modal="true" data-testid="create-trip-modal">
        <DialogHeader>
          <DialogTitle>Dodaj nową trasę</DialogTitle>
          <DialogDescription>Wypełnij formularz, aby dodać nową wycieczkę do swojej kolekcji.</DialogDescription>
        </DialogHeader>
        <CreateTripForm onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
