import { useState, useCallback, useEffect } from "react";

import type { RouteResult } from "../services/routesService";

/**
 * State for route information
 */
interface RouteInfoState {
  data: RouteResult | null;
  loading: boolean;
  error: string | null;
}

/**
 * Cached route data with timestamp
 */
interface CachedRouteData {
  result: RouteResult;
  timestamp: number;
  tripId: string;
}

/**
 * Cache duration in milliseconds (1 hour)
 */
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * LocalStorage key for cached route data
 */
const CACHE_KEY_PREFIX = "tripbook_route_";

/**
 * Gets cached route data from localStorage
 */
function getCachedRoute(tripId: string): RouteResult | null {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${tripId}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const cachedData: CachedRouteData = JSON.parse(cached);

    // Check if cache is still valid (not expired)
    const now = Date.now();
    const age = now - cachedData.timestamp;

    if (age > CACHE_DURATION) {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    }

    return cachedData.result;
  } catch {
    // If there's any error reading cache, just return null
    return null;
  }
}

/**
 * Saves route data to localStorage
 */
function setCachedRoute(tripId: string, result: RouteResult): void {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${tripId}`;
    const cachedData: CachedRouteData = {
      result,
      timestamp: Date.now(),
      tripId,
    };

    localStorage.setItem(cacheKey, JSON.stringify(cachedData));
  } catch {
    // If localStorage is full or unavailable, just continue silently
  }
}

/**
 * Gets all cached routes from localStorage
 * @returns Map of tripId to RouteResult
 */
export function getAllCachedRoutes(): Map<string, RouteResult> {
  const routes = new Map<string, RouteResult>();

  try {
    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (!cached) continue;

        const cachedData: CachedRouteData = JSON.parse(cached);

        // Check if cache is still valid (not expired)
        const now = Date.now();
        const age = now - cachedData.timestamp;

        if (age <= CACHE_DURATION) {
          routes.set(cachedData.tripId, cachedData.result);
        } else {
          // Remove expired cache
          localStorage.removeItem(key);
        }
      }
    }
  } catch {
    // If there's any error reading cache, return empty map
  }

  return routes;
}

/**
 * Hook for fetching route information from the API
 * @returns Object with route data, loading state, error, and fetch function
 */
export function useRouteInfo(tripId?: string) {
  const [state, setState] = useState<RouteInfoState>({
    data: null,
    loading: false,
    error: null,
  });

  // Load cached data on mount if tripId is provided
  useEffect(() => {
    if (tripId) {
      const cachedData = getCachedRoute(tripId);
      if (cachedData) {
        setState({
          data: cachedData,
          loading: false,
          error: null,
        });
      }
    }
  }, [tripId]);

  /**
   * Fetches route information for a given trip
   * @param tripId - The ID of the trip to get route for
   * @param forceRefresh - If true, ignores cache and fetches fresh data
   */
  const fetchRoute = useCallback(async (tripId: string, forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedRoute(tripId);
      if (cachedData) {
        setState({
          data: cachedData,
          loading: false,
          error: null,
        });
        return cachedData;
      }
    }

    // Reset state and start loading
    setState({
      data: null,
      loading: true,
      error: null,
    });

    try {
      // Get user's current location from browser
      const userLocation = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        if (!navigator?.geolocation) {
          reject(new Error("Geolocation is not supported by your browser"));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            let errorMessage = "Failed to get your location";
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Please allow location access in your browser";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out";
                break;
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      // Call API with user location
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripId,
          userLocation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const routeData: RouteResult = await response.json();

      // Save to cache
      setCachedRoute(tripId, routeData);

      setState({
        data: routeData,
        loading: false,
        error: null,
      });

      return routeData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch route information";

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  }, []);

  /**
   * Resets the route info state
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    fetchRoute,
    reset,
  };
}
