import { z } from "zod";

/**
 * Validation schema for creating a new trip
 *
 * Validates:
 * - name: required, non-empty string, max 100 characters
 * - description: optional string, max 2000 characters
 * - map_url: required string containing "mapy.com"
 * - trip_date: optional ISO 8601 date string (YYYY-MM-DD)
 */
export const createTripSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(1, "Name cannot be empty")
    .max(100, "Name must not exceed 100 characters")
    .trim(),

  description: z.string().max(2000, "Description must not exceed 2000 characters").trim().nullable().optional(),

  map_url: z
    .string({
      required_error: "Map URL is required",
      invalid_type_error: "Map URL must be a string",
    })
    .min(1, "Map URL cannot be empty")
    .refine((url) => url.includes("mapy.com"), "Map URL must contain 'mapy.com'"),

  trip_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Trip date must be in ISO 8601 format (YYYY-MM-DD)")
    .refine((date) => !isNaN(Date.parse(date)), "Trip date must be a valid date")
    .nullable()
    .optional(),
});

/**
 * Type inferred from the createTripSchema
 */
export type CreateTripInput = z.infer<typeof createTripSchema>;

/**
 * Validation schema for listing trips query parameters
 *
 * Validates:
 * - page: optional positive integer, default: 1
 * - limit: optional integer between 1 and 100, default: 20
 * - sort: optional string matching allowed sort patterns, default: "-created_at"
 */
export const listTripsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val > 0, "Page must be a positive number"),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, "Limit must be between 1 and 100"),

  sort: z
    .string()
    .optional()
    .default("-created_at")
    .refine(
      (val) => ["name", "-name", "trip_date", "-trip_date", "created_at", "-created_at"].includes(val),
      "Invalid sort parameter. Allowed values: name, -name, trip_date, -trip_date, created_at, -created_at"
    ),
});

/**
 * Type inferred from the listTripsQuerySchema
 */
export type ListTripsQueryInput = z.infer<typeof listTripsQuerySchema>;

/**
 * Validation schema for getting a single trip by ID
 *
 * Validates:
 * - id: required UUID string
 */
export const getTripParamsSchema = z.object({
  id: z.string().uuid("Invalid tripId format"),
});

/**
 * Type inferred from the getTripParamsSchema
 */
export type GetTripParams = z.infer<typeof getTripParamsSchema>;
