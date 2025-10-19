import React, { useState } from "react";

interface MapPreviewProps {
  mapUrl: string;
  tripName?: string;
}

/**
 * MapPreview component with lazy loading
 * Only loads the iframe when user clicks "Show map"
 */
export function MapPreview({ mapUrl, tripName = "Mapa" }: MapPreviewProps) {
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Validate that URL contains "mapy.com"
  const isValidMapUrl = mapUrl.includes("mapy.com");

  if (!isValidMapUrl) {
    return (
      <div className="rounded-lg border bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">Podgląd mapy niedostępny - nieprawidłowy URL</p>
      </div>
    );
  }

  if (!isMapVisible) {
    return (
      <div className="rounded-lg border bg-muted/20 p-8 text-center">
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Kliknij poniżej, aby załadować podgląd mapy</p>
        <button
          onClick={() => setIsMapVisible(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
        >
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Pokaż podgląd mapy
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden rounded-lg border" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={mapUrl}
          title={`Mapa: ${tripName}`}
          className="absolute inset-0 size-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <button
        onClick={() => setIsMapVisible(false)}
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Ukryj podgląd mapy
      </button>
    </div>
  );
}
