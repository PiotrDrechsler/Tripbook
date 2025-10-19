import React, { useState, lazy, Suspense } from "react";
import type { TripViewModel } from "@/types";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
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

      {/* Description section */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold">Opis</h2>
        <p className="text-muted-foreground whitespace-pre-wrap">{trip.description || "Brak opisu"}</p>
      </div>

      {/* Map section */}
      <div className="rounded-lg border bg-card p-6">
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
        <Suspense fallback={<Spinner />}>
          <MapPreview mapUrl={trip.map_url} tripName={trip.name} />
        </Suspense>
      </div>

      {/* Metadata section */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold">Informacje dodatkowe</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Utworzono:</dt>
            <dd>{new Date(trip.created_at).toLocaleString("pl-PL")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Ostatnia aktualizacja:</dt>
            <dd>{new Date(trip.updated_at).toLocaleString("pl-PL")}</dd>
          </div>
        </dl>
      </div>

      {/* Back button */}
      <div className="flex justify-start">
        <Button variant="outline" asChild>
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
      </div>
    </div>
  );
}
