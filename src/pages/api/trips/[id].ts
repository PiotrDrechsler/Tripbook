import type { APIRoute } from "astro";
import { z } from "zod";

import { getTripParamsSchema } from "../../../lib/schemas/tripSchema";
import { getTripById } from "../../../lib/services/tripService";
import type { TripDto, ErrorResponseDto } from "../../../types";

export const prerender = false;

/**
 * GET /api/trips/{tripId}
 * Retrieves a single trip by its ID
 *
 * Path parameters:
 * - id: string (required, must be a valid UUID)
 *
 * Responses:
 * - 200: Trip found and returned
 * - 400: Validation error (invalid UUID format)
 * - 404: Trip not found
 * - 500: Internal server error
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Validate path parameters with Zod
    let validatedParams;
    try {
      validatedParams = getTripParamsSchema.parse(params);
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

    // Call service to get trip by ID
    const trip = await getTripById(validatedParams.id, locals.supabase);

    // Handle not found case
    if (!trip) {
      const errorResponse: ErrorResponseDto = {
        error: "Not found",
        message: `Trip with ID '${validatedParams.id}' does not exist`,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

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
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in GET /api/trips/[id]:", error);

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
