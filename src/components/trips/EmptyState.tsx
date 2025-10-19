import React from "react";

export function EmptyState() {
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold">Brak wycieczek</h3>
      <p className="text-sm text-muted-foreground">
        Nie masz jeszcze żadnych wycieczek. Zacznij dodawać swoje przygody!
      </p>
    </div>
  );
}
