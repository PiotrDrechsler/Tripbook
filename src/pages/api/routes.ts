import type { APIRoute } from "astro";
import { z } from "zod";

import { RoutesService } from "../../lib/services/routesService";
import type { ErrorResponseDto } from "../../types";

export const prerender = false;

/**
 * Schema for validating route request query parameters
 */
const routeRequestSchema = z.object({
  tripId: z.string().uuid("Trip ID must be a valid UUID"),
  userLocation: z.object({
    latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
  }),
});

/**
 * POST /api/routes
 * Computes a route from user's current location to a trip destination
 *
 * Request body:
 * - tripId: string (required, must be a valid UUID)
 * - userLocation: object (required)
 *   - latitude: number (required, -90 to 90)
 *   - longitude: number (required, -180 to 180)
 *
 * Responses:
 * - 200: Route computed successfully, returns RouteResult
 * - 400: Validation error (missing/invalid tripId or userLocation)
 * - 404: Trip not found
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
      validatedData = routeRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];

        const errorResponse: ErrorResponseDto = {
          error: "Validation Error",
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

    // Get API key from environment (Cloudflare runtime first, then fallback)
    const env = locals.runtime?.env as { GOOGLE_ROUTES_API_KEY?: string } | undefined;
    const apiKey = env?.GOOGLE_ROUTES_API_KEY || import.meta.env.GOOGLE_ROUTES_API_KEY;

    if (!apiKey) {
      // eslint-disable-next-line no-console
      console.error("GOOGLE_ROUTES_API_KEY is not configured");

      const errorResponse: ErrorResponseDto = {
        error: "Configuration Error",
        message: "Routes service is not properly configured. Please add GOOGLE_ROUTES_API_KEY to .env file.",
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize RoutesService
    const routesService = new RoutesService(locals.supabase, apiKey);

    // Compute route with user location from request
    const routeResult = await routesService.getRouteForTrip(validatedData.tripId, validatedData.userLocation);

    // Return success response
    return new Response(JSON.stringify(routeResult), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in POST /api/routes:", error);

    // Handle specific error types
    let statusCode = 500;
    let errorMessage = "An unexpected error occurred";
    let errorType = "Internal Server Error";

    if (error instanceof Error) {
      errorMessage = error.message;

      // Map custom errors to appropriate HTTP status codes
      switch (error.name) {
        case "ValidationError":
          statusCode = 400;
          errorType = "Validation Error";
          break;
        case "DataFetchError":
          // Check if it's a "not found" error
          if (errorMessage.includes("not found")) {
            statusCode = 404;
            errorType = "Not Found";
          } else {
            statusCode = 500;
            errorType = "Data Fetch Error";
          }
          break;
        case "GeolocationError":
          statusCode = 400;
          errorType = "Geolocation Error";
          break;
        case "MissingApiKeyError":
          statusCode = 500;
          errorType = "Configuration Error";
          break;
        case "ApiError":
          statusCode = 502;
          errorType = "External API Error";
          break;
        case "RateLimitError":
          statusCode = 429;
          errorType = "Rate Limit Exceeded";
          break;
        case "NetworkError":
          statusCode = 503;
          errorType = "Network Error";
          break;
        case "ResponseParseError":
          statusCode = 502;
          errorType = "Response Parse Error";
          break;
      }
    }

    // Return error response
    const errorResponse: ErrorResponseDto = {
      error: errorType,
      message: errorMessage,
    };

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
};
