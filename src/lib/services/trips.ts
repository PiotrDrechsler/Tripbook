import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateTripDTO, TripDTO, UpdateTripDTO, ListTripsQueryParams, ListTripsResponseDTO } from "../../types";

/**
 * Creates a new trip for the specified user
 * @param supabase - Supabase client from context.locals
 * @param userId - ID of the authenticated user
 * @param data - Trip data to insert
 * @returns The newly created trip
 * @throws Error if database operation fails
 */
export async function createTrip(supabase: SupabaseClient, userId: string, data: CreateTripDTO): Promise<TripDTO> {
  const { data: trip, error } = await supabase
    .from("trips")
    .insert({ user_id: userId, ...data })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return trip;
}

/**
 * Retrieves a paginated list of trips for the authenticated user
 * @param supabase - Supabase client from context.locals
 * @param userId - ID of the authenticated user
 * @param params - Query parameters (page, limit, sort, order)
 * @returns Paginated list of trips with metadata
 * @throws Error if database operation fails
 */
export async function listTrips(
  supabase: SupabaseClient,
  userId: string,
  params: ListTripsQueryParams
): Promise<ListTripsResponseDTO> {
  const { page = 1, limit = 20, sort = "created_at", order = "desc" } = params;
  const offset = (page - 1) * limit;

  // Get total count for pagination
  const { count, error: countError } = await supabase
    .from("trips")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    throw countError;
  }

  // Get paginated data
  const { data: trips, error: dataError } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order(sort, { ascending: order === "asc" })
    .range(offset, offset + limit - 1);

  if (dataError) {
    throw dataError;
  }

  const total = count ?? 0;
  const pages = Math.ceil(total / limit);

  return {
    data: trips ?? [],
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  };
}

/**
 * Retrieves a single trip by ID for the authenticated user
 * @param supabase - Supabase client from context.locals
 * @param userId - ID of the authenticated user
 * @param tripId - ID of the trip to retrieve
 * @returns The trip if found and belongs to user, null otherwise
 * @throws Error if database operation fails
 */
export async function getTripById(supabase: SupabaseClient, userId: string, tripId: string): Promise<TripDTO | null> {
  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("user_id", userId)
    .single();

  if (error) {
    // Handle "not found" gracefully
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return trip;
}

/**
 * Updates an existing trip for the authenticated user
 * @param supabase - Supabase client from context.locals
 * @param userId - ID of the authenticated user
 * @param tripId - ID of the trip to update
 * @param data - Updated trip data
 * @returns The updated trip if found and belongs to user, null otherwise
 * @throws Error if database operation fails
 */
export async function updateTrip(
  supabase: SupabaseClient,
  userId: string,
  tripId: string,
  data: UpdateTripDTO
): Promise<TripDTO | null> {
  const { data: trip, error } = await supabase
    .from("trips")
    .update(data)
    .eq("id", tripId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    // Handle "not found" gracefully
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return trip;
}

/**
 * Deletes a trip for the authenticated user
 * @param supabase - Supabase client from context.locals
 * @param userId - ID of the authenticated user
 * @param tripId - ID of the trip to delete
 * @returns true if deleted, false if not found or unauthorized
 * @throws Error if database operation fails
 */
export async function deleteTrip(supabase: SupabaseClient, userId: string, tripId: string): Promise<boolean> {
  const { error } = await supabase.from("trips").delete().eq("id", tripId).eq("user_id", userId);

  if (error) {
    // Handle "not found" gracefully
    if (error.code === "PGRST116") {
      return false;
    }
    throw error;
  }

  return true;
}
