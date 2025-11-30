import React from "react";
import type { TripDto } from "@/types";
import type { RouteResult } from "@/lib/services/routesService";
import { formatCoordinatesDMS } from "@/lib/utils/coordinates";

interface TripListItemProps {
  trip: TripDto;
  onTripSelected: (tripId: string) => void;
  routeInfo?: RouteResult;
}

export function TripListItem({ trip, onTripSelected, routeInfo }: TripListItemProps) {
  // Format date using Intl.DateTimeFormat
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters} m`;
    }
    const kilometers = meters / 1000;
    return `${kilometers.toFixed(1)} km`;
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const handleClick = () => {
    onTripSelected(trip.id);
    window.location.href = `/trips/${trip.id}`;
  };

  return (
    <a
      href={`/trips/${trip.id}`}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
      className="group block cursor-pointer rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex gap-4">
        {/* Left side - Content */}
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 break-all">
            {trip.name}
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
              <span>Utworzono: {formatDate(trip.created_at)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {trip.latitude !== null &&
              trip.longitude !== null &&
              typeof trip.latitude === "number" &&
              typeof trip.longitude === "number" ? (
                <span className="font-mono text-xs">{formatCoordinatesDMS(trip.latitude, trip.longitude)}</span>
              ) : (
                <span className="text-xs italic opacity-60">Brak współrzędnych</span>
              )}
            </div>

            {/* Route info from cache */}
            {routeInfo && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span className="font-semibold">{formatDistance(routeInfo.distanceMeters)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-semibold">{formatDuration(routeInfo.durationSeconds)}</span>
                </div>
              </div>
            )}
          </div>
          {trip.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2 break-all">{trip.description}</p>
          )}
        </div>

        {/* Right side - Thumbnail placeholder (TODO: Add trip photos in the future) */}
        <div className="hidden sm:flex w-32 h-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
          <svg
            className="size-12 text-primary/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}
