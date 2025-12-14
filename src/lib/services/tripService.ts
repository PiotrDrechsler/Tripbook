import type { SupabaseClient } from "../../db/supabase.client";
import type { Tables } from "../../db/database.types";
import type { CreateTripCommand, UpdateTripCommand, ListTripsParams, ListTripsResponseDto, TripDto } from "../../types";

/**
 * Service for managing Trip entities
 */

/**
 * Creates a new trip in the database
 *
 * @param command - The trip data to insert (without user_id, id, timestamps)
 * @param userId - The authenticated user's ID
 * @param supabase - Supabase client instance
 * @returns The created trip record
 * @throws Error if the database operation fails
 */
export async function createTrip(
  command: CreateTripCommand,
  userId: string,
  supabase: SupabaseClient
): Promise<Tables<"trips">> {
  const { data, error } = await supabase
    .from("trips")
    .insert({
      ...command,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating trip:", error);
    throw new Error(`Failed to create trip: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to create trip: No data returned");
  }

  return data;
}

/**
 * Retrieves a single trip by its ID and user
 *
 * @param id - The UUID of the trip to retrieve
 * @param userId - The authenticated user's ID (to verify ownership)
 * @param supabase - Supabase client instance
 * @returns The trip record if found and owned by user, null otherwise
 * @throws Error if the database operation fails (excluding not found)
 */
export async function getTripById(
  id: string,
  userId: string,
  supabase: SupabaseClient
): Promise<Tables<"trips"> | null> {
  const { data, error } = await supabase.from("trips").select("*").eq("id", id).eq("user_id", userId).single();

  // PGRST116 is the Supabase error code for "not found"
  // We treat this as a valid case (return null) rather than an error
  if (error && error.code !== "PGRST116") {
    // eslint-disable-next-line no-console
    console.error("Error fetching trip:", error);
    throw new Error(`Failed to fetch trip: ${error.message}`);
  }

  return data || null;
}

/**
 * Retrieves a paginated and sorted list of trips for a specific user
 *
 * @param params - Pagination and sorting parameters
 * @param userId - The authenticated user's ID
 * @param supabase - Supabase client instance
 * @returns Object containing trips array and pagination metadata
 * @throws Error if the database operation fails
 */
export async function listTrips(
  params: ListTripsParams,
  userId: string,
  supabase: SupabaseClient
): Promise<ListTripsResponseDto> {
  const { page, limit, sortColumn, sortDirection } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Query database with pagination, sorting, and counting (filtered by user_id)
  const query = supabase
    .from("trips")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order(sortColumn, { ascending: sortDirection === "asc" })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    // eslint-disable-next-line no-console
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
    latitude: trip.latitude,
    longitude: trip.longitude,
    locations: trip.locations,
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

/**
 * Updates an existing trip by its ID (only if owned by user)
 *
 * @param id - The UUID of the trip to update
 * @param command - The trip data to update (partial update)
 * @param userId - The authenticated user's ID (to verify ownership)
 * @param supabase - Supabase client instance
 * @returns The updated trip record if found and owned by user, null if not found or not owned
 * @throws Error if the database operation fails (excluding not found)
 */
export async function updateTrip(
  id: string,
  command: UpdateTripCommand,
  userId: string,
  supabase: SupabaseClient
): Promise<Tables<"trips"> | null> {
  const { data, error } = await supabase
    .from("trips")
    .update(command)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  // PGRST116 is the Supabase error code for "not found"
  // We treat this as a valid case (return null) rather than an error
  if (error && error.code !== "PGRST116") {
    // eslint-disable-next-line no-console
    console.error("Error updating trip:", error);
    throw new Error(`Failed to update trip: ${error.message}`);
  }

  return data || null;
}

/**
 * Deletes a trip by ID (hard delete, only if owned by user)
 *
 * @param id - UUID of the trip to delete
 * @param userId - The authenticated user's ID (to verify ownership)
 * @param supabase - Supabase client instance
 * @returns true if trip was deleted, false if trip doesn't exist or not owned by user
 * @throws Error if the database operation fails
 */
export async function deleteTrip(id: string, userId: string, supabase: SupabaseClient): Promise<boolean> {
  // First check if trip exists and is owned by user
  const { data: existingTrip, error: checkError } = await supabase
    .from("trips")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  // PGRST116 is the Supabase error code for "not found"
  // Handle error (other than not found)
  if (checkError && checkError.code !== "PGRST116") {
    // eslint-disable-next-line no-console
    console.error("Error checking trip existence:", checkError);
    throw new Error(`Failed to check trip: ${checkError.message}`);
  }

  // If trip doesn't exist or not owned by user, return false
  if (!existingTrip) {
    return false;
  }

  // Delete the trip
  const { error: deleteError } = await supabase.from("trips").delete().eq("id", id).eq("user_id", userId);

  if (deleteError) {
    // eslint-disable-next-line no-console
    console.error("Error deleting trip:", deleteError);
    throw new Error(`Failed to delete trip: ${deleteError.message}`);
  }

  return true;
}
