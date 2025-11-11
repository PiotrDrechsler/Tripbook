import { useEffect, useState } from "react";

import { useRouteInfo } from "../../lib/hooks/useRouteInfo";
import { Button } from "../ui/button";
import { Spinner } from "./Spinner";

interface RouteInfoProps {
  tripId: string;
  autoFetch?: boolean;
}

/**
 * Formats distance in meters to a human-readable string
 * @param meters - Distance in meters
 * @returns Formatted distance string
 */
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }

  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)} km`;
}

/**
 * Formats duration in seconds to a human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} godz. ${minutes} min`;
  }

  if (minutes > 0) {
    return `${minutes} min`;
  }

  return `${seconds} sek`;
}

/**
 * Component that displays route information (distance and duration)
 * from user's current location to the trip destination
 */
export function RouteInfo({ tripId, autoFetch = false }: RouteInfoProps) {
  const { data, loading, error, fetchRoute } = useRouteInfo(tripId);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-fetch route info if autoFetch is true and no cached data
  useEffect(() => {
    if (autoFetch && tripId && !data) {
      fetchRoute(tripId).catch(() => {
        // Error is already handled in the hook
      });
    }
  }, [autoFetch, tripId, data, fetchRoute]);

  const handleFetchRoute = () => {
    // Force refresh when user clicks refresh button
    fetchRoute(tripId, true).catch(() => {
      // Error is already handled in the hook
    });
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Show button to fetch route if not loading and no data
  if (!loading && !data && !error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Informacje o trasie</h3>
            <p className="mt-1 text-sm text-gray-500">Oblicz dystans i czas dojazdu z Twojej lokalizacji</p>
          </div>
          <Button onClick={handleFetchRoute} variant="outline" size="sm">
            Oblicz trasę
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-center space-x-2">
          <Spinner />
          <span className="text-sm text-gray-600">Obliczanie trasy...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-900">Błąd obliczania trasy</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
          <Button onClick={handleFetchRoute} variant="outline" size="sm" className="ml-4">
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  // Show route data
  if (data) {
    if (isCollapsed) {
      // Collapsed view - compact bar
      return (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 transition-all duration-200">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={toggleCollapse}
              className="flex flex-1 items-center gap-2 text-left transition-all duration-200 hover:opacity-80"
              aria-label="Rozwiń informacje o trasie"
            >
              <svg
                className="size-4 flex-shrink-0 text-blue-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-blue-900">Trasa:</span>
              <span className="text-sm font-semibold text-blue-900">{formatDistance(data.distanceMeters)}</span>
              <span className="text-sm text-blue-700">•</span>
              <span className="text-sm font-semibold text-blue-900">{formatDuration(data.durationSeconds)}</span>
            </button>
            <Button onClick={handleFetchRoute} variant="ghost" size="sm" className="h-8 px-2">
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
          </div>
        </div>
      );
    }

    // Expanded view - full details
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-blue-900">Informacje o trasie</h3>
              <button
                onClick={toggleCollapse}
                className="rounded p-1 transition-all duration-200 hover:bg-blue-100"
                aria-label="Zwiń informacje o trasie"
              >
                <svg
                  className="size-4 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-700">Dystans</p>
                <p className="mt-1 text-lg font-semibold text-blue-900">{formatDistance(data.distanceMeters)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Czas dojazdu</p>
                <p className="mt-1 text-lg font-semibold text-blue-900">{formatDuration(data.durationSeconds)}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-blue-600">Z Twojej aktualnej lokalizacji</p>
              <p className="text-xs text-blue-500/70">💾 Zapisano</p>
            </div>
          </div>
          <Button onClick={handleFetchRoute} variant="ghost" size="sm" className="ml-4">
            Odśwież
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
