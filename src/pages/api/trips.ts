import type { APIRoute } from "astro";
import { CreateTripSchema, ListTripsQuerySchema } from "../../lib/validators/trips";
import { createTrip, listTrips } from "../../lib/services/trips";
import { authenticateRequest, jsonResponse, formatValidationErrors } from "../../lib/helpers/api";
import { ZodError } from "zod";

export const prerender = false;

/**
 * POST /api/trips
 * Creates a new trip for the authenticated user
 *
 * Authorization: Bearer token required
 * Request body: { name, description?, map_url, trip_date }
 * Success: 201 Created with trip object
 * Errors:
 *   - 400 Bad Request: validation errors
 *   - 401 Unauthorized: missing or invalid token
 *   - 500 Internal Server Error: database error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Authenticate user
  const authResult = await authenticateRequest(request, locals.supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  // Parse and validate request body
  let payload;
  try {
    const body = await request.json();
    payload = CreateTripSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonResponse(
        {
          error: "Validation failed",
          details: formatValidationErrors(err.errors),
        },
        400
      );
    }
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  // Create trip
  try {
    const trip = await createTrip(locals.supabase, authResult.userId, payload);
    return jsonResponse(trip, 201);
  } catch (err) {
    console.error("Error creating trip:", err);
    return jsonResponse({ error: "Failed to create trip" }, 500);
  }
};

/**
 * GET /api/trips
 * Retrieves paginated list of trips for the authenticated user
 *
 * Authorization: Bearer token required
 * Query params: page?, limit?, sort?, order?
 * Success: 200 OK with { data: [], pagination: {} }
 * Errors:
 *   - 400 Bad Request: invalid query parameters
 *   - 401 Unauthorized: missing or invalid token
 *   - 500 Internal Server Error: database error
 */
export const GET: APIRoute = async ({ request, locals }) => {
  // Authenticate user
  const authResult = await authenticateRequest(request, locals.supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  // Parse and validate query parameters
  let queryParams;
  try {
    const url = new URL(request.url);
    const rawParams = {
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
      sort: url.searchParams.get("sort"),
      order: url.searchParams.get("order"),
    };
    queryParams = ListTripsQuerySchema.parse(rawParams);
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonResponse(
        {
          error: "Invalid query parameters",
          details: formatValidationErrors(err.errors),
        },
        400
      );
    }
    return jsonResponse({ error: "Invalid query parameters" }, 400);
  }

  // Retrieve trips
  try {
    const result = await listTrips(locals.supabase, authResult.userId, queryParams);
    return jsonResponse(result, 200);
  } catch (err) {
    console.error("Error listing trips:", err);
    return jsonResponse({ error: "Failed to retrieve trips" }, 500);
  }
};
