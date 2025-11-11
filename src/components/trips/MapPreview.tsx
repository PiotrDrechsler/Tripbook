import React from "react";

interface MapPreviewProps {
  mapUrl: string;
  tripName?: string;
}

/**
 * MapPreview component - always visible with reduced height
 */
export function MapPreview({ mapUrl, tripName = "Mapa" }: MapPreviewProps) {
  // Validate that URL contains "mapy.com"
  const isValidMapUrl = mapUrl.includes("mapy.com");

  if (!isValidMapUrl) {
    return (
      <div className="rounded-lg border bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">Podgląd mapy niedostępny - nieprawidłowy URL</p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[400px] w-full overflow-hidden rounded-lg border">
      <iframe
        src={mapUrl}
        title={`Mapa: ${tripName}`}
        className="absolute inset-0 size-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
