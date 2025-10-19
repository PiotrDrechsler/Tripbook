import React from "react";
import type { TripDto } from "@/types";
import { TripListItem } from "./TripListItem";

interface TripsListProps {
  trips: TripDto[];
  onTripSelected: (tripId: string) => void;
}

export function TripsList({ trips, onTripSelected }: TripsListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripListItem key={trip.id} trip={trip} onTripSelected={onTripSelected} />
      ))}
    </div>
  );
}
