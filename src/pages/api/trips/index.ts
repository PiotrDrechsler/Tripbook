import type { APIRoute } from "astro";
import { z } from "zod";

import { createTripSchema } from "../../../lib/schemas/tripSchema";
import { createTrip } from "../../../lib/services/tripService";
import type { CreateTripCommand, TripDto, ErrorResponseDto } from "../../../types";

export const prerender = false;

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
