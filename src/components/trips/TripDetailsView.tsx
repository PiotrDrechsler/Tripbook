import React, { useState, lazy, Suspense } from "react";
import type { TripViewModel } from "@/types";
import { Button } from "@/components/ui/button";
import { formatCoordinatesDMS } from "@/lib/utils/coordinates";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "./Spinner";
import { RouteInfo } from "./RouteInfo";

// Lazy load MapPreview component
const MapPreview = lazy(() => import("./MapPreview").then((module) => ({ default: module.MapPreview })));

interface TripDetailsViewProps {
  trip: TripViewModel;
}

export function TripDetailsView({ trip }: TripDetailsViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    window.location.href = `/trips/${trip.id}/edit`;
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Błąd podczas usuwania: ${errorData.message || "Nieznany błąd"}`);
        setIsDeleting(false);
        return;
      }

      // Success - show message and redirect
      alert("Wycieczka została usunięta");
      window.location.href = "/trips";
    } catch (error) {
      alert(`Błąd: ${error instanceof Error ? error.message : "Nieznany błąd"}`);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header with title and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <time dateTime={trip.trip_date || undefined}>{trip.displayDate}</time>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleEdit}>
            Edytuj
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? "Usuwanie..." : "Usuń"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Czy na pewno chcesz usunąć tę wycieczkę?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ta operacja jest nieodwracalna. Wycieczka &ldquo;{trip.name}&rdquo; zostanie trwale usunięta.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
                  Usuń
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main content - fills available space */}
      <div className="mt-2 grid flex-1 auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Description section */}
        <div className="flex flex-col overflow-hidden rounded-lg border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold">Opis</h2>
          <div className="flex-1 overflow-auto">
            <p className="whitespace-pre-wrap text-muted-foreground">{trip.description || "Brak opisu"}</p>
          </div>
        </div>

        {/* Map section */}
        <div className="flex flex-col overflow-hidden rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mapa</h2>
            <Button asChild variant="outline" size="sm">
              <a href={trip.map_url} target="_blank" rel="noopener noreferrer">
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Otwórz w nowej karcie
              </a>
            </Button>
          </div>

          {/* Coordinates display */}
          {trip.latitude !== null &&
          trip.longitude !== null &&
          typeof trip.latitude === "number" &&
          typeof trip.longitude === "number" ? (
            <>
              <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">📍 Współrzędne:</span>
                    <span className="text-sm font-mono text-green-700 dark:text-green-400">
                      {formatCoordinatesDMS(trip.latitude, trip.longitude)}
                    </span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`https://maps.google.com/maps?q=${trip.latitude},${trip.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs"
                    >
                      Google Maps
                    </a>
                  </Button>
                </div>
              </div>

              {/* Route information */}
              <div className="mb-4">
                <RouteInfo tripId={trip.id} />
              </div>
            </>
          ) : (
            <div className="mb-4 rounded-lg border border-muted bg-muted/20 p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">📍 Współrzędne:</span>
                <span className="text-sm italic text-muted-foreground opacity-60">
                  Brak współrzędnych - edytuj wycieczkę i dodaj link mapy.com
                </span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <Suspense fallback={<Spinner />}>
              <MapPreview mapUrl={trip.map_url} tripName={trip.name} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Bottom navigation - always visible */}
      <div className="mt-2 flex flex-shrink-0 items-center justify-between border-t border-border bg-background pt-4">
        <Button variant="outline" size="sm" asChild>
          <a href="/trips">
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Powrót do listy
          </a>
        </Button>

        <div className="hidden text-sm text-muted-foreground sm:block">
          <span>Utworzono: {new Date(trip.created_at).toLocaleDateString("pl-PL")}</span>
          <span className="mx-2">•</span>
          <span>Aktualizacja: {new Date(trip.updated_at).toLocaleDateString("pl-PL")}</span>
        </div>
      </div>
    </div>
  );
}
