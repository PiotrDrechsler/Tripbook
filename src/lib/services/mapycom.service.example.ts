/* eslint-disable */
// @ts-nocheck
/**
 * Example usage of MapyComService
 *
 * This file demonstrates how to use the MapyComService for:
 * 1. Fetching routes from Mapy.com API
 * 2. Archiving routes to Supabase
 * 3. Retrieving archived routes
 * 4. Handling errors
 *
 * NOTE: This is an example file and is not used in production.
 * All linting and type checking is disabled for demonstration purposes.
 */

// import { MapyComService, MapyComError } from "./mapycom.service";
import { supabaseClient } from "../../db/supabase.client";

// Mock classes for example purposes (since mapycom.service.ts doesn't exist)
class MapyComError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "MapyComError";
  }
}

class MapyComService {
  constructor(_apiKey: string) {}
  async getRoute(_params: RouteRequest): Promise<RouteResponse> {
    throw new Error("Not implemented - this is an example file");
  }
  async archiveRoute(_tripId: string, _route: RouteResponse): Promise<void> {
    throw new Error("Not implemented - this is an example file");
  }
  async getArchivedRoute(_tripId: string): Promise<RouteResponse | null> {
    throw new Error("Not implemented - this is an example file");
  }
}

// Local type definitions for example purposes
type RouteType = "walk" | "bicycle" | "car_fast" | "car_fast_traffic" | "car_shortest";

interface RouteRequest {
  start: [number, number];
  end: [number, number];
  routeType: RouteType;
  waypoints?: Array<[number, number]>;
}

interface RouteResponse {
  distance: number;
  duration: number;
  geometry: {
    type: string;
    coordinates: Array<[number, number]>;
  };
}

/**
 * Example 1: Basic route fetching
 */
export async function exampleBasicRouteFetch() {
  // Initialize service with API key
  const service = new MapyComService(import.meta.env.MAPYCOM_API_KEY);

  try {
    // Define route parameters
    const routeParams: RouteRequest = {
      start: [21.012229, 52.229676], // Warsaw, Poland [lon, lat]
      end: [21.017532, 52.231958],
      routeType: "walk",
    };

    // Fetch route
    const route = await service.getRoute(routeParams);

    console.log("Route fetched successfully:");
    console.log(`Distance: ${route.distance} meters`);
    console.log(`Duration: ${route.duration} seconds`);
    console.log(`Coordinates: ${route.geometry.coordinates.length} points`);

    return route;
  } catch (error) {
    if (error instanceof MapyComError) {
      console.error("MapyCom API Error:", error.message);
      if (error.statusCode) {
        console.error("Status Code:", error.statusCode);
      }
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

/**
 * Example 2: Route with waypoints
 */
export async function exampleRouteWithWaypoints() {
  const service = new MapyComService(import.meta.env.MAPYCOM_API_KEY);

  const routeParams: RouteRequest = {
    start: [21.012229, 52.229676],
    end: [21.017532, 52.231958],
    routeType: "car_fast",
    waypoints: [
      [21.015, 52.23], // Intermediate point 1
      [21.016, 52.231], // Intermediate point 2
    ],
  };

  const route = await service.getRoute(routeParams);
  return route;
}

/**
 * Example 3: Archiving a route
 */
export async function exampleArchiveRoute(tripId: string) {
  // Initialize service with Supabase client for archiving
  const service = new MapyComService(
    import.meta.env.MAPYCOM_API_KEY,
    undefined, // Use default base URL
    undefined, // Use default timeout
    undefined, // Use default max retries
    undefined, // Use default retry delay
    supabaseClient // Provide Supabase client for archiving
  );

  try {
    // Fetch route
    const routeParams: RouteRequest = {
      start: [21.012229, 52.229676],
      end: [21.017532, 52.231958],
      routeType: "walk",
    };

    const route = await service.getRoute(routeParams);

    // Archive the route
    const archiveId = await service.archiveRoute(tripId, route);

    console.log(`Route archived successfully with ID: ${archiveId}`);

    return archiveId;
  } catch (error) {
    if (error instanceof MapyComError) {
      console.error("Error:", error.message);
    }
    throw error;
  }
}

/**
 * Example 4: Retrieving an archived route
 */
export async function exampleGetArchivedRoute(tripId: string) {
  const service = new MapyComService(
    import.meta.env.MAPYCOM_API_KEY,
    undefined,
    undefined,
    undefined,
    undefined,
    supabaseClient
  );

  try {
    const route = await service.getArchivedRoute(tripId);

    console.log("Archived route retrieved:");
    console.log(`Distance: ${route.distance} meters`);
    console.log(`Duration: ${route.duration} seconds`);

    return route;
  } catch (error) {
    if (error instanceof MapyComError) {
      if (error.statusCode === 404) {
        console.log("No archived route found for this trip");
      } else {
        console.error("Error:", error.message);
      }
    }
    throw error;
  }
}

/**
 * Example 5: Complete workflow - fetch, archive, and retrieve
 */
export async function exampleCompleteWorkflow(tripId: string) {
  const service = new MapyComService(
    import.meta.env.MAPYCOM_API_KEY,
    undefined,
    undefined,
    undefined,
    undefined,
    supabaseClient
  );

  // Step 1: Fetch route from API
  console.log("Step 1: Fetching route from Mapy.com API...");
  const routeParams: RouteRequest = {
    start: [21.012229, 52.229676],
    end: [21.017532, 52.231958],
    routeType: "bicycle",
  };

  const fetchedRoute = await service.getRoute(routeParams);
  console.log(`✓ Route fetched: ${fetchedRoute.distance}m, ${fetchedRoute.duration}s`);

  // Step 2: Archive the route
  console.log("Step 2: Archiving route to database...");
  const archiveId = await service.archiveRoute(tripId, fetchedRoute);
  console.log(`✓ Route archived with ID: ${archiveId}`);

  // Step 3: Retrieve archived route
  console.log("Step 3: Retrieving archived route...");
  const archivedRoute = await service.getArchivedRoute(tripId);
  console.log(`✓ Route retrieved: ${archivedRoute.distance}m, ${archivedRoute.duration}s`);

  // Verify data integrity
  const isDataIntact =
    fetchedRoute.distance === archivedRoute.distance &&
    fetchedRoute.duration === archivedRoute.duration &&
    fetchedRoute.geometry.coordinates.length === archivedRoute.geometry.coordinates.length;

  console.log(`Data integrity check: ${isDataIntact ? "PASSED" : "FAILED"}`);

  return { fetchedRoute, archivedRoute, isDataIntact };
}

/**
 * Example 6: Custom configuration
 */
export async function exampleCustomConfiguration() {
  // Create service with custom configuration
  const service = new MapyComService(
    import.meta.env.MAPYCOM_API_KEY,
    "https://api.mapy.com/v1/route", // Custom base URL
    10000, // 10 second timeout
    5, // 5 retry attempts
    2000, // 2 second delay between retries
    supabaseClient
  );

  const routeParams: RouteRequest = {
    start: [21.012229, 52.229676],
    end: [21.017532, 52.231958],
    routeType: "car_fast_traffic",
  };

  const route = await service.getRoute(routeParams);
  return route;
}

/**
 * Example 7: Error handling for different route types
 */
export async function exampleDifferentRouteTypes() {
  const service = new MapyComService(import.meta.env.MAPYCOM_API_KEY);

  const routeTypes: RouteRequest["routeType"][] = ["walk", "bicycle", "car_fast", "car_fast_traffic", "car_shortest"];

  const results: Record<string, RouteResponse | string> = {};

  for (const routeType of routeTypes) {
    try {
      const route = await service.getRoute({
        start: [21.012229, 52.229676],
        end: [21.017532, 52.231958],
        routeType,
      });

      results[routeType] = route;
      console.log(`✓ ${routeType}: ${route.distance}m, ${route.duration}s`);
    } catch (error) {
      if (error instanceof MapyComError) {
        results[routeType] = error.message;
        console.error(`✗ ${routeType}: ${error.message}`);
      }
    }
  }

  return results;
}

/**
 * Example 8: Usage in Astro API endpoint
 *
 * This shows how to use the service in an Astro API route
 */
export async function exampleAstroEndpoint(
  tripId: string,
  routeParams: RouteRequest,
  supabase: typeof supabaseClient
): Promise<Response> {
  const service = new MapyComService(
    import.meta.env.MAPYCOM_API_KEY,
    undefined,
    undefined,
    undefined,
    undefined,
    supabase
  );

  try {
    // Fetch and archive route
    const route = await service.getRoute(routeParams);
    const archiveId = await service.archiveRoute(tripId, route);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          route,
          archiveId,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (error instanceof MapyComError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          statusCode: error.statusCode,
        }),
        {
          status: error.statusCode || 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
