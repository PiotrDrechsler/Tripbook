import type { APIRoute } from "astro";
import { z } from "zod";

import { getTripParamsSchema, updateTripSchema } from "../../../lib/schemas/tripSchema";
import { getTripById, updateTrip, deleteTrip } from "../../../lib/services/tripService";
import type { TripDto, ErrorResponseDto, UpdateTripCommand } from "../../../types";

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
    // Check authentication
    const user = locals.user;
    if (!user) {
      const errorResponse: ErrorResponseDto = {
        error: "Unauthorized",
        message: "Musisz być zalogowany",
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    // Call service to get trip by ID (filtered by user_id)
    const trip = await getTripById(validatedParams.id, user.id, locals.supabase);

    // Handle not found case (or not owned by user)
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
      latitude: trip.latitude,
      longitude: trip.longitude,
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

/**
 * PATCH /api/trips/{tripId}
 * Updates an existing trip partially
 *
 * Path parameters:
 * - id: string (required, must be a valid UUID)
 *
 * Request body (all fields optional):
 * - name: string (max 100 characters)
 * - description: string | null (max 2000 characters)
 * - map_url: string (must contain "mapy.com")
 * - trip_date: string | null (ISO 8601 format: YYYY-MM-DD)
 *
 * Responses:
 * - 200: Trip successfully updated
 * - 400: Validation error (invalid UUID format or invalid field values)
 * - 404: Trip not found
 * - 422: Unprocessable entity (map_url doesn't contain "mapy.com")
 * - 500: Internal server error
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    // Check authentication
    const user = locals.user;
    if (!user) {
      const errorResponse: ErrorResponseDto = {
        error: "Unauthorized",
        message: "Musisz być zalogowany",
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    // Parse and validate request body with Zod
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      const errorResponse: ErrorResponseDto = {
        error: "Validation error",
        message: "Invalid JSON in request body",
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let validatedBody;
    try {
      validatedBody = updateTripSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];

        // Special handling for map_url refine error (422 status)
        if (firstError.path.includes("map_url") && firstError.message.includes("mapy.com")) {
          const errorResponse: ErrorResponseDto = {
            error: "Validation error",
            message: firstError.message,
            field: firstError.path.join("."),
          };

          return new Response(JSON.stringify(errorResponse), {
            status: 422,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Other validation errors return 400
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

    // Convert validated input to UpdateTripCommand
    const command: UpdateTripCommand = validatedBody;

    // Call service to update trip (verifies ownership)
    const trip = await updateTrip(validatedParams.id, command, user.id, locals.supabase);

    // Handle not found case (or not owned by user)
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
      latitude: trip.latitude,
      longitude: trip.longitude,
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
    console.error("Error in PATCH /api/trips/[id]:", error);

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
 * DELETE /api/trips/{tripId}
 * Permanently deletes a trip (hard delete)
 *
 * Path parameters:
 * - id: string (required, must be a valid UUID)
 *
 * Responses:
 * - 204: Trip successfully deleted (no content)
 * - 400: Validation error (invalid UUID format)
 * - 404: Trip not found
 * - 500: Internal server error
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Check authentication
    const user = locals.user;
    if (!user) {
      const errorResponse: ErrorResponseDto = {
        error: "Unauthorized",
        message: "Musisz być zalogowany",
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate tripId parameter
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

    // Call service to delete trip (verifies ownership)
    const deleted = await deleteTrip(validatedParams.id, user.id, locals.supabase);

    // If trip doesn't exist or not owned by user, return 404
    if (!deleted) {
      const errorResponse: ErrorResponseDto = {
        error: "Not found",
        message: `Trip with ID '${validatedParams.id}' does not exist`,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return 204 No Content for successful deletion
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in DELETE /api/trips/[id]:", error);

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
