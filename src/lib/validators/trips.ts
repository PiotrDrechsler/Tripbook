import { z } from "zod";

/**
 * Validation schema for creating a new trip
 * Enforces:
 * - name: required, 1-100 characters
 * - description: optional, max 2000 characters
 * - map_url: required, valid URL containing "mapy.com"
 * - trip_date: required, ISO date format YYYY-MM-DD
 */
export const CreateTripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(100, "Trip name must not exceed 100 characters"),
  description: z.string().max(2000, "Description must not exceed 2000 characters").optional(),
  map_url: z
    .string()
    .url("Invalid URL format")
    .refine((url) => url.includes("mapy.com"), {
      message: "Map URL must be from mapy.com",
    }),
  trip_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Trip date must be in YYYY-MM-DD format"),
});

/**
 * Validation schema for updating an existing trip
 * Same requirements as CreateTripSchema
 */
export const UpdateTripSchema = CreateTripSchema;

/**
 * Validation schema for listing trips query parameters
 */
export const ListTripsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["created_at", "trip_date"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});
