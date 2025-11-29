import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

/**
 * Command model for creating a Trip
 * Omits internal and auto-generated fields: id, user_id, created_at, updated_at
 */
export type CreateTripCommand = Omit<TablesInsert<"trips">, "id" | "user_id" | "created_at" | "updated_at">;

/**
 * Command model for updating a Trip
 * Only mutable fields are included
 */
export type UpdateTripCommand = Omit<TablesUpdate<"trips">, "id" | "user_id" | "updated_at">;

/**
 * Data Transfer Object representing a Trip
 * Excludes internal user_id field
 */
export type TripDto = Omit<Tables<"trips">, "user_id">;

/**
 * Pagination metadata returned by list endpoints
 */
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Response type for listing Trips
 */
export interface ListTripsResponseDto {
  data: TripDto[];
  pagination: PaginationDto;
}

/**
 * Standard Error Response DTO
 */
export interface ErrorResponseDto {
  error: string;
  message: string;
  field?: string;
}

/**
 * Parameters for listing trips
 */
export interface ListTripsParams {
  page: number;
  limit: number;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}

/**
 * Parameters for getting a single trip
 */
export interface GetTripParams {
  id: string;
}

/**
 * View model for Trip with formatted display data
 */
export interface TripViewModel extends TripDto {
  displayDate: string;
}

/**
 * User DTO - reprezentacja użytkownika zwracana przez API
 */
export interface UserDto {
  id: string;
  email: string;
}

/**
 * Auth Response DTO - odpowiedź po logowaniu/rejestracji
 */
export interface AuthResponseDto {
  message: string;
  user: UserDto;
}

/**
 * Logout Response DTO
 */
export interface LogoutResponseDto {
  message: string;
}

/**
 * Password Reset Response DTO
 */
export interface PasswordResetResponseDto {
  message: string;
}
