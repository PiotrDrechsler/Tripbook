import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface AddTripButtonProps {
  onOpen: () => void;
}

export function AddTripButton({ onOpen }: AddTripButtonProps) {
  return (
    <Button onClick={onOpen} className="w-full gap-2 sm:w-auto" data-testid="add-trip-button">
      <PlusIcon />
      Dodaj trasę
    </Button>
  );
}
