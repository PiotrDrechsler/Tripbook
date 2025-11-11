import React from "react";
import type { TripDto } from "@/types";
import type { RouteResult } from "@/lib/services/routesService";
import { TripListItem } from "./TripListItem";

interface TripsListProps {
  trips: TripDto[];
  onTripSelected: (tripId: string) => void;
  cachedRoutes?: Map<string, RouteResult>;
}

export function TripsList({ trips, onTripSelected, cachedRoutes }: TripsListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripListItem
          key={trip.id}
          trip={trip}
          onTripSelected={onTripSelected}
          routeInfo={cachedRoutes?.get(trip.id)}
        />
      ))}
    </div>
  );
}
