import React, { useState } from "react";
import { useTrips } from "@/lib/hooks/useTrips";
import { Spinner } from "./Spinner";
import { ErrorMessage } from "./ErrorMessage";
import { EmptyState } from "./EmptyState";
import { TripsList } from "./TripsList";
import { Pagination } from "./Pagination";
import { AddTripButton } from "./AddTripButton";
import { CreateTripModal } from "./CreateTripModal";

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

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch trips using the custom hook
  const { data, isLoading, error, refetch } = useTrips(queryParams);

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

      <TripsList trips={data.data} onTripSelected={handleTripSelected} />
      <Pagination pagination={data.pagination} onPageChange={handlePageChange} />

      <CreateTripModal isOpen={isCreateModalOpen} onClose={handleCloseModal} onSuccess={handleTripCreated} />
    </div>
  );
}
