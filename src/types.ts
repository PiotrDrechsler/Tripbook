import type { Tables, TablesInsert } from "./db/database.types";

// Full Trip record from the database
export type TripDTO = Tables<"trips">;

// Payload for creating a trip (POST /api/trips)
export type CreateTripDTO = Pick<TablesInsert<"trips">, "name" | "description" | "map_url" | "trip_date">;

// Payload for updating a trip (PUT /api/trips/{id})
// Same shape as CreateTripDTO per API spec
export type UpdateTripDTO = CreateTripDTO;

// Query parameters for listing trips (GET /api/trips)
export interface ListTripsQueryParams {
  page?: number; // default: 1
  limit?: number; // default: 20
  sort?: "created_at" | "trip_date"; // default: 'created_at'
  order?: "asc" | "desc"; // default: 'desc'
}

// Pagination metadata returned in list responses
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Response payload for listing trips (GET /api/trips)
export interface ListTripsResponseDTO {
  data: TripDTO[];
  pagination: PaginationMeta;
}

// Path parameter for endpoints that operate on a single trip
export interface TripParams {
  id: string;
}

// Command model for creating a trip
export interface CreateTripCommand {
  payload: CreateTripDTO;
}

// Command model for updating a trip
export interface UpdateTripCommand extends TripParams {
  payload: UpdateTripDTO;
}

// Command model for deleting a trip
export type DeleteTripCommand = TripParams;
