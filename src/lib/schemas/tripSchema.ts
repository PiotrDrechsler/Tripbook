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
