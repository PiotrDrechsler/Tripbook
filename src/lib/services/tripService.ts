import type { SupabaseClient } from "../../db/supabase.client";
import type { Tables } from "../../db/database.types";
import type { CreateTripCommand } from "../../types";

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
