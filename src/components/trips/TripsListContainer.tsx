import React, { useState, useEffect, useMemo } from "react";
import type { RouteResult } from "@/lib/services/routesService";
import { useTrips } from "@/lib/hooks/useTrips";
import { getAllCachedRoutes } from "@/lib/hooks/useRouteInfo";
import { Spinner } from "./Spinner";
import { ErrorMessage } from "./ErrorMessage";
import { EmptyState } from "./EmptyState";
import { TripsList } from "./TripsList";
import { Pagination } from "./Pagination";
import { AddTripButton } from "./AddTripButton";
import { CreateTripModal } from "./CreateTripModal";
import { Button } from "../ui/button";

interface TripsListContainerProps {
  onTripSelected?: (tripId: string) => void;
}

type SortOption = "created_at" | "distance" | "duration";

export default function TripsListContainer({ onTripSelected }: TripsListContainerProps) {
  // Query parameters state
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortColumn: "created_at",
    sortDirection: "desc" as const,
  });

  // Sort option state (for client-side sorting)
  const [sortOption, setSortOption] = useState<SortOption>("created_at");

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Cached routes from localStorage
  const [cachedRoutes, setCachedRoutes] = useState<Map<string, RouteResult>>(new Map());

  // Load cached routes on mount
  useEffect(() => {
    const routes = getAllCachedRoutes();
    setCachedRoutes(routes);
  }, []);

  // Fetch trips using the custom hook
  const { data, isLoading, error, refetch } = useTrips(queryParams);

  // Sort trips by distance or duration (client-side)
  const sortedTrips = useMemo(() => {
    if (!data?.data) return [];

    const trips = [...data.data];

    if (sortOption === "distance") {
      return trips.sort((a, b) => {
        const routeA = cachedRoutes.get(a.id);
        const routeB = cachedRoutes.get(b.id);

        // Trips without route info go to the end
        if (!routeA && !routeB) return 0;
        if (!routeA) return 1;
        if (!routeB) return -1;

        return routeA.distanceMeters - routeB.distanceMeters;
      });
    }

    if (sortOption === "duration") {
      return trips.sort((a, b) => {
        const routeA = cachedRoutes.get(a.id);
        const routeB = cachedRoutes.get(b.id);

        // Trips without route info go to the end
        if (!routeA && !routeB) return 0;
        if (!routeA) return 1;
        if (!routeB) return -1;

        return routeA.durationSeconds - routeB.durationSeconds;
      });
    }

    // Default: sort by created_at (already sorted by API)
    return trips;
  }, [data?.data, sortOption, cachedRoutes]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    // Reset to first page when changing sort
    setQueryParams((prev) => ({ ...prev, page: 1 }));
  };

  // Handle trip selection
  const handleTripSelected = (tripId: string) => {
    if (onTripSelected) {
      onTripSelected(tripId);
    }
  };

  // Handle modal open/close
  const handleOpenModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  // Handle successful trip creation
  const handleTripCreated = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return <Spinner />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  // Empty state
  if (!data || data.data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Moje wycieczki</h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Zarządzaj swoimi trasami i planuj nowe wyprawy
            </p>
          </div>
          <AddTripButton onOpen={handleOpenModal} />
        </div>
        <EmptyState />
        <CreateTripModal isOpen={isCreateModalOpen} onClose={handleCloseModal} onSuccess={handleTripCreated} />
      </div>
    );
  }

  // Success state with data
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Moje wycieczki</h1>
        <AddTripButton onOpen={handleOpenModal} />
      </div>

      {/* Sort buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={sortOption === "created_at" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("created_at")}
        >
          <svg
            className="mr-1.5 size-4"
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
          Data utworzenia
        </Button>
        <Button
          variant={sortOption === "distance" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("distance")}
          disabled={cachedRoutes.size === 0}
        >
          <svg
            className="mr-1.5 size-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Odległość
          {cachedRoutes.size > 0 && <span className="ml-1.5 text-xs opacity-70">({cachedRoutes.size})</span>}
        </Button>
        <Button
          variant={sortOption === "duration" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("duration")}
          disabled={cachedRoutes.size === 0}
        >
          <svg
            className="mr-1.5 size-4"
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
          Czas dojazdu
          {cachedRoutes.size > 0 && <span className="ml-1.5 text-xs opacity-70">({cachedRoutes.size})</span>}
        </Button>
      </div>

      <div className="mt-4 flex-1 overflow-auto">
        <TripsList trips={sortedTrips} onTripSelected={handleTripSelected} cachedRoutes={cachedRoutes} />
      </div>

      <div className="mt-4 flex-shrink-0 border-t bg-background pt-4">
        <Pagination pagination={data.pagination} onPageChange={handlePageChange} />
      </div>

      <CreateTripModal isOpen={isCreateModalOpen} onClose={handleCloseModal} onSuccess={handleTripCreated} />
    </div>
  );
}
