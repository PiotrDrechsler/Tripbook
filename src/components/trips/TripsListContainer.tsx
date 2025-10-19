import React, { useState } from "react";
import { useTrips } from "@/lib/hooks/useTrips";
import { Spinner } from "./Spinner";
import { ErrorMessage } from "./ErrorMessage";
import { EmptyState } from "./EmptyState";
import { TripsList } from "./TripsList";
import { Pagination } from "./Pagination";

interface TripsListContainerProps {
  onTripSelected?: (tripId: string) => void;
}

export default function TripsListContainer({ onTripSelected }: TripsListContainerProps) {
  // Query parameters state
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortColumn: "created_at",
    sortDirection: "desc" as const,
  });

  // Fetch trips using the custom hook
  const { data, isLoading, error } = useTrips(queryParams);

  // Handle page change
  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  // Handle trip selection
  const handleTripSelected = (tripId: string) => {
    if (onTripSelected) {
      onTripSelected(tripId);
    }
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
    return <EmptyState />;
  }

  // Success state with data
  return (
    <div className="space-y-6">
      <TripsList trips={data.data} onTripSelected={handleTripSelected} />
      <Pagination pagination={data.pagination} onPageChange={handlePageChange} />
    </div>
  );
}
