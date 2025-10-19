import React from "react";
import type { TripDto } from "@/types";

interface TripListItemProps {
  trip: TripDto;
  onTripSelected: (tripId: string) => void;
}

export function TripListItem({ trip, onTripSelected }: TripListItemProps) {
  // Format date using Intl.DateTimeFormat
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
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
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {trip.name}
        </h3>
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
        {trip.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{trip.description}</p>}
      </div>
    </a>
  );
}
