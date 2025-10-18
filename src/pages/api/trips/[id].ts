import type { APIRoute } from "astro";
import { UpdateTripSchema } from "../../../lib/validators/trips";
import { getTripById, updateTrip, deleteTrip } from "../../../lib/services/trips";
import { authenticateRequest, jsonResponse, formatValidationErrors } from "../../../lib/helpers/api";
import { ZodError } from "zod";

export const prerender = false;

/**
 * GET /api/trips/[id]
 * Retrieves details of a single trip for the authenticated user
 *
 * Authorization: Bearer token required
 * Path param: id (UUID)
 * Success: 200 OK with trip object
 * Errors:
 *   - 401 Unauthorized: missing or invalid token
 *   - 404 Not Found: trip not found or doesn't belong to user
 *   - 500 Internal Server Error: database error
 */
export const GET: APIRoute = async ({ params, request, locals }) => {
  // Extract trip ID from path params
  const tripId = params.id;
  if (!tripId) {
    return jsonResponse({ error: "Trip ID is required" }, 400);
  }

  // Authenticate user
  const authResult = await authenticateRequest(request, locals.supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  // Retrieve trip
  try {
    const trip = await getTripById(locals.supabase, authResult.userId, tripId);

    if (!trip) {
      return jsonResponse({ error: "Trip not found" }, 404);
    }

    return jsonResponse(trip, 200);
  } catch (err) {
    console.error("Error retrieving trip:", err);
    return jsonResponse({ error: "Failed to retrieve trip" }, 500);
  }
};

/**
 * PUT /api/trips/[id]
 * Updates an existing trip for the authenticated user
 *
 * Authorization: Bearer token required
 * Path param: id (UUID)
 * Request body: { name, description?, map_url, trip_date }
 * Success: 200 OK with updated trip object
 * Errors:
 *   - 400 Bad Request: validation errors
 *   - 401 Unauthorized: missing or invalid token
 *   - 404 Not Found: trip not found or doesn't belong to user
 *   - 500 Internal Server Error: database error
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  // Extract trip ID from path params
  const tripId = params.id;
  if (!tripId) {
    return jsonResponse({ error: "Trip ID is required" }, 400);
  }

  // Authenticate user
  const authResult = await authenticateRequest(request, locals.supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  // Parse and validate request body
  let payload;
  try {
    const body = await request.json();
    payload = UpdateTripSchema.parse(body);
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

  // Update trip
  try {
    const trip = await updateTrip(locals.supabase, authResult.userId, tripId, payload);

    if (!trip) {
      return jsonResponse({ error: "Trip not found" }, 404);
    }

    return jsonResponse(trip, 200);
  } catch (err) {
    console.error("Error updating trip:", err);
    return jsonResponse({ error: "Failed to update trip" }, 500);
  }
};

/**
 * DELETE /api/trips/[id]
 * Permanently deletes a trip for the authenticated user
 *
 * Authorization: Bearer token required
 * Path param: id (UUID)
 * Success: 204 No Content
 * Errors:
 *   - 401 Unauthorized: missing or invalid token
 *   - 404 Not Found: trip not found or doesn't belong to user
 *   - 500 Internal Server Error: database error
 */
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  // Extract trip ID from path params
  const tripId = params.id;
  if (!tripId) {
    return jsonResponse({ error: "Trip ID is required" }, 400);
  }

  // Authenticate user
  const authResult = await authenticateRequest(request, locals.supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delete trip
  try {
    const deleted = await deleteTrip(locals.supabase, authResult.userId, tripId);

    if (!deleted) {
      return jsonResponse({ error: "Trip not found" }, 404);
    }

    return jsonResponse(null, 204);
  } catch (err) {
    console.error("Error deleting trip:", err);
    return jsonResponse({ error: "Failed to delete trip" }, 500);
  }
};
