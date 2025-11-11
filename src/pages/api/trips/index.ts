import type { APIRoute } from "astro";
import { z } from "zod";

import { createTripSchema, listTripsQuerySchema } from "../../../lib/schemas/tripSchema";
import { createTrip, listTrips } from "../../../lib/services/tripService";
import type { CreateTripCommand, TripDto, ErrorResponseDto, ListTripsParams } from "../../../types";

export const prerender = false;

/**
 * GET /api/trips
 * Retrieves a paginated and sorted list of trips
 *
 * Query parameters:
 * - page: number (optional, default: 1, min: 1)
 * - limit: number (optional, default: 20, min: 1, max: 100)
 * - sort: string (optional, default: "-created_at", allowed: name, -name, trip_date, -trip_date, created_at, -created_at)
 *
 * Responses:
 * - 200: List of trips with pagination metadata
 * - 400: Validation error (invalid query parameters)
 * - 500: Internal server error
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Parse query parameters from URL
    const searchParams = url.searchParams;
    const queryParams = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      sort: searchParams.get("sort") || undefined,
    };

    // Validate query parameters with Zod
    let validatedParams;
    try {
      validatedParams = listTripsQuerySchema.parse(queryParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];

        const errorResponse: ErrorResponseDto = {
          error: "Validation error",
          message: firstError.message,
          field: firstError.path.join("."),
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw error;
    }

    // Parse sort parameter to extract column and direction
    const sortParam = validatedParams.sort;
    const sortDirection = sortParam.startsWith("-") ? "desc" : "asc";
    const sortColumn = sortParam.startsWith("-") ? sortParam.slice(1) : sortParam;

    // Prepare parameters for service
    const params: ListTripsParams = {
      page: validatedParams.page,
      limit: validatedParams.limit,
      sortColumn,
      sortDirection,
    };

    // Call service to list trips
    const response = await listTrips(params, locals.supabase);

    // Return success response
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in GET /api/trips:", error);

    // Return generic error response
    const errorResponse: ErrorResponseDto = {
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST /api/trips
 * Creates a new trip
 *
 * Request body:
 * - name: string (required, max 100 chars)
 * - description: string | null (optional, max 2000 chars)
 * - map_url: string (required, must contain "mapy.com")
 * - trip_date: string | null (optional, ISO 8601 format YYYY-MM-DD)
 *
 * Responses:
 * - 201: Trip created successfully, returns TripDto
 * - 400: Validation error (missing/invalid fields)
 * - 422: Unprocessable entity (map_url doesn't contain "mapy.com")
 * - 500: Internal server error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const errorResponse: ErrorResponseDto = {
        error: "Bad Request",
        message: "Invalid JSON in request body",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = createTripSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        const statusCode = firstError.path.includes("map_url") && firstError.message.includes("mapy.com") ? 422 : 400;

        const errorResponse: ErrorResponseDto = {
          error: statusCode === 422 ? "Unprocessable Entity" : "Validation Error",
          message: firstError.message,
          field: firstError.path.join("."),
        };

        return new Response(JSON.stringify(errorResponse), {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw error;
    }

    // Map validated data to CreateTripCommand
    const command: CreateTripCommand = {
      name: validatedData.name,
      description: validatedData.description ?? null,
      map_url: validatedData.map_url,
      trip_date: validatedData.trip_date ?? null,
      latitude: validatedData.latitude ?? null,
      longitude: validatedData.longitude ?? null,
    };

    // Call service to create trip
    const trip = await createTrip(command, locals.supabase);

    // Map database record to TripDto (exclude user_id)
    const tripDto: TripDto = {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      map_url: trip.map_url,
      trip_date: trip.trip_date,
      latitude: trip.latitude,
      longitude: trip.longitude,
      created_at: trip.created_at,
      updated_at: trip.updated_at,
    };

    // Return success response
    return new Response(JSON.stringify(tripDto), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Return generic error response
    const errorResponse: ErrorResponseDto = {
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
