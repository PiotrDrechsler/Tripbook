import type { SupabaseClient } from "../../db/supabase.client";
import type { Tables } from "../../db/database.types";
import type { CreateTripCommand, ListTripsParams, ListTripsResponseDto, TripDto } from "../../types";

/**
 * Service for managing Trip entities
 */

/**
 * Creates a new trip in the database
 *
 * @param command - The trip data to insert (without user_id, id, timestamps)
 * @param supabase - Supabase client instance
 * @returns The created trip record
 * @throws Error if the database operation fails
 */
export async function createTrip(command: CreateTripCommand, supabase: SupabaseClient): Promise<Tables<"trips">> {
  // For now, we use a placeholder user_id since authentication is not yet implemented
  // TODO: Replace with actual user_id from authenticated session
  const PLACEHOLDER_USER_ID = "00000000-0000-0000-0000-000000000000";

  const { data, error } = await supabase
    .from("trips")
    .insert({
      ...command,
      user_id: PLACEHOLDER_USER_ID,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating trip:", error);
    throw new Error(`Failed to create trip: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to create trip: No data returned");
  }

  return data;
}

/**
 * Retrieves a paginated and sorted list of trips
 *
 * @param params - Pagination and sorting parameters
 * @param supabase - Supabase client instance
 * @returns Object containing trips array and pagination metadata
 * @throws Error if the database operation fails
 */
export async function listTrips(params: ListTripsParams, supabase: SupabaseClient): Promise<ListTripsResponseDto> {
  const { page, limit, sortColumn, sortDirection } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Query database with pagination, sorting, and counting
  const query = supabase
    .from("trips")
    .select("*", { count: "exact" })
    .order(sortColumn, { ascending: sortDirection === "asc" })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error listing trips:", error);
    throw new Error(`Failed to list trips: ${error.message}`);
  }

  // Map database records to TripDto (exclude user_id)
  const trips: TripDto[] = (data || []).map((trip) => ({
    id: trip.id,
    name: trip.name,
    description: trip.description,
    map_url: trip.map_url,
    trip_date: trip.trip_date,
    created_at: trip.created_at,
    updated_at: trip.updated_at,
  }));

  // Calculate pagination metadata
  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const response: ListTripsResponseDto = {
    data: trips,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
    },
  };

  return response;
}
