import { useState, useEffect } from "react";
import type { TripDto, TripViewModel, ErrorResponseDto } from "@/types";

interface UseTripResult {
  data: TripViewModel | null;
  isLoading: boolean;
  error: ErrorResponseDto | null;
}

/**
 * Formats date from ISO string to display format
 * @param dateString - ISO date string (YYYY-MM-DD) or null
 * @returns Formatted date string (DD.MM.YYYY) or "Brak daty"
 */
function formatDisplayDate(dateString: string | null): string {
  if (!dateString) {
    return "Brak daty";
  }

  try {
    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
  } catch {
    return "Brak daty";
  }
}

/**
 * Maps TripDto to TripViewModel
 * @param trip - TripDto from API
 * @returns TripViewModel with formatted display date
 */
function mapToViewModel(trip: TripDto): TripViewModel {
  return {
    ...trip,
    displayDate: formatDisplayDate(trip.trip_date),
  };
}

/**
 * Custom hook for fetching a single trip by ID
 * @param id - Trip ID (UUID)
 * @returns Object with data, isLoading, and error states
 */
export function useTrip(id: string | undefined): UseTripResult {
  const [data, setData] = useState<TripViewModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ErrorResponseDto | null>(null);

  useEffect(() => {
    // Early return if no ID provided
    if (!id) {
      setIsLoading(false);
      setError({
        error: "Validation error",
        message: "Trip ID is required",
      });
      return;
    }

    const fetchTrip = async () => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await fetch(`/api/trips/${id}`);

        // Handle non-OK responses
        if (!response.ok) {
          const errorData: ErrorResponseDto = await response.json();
          setError(errorData);
          return;
        }

        const result: TripDto = await response.json();
        const viewModel = mapToViewModel(result);
        setData(viewModel);
      } catch (err) {
        setError({
          error: "Network error",
          message: err instanceof Error ? err.message : "An unexpected error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  return { data, isLoading, error };
}
