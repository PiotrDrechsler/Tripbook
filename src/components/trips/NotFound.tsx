import React from "react";
import { Button } from "@/components/ui/button";

interface NotFoundProps {
  message?: string;
}

export function NotFound({ message = "Nie znaleziono wycieczki" }: NotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/10 py-16 px-6 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
        <svg
          className="size-8 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold">404 - Nie znaleziono</h3>
      <p className="mb-6 text-sm text-muted-foreground">{message}</p>
      <Button asChild>
        <a href="/trips">Powrót do listy wycieczek</a>
      </Button>
    </div>
  );
}
