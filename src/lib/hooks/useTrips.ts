import { useState, useEffect } from "react";
import type { ListTripsResponseDto } from "@/types";

interface UseTripsParams {
  page: number;
  limit: number;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}

interface UseTripsResult {
  data: ListTripsResponseDto | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTrips(queryParams: UseTripsParams): UseTripsResult {
  const [data, setData] = useState<ListTripsResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query string
        // API expects format: "-created_at" for desc, "created_at" for asc
        const sortParam = queryParams.sortDirection === "desc" ? `-${queryParams.sortColumn}` : queryParams.sortColumn;

        const params = new URLSearchParams({
          page: queryParams.page.toString(),
          limit: queryParams.limit.toString(),
          sort: sortParam,
        });

        const response = await fetch(`/api/trips?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch trips: ${response.statusText}`);
        }

        const result: ListTripsResponseDto = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [queryParams.page, queryParams.limit, queryParams.sortColumn, queryParams.sortDirection, refetchTrigger]);

  return { data, isLoading, error, refetch };
}
