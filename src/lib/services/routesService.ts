import type { SupabaseClient } from "../../db/supabase.client";

/**
 * Represents a geographic coordinate with latitude and longitude
 */
export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Request body structure for Google Routes API
 */
export interface RoutesRequestBody {
  origin: {
    location: {
      latLng: LatLng;
    };
  };
  destination: {
    location: {
      latLng: LatLng;
    };
  };
  intermediates?: {
    location: {
      latLng: LatLng;
    };
  }[];
  travelMode: "DRIVE" | "WALK" | "BICYCLE" | "TWO_WHEELER" | "TRANSIT";
  routingPreference?: "TRAFFIC_AWARE" | "TRAFFIC_AWARE_OPTIMAL";
  computeAlternativeRoutes?: boolean;
  routeModifiers?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
  };
  languageCode?: string;
  units?: "IMPERIAL" | "METRIC";
}

/**
 * Raw response structure from Google Routes API
 */
export interface RawRoutesResponse {
  routes?: {
    distanceMeters: number;
    duration: string; // ISO 8601 duration format (e.g., "1234s")
    polyline?: {
      encodedPolyline: string;
    };
    legs?: {
      distanceMeters: number;
      duration: string;
      startLocation: {
        latLng: LatLng;
      };
      endLocation: {
        latLng: LatLng;
      };
    }[];
  }[];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Parsed route result returned by the service
 */
export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline?: string;
}

/**
 * Custom error classes for different failure scenarios
 */
export class GeolocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeolocationError";
  }
}

export class DataFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataFetchError";
  }
}

export class MissingApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingApiKeyError";
  }
}

export class ApiError extends Error {
  statusCode: number;
  responseText: string;

  constructor(statusCode: number, responseText: string) {
    super(`API Error ${statusCode}: ${responseText}`);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.responseText = responseText;
  }
}

export class ResponseParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResponseParseError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Service for computing routes using Google Routes API
 * Handles fetching user location, trip coordinates, and calculating routes
 */
export class RoutesService {
  private supabase: SupabaseClient;
  private apiKey: string;
  private readonly API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

  constructor(supabaseClient: SupabaseClient, apiKey?: string) {
    // 1. Initialize Supabase
    this.supabase = supabaseClient;

    // 2. Get API key from parameter or ENV
    const key = apiKey || process.env.GOOGLE_ROUTES_API_KEY;
    if (!key) {
      throw new MissingApiKeyError("Missing GOOGLE_ROUTES_API_KEY");
    }
    this.apiKey = key;
  }

  /**
   * Main public method to get route information for a trip
   * @param tripId - The ID of the trip to calculate route for
   * @param userLocation - User's current location (required)
   * @returns Route result with distance and duration
   */
  async getRouteForTrip(tripId: string, userLocation: LatLng): Promise<RouteResult> {
    // 1. Validate user location
    if (!userLocation || typeof userLocation.latitude !== "number" || typeof userLocation.longitude !== "number") {
      throw new ValidationError("Invalid user location");
    }

    if (userLocation.latitude < -90 || userLocation.latitude > 90) {
      throw new ValidationError("Invalid user latitude");
    }

    if (userLocation.longitude < -180 || userLocation.longitude > 180) {
      throw new ValidationError("Invalid user longitude");
    }

    // 2. Get trip coordinates from database
    const tripCoordinates = await this.getTripCoordinates(tripId);

    // 3. Validate we have at least 1 point
    if (tripCoordinates.length < 1) {
      throw new ValidationError("Trip must have at least one coordinate");
    }

    // 4. Build request body
    const origin = userLocation;
    const destination = tripCoordinates[tripCoordinates.length - 1];
    const waypoints = tripCoordinates.slice(0, -1);

    const requestBody = this.buildRequestBody(origin, waypoints, destination);

    // 5. Call Google Routes API
    const rawResponse = await this.callRoutesApi(requestBody);

    // 6. Parse and return result
    return this.parseResponse(rawResponse);
  }

  /**
   * Fetches trip coordinates from Supabase
   * @private
   * @param tripId - The ID of the trip
   * @returns Array of coordinates for the trip
   */
  private async getTripCoordinates(tripId: string): Promise<LatLng[]> {
    if (!tripId || typeof tripId !== "string") {
      throw new ValidationError("Invalid trip ID");
    }

    const { data, error } = await this.supabase
      .from("trips")
      .select("latitude, longitude, locations")
      .eq("id", tripId)
      .single();

    if (error) {
      throw new DataFetchError(`Failed to fetch trip coordinates: ${error.message}`);
    }

    if (!data) {
      throw new DataFetchError("Trip not found");
    }

    // Priority 1: Use locations array if available and has at least 2 points
    if (data.locations && Array.isArray(data.locations) && data.locations.length >= 2) {
      const coordinates: LatLng[] = [];

      for (let i = 0; i < data.locations.length; i++) {
        const location = data.locations[i];

        // Validate each location has latitude and longitude
        if (
          typeof location !== "object" ||
          location === null ||
          Array.isArray(location) ||
          !("latitude" in location) ||
          !("longitude" in location) ||
          typeof location.latitude !== "number" ||
          typeof location.longitude !== "number"
        ) {
          throw new ValidationError(`Invalid location format at index ${i}`);
        }

        const lat = location.latitude as number;
        const lon = location.longitude as number;

        // Validate coordinate ranges
        if (lat < -90 || lat > 90) {
          throw new ValidationError(`Invalid latitude value at index ${i}: ${lat}`);
        }

        if (lon < -180 || lon > 180) {
          throw new ValidationError(`Invalid longitude value at index ${i}: ${lon}`);
        }

        coordinates.push({
          latitude: lat,
          longitude: lon,
        });
      }

      return coordinates;
    }

    // Priority 2: Fall back to single latitude/longitude if locations array is not available
    if (data.latitude !== null && data.longitude !== null) {
      // Validate coordinate ranges
      if (data.latitude < -90 || data.latitude > 90) {
        throw new ValidationError("Invalid latitude value");
      }

      if (data.longitude < -180 || data.longitude > 180) {
        throw new ValidationError("Invalid longitude value");
      }

      return [
        {
          latitude: data.latitude,
          longitude: data.longitude,
        },
      ];
    }

    // No coordinates available
    throw new ValidationError("Trip does not have coordinates set");
  }

  /**
   * Builds the request body for Google Routes API
   * @private
   * @param origin - Starting point coordinates
   * @param waypoints - Intermediate waypoints
   * @param destination - End point coordinates
   * @returns Formatted request body
   */
  private buildRequestBody(origin: LatLng, waypoints: LatLng[], destination: LatLng): RoutesRequestBody {
    const requestBody: RoutesRequestBody = {
      origin: {
        location: {
          latLng: origin,
        },
      },
      destination: {
        location: {
          latLng: destination,
        },
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE_OPTIMAL",
      computeAlternativeRoutes: false,
      languageCode: "pl-PL",
      units: "METRIC",
    };

    // Add waypoints if present
    if (waypoints.length > 0) {
      requestBody.intermediates = waypoints.map((point) => ({
        location: {
          latLng: point,
        },
      }));
    }

    return requestBody;
  }

  /**
   * Calls Google Routes API with the request body
   * @private
   * @param body - The request body
   * @returns Raw API response
   */
  private async callRoutesApi(body: RoutesRequestBody): Promise<RawRoutesResponse> {
    const url = `${this.API_URL}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
        },
        body: JSON.stringify(body),
      });

      // Handle rate limiting
      if (response.status === 429) {
        const responseText = await response.text();
        throw new RateLimitError(`Rate limit exceeded: ${responseText}`);
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const responseText = await response.text();
        throw new ApiError(response.status, responseText);
      }

      return await response.json();
    } catch (error) {
      // Re-throw our custom errors
      if (error instanceof ApiError || error instanceof RateLimitError || error instanceof NetworkError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError("Network request failed. Please check your connection.");
      }

      // Handle other errors
      throw new NetworkError(`Failed to call Routes API: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Parses the raw API response into a RouteResult
   * @private
   * @param raw - Raw API response
   * @returns Parsed route result
   */
  private parseResponse(raw: RawRoutesResponse): RouteResult {
    // Check for API error in response
    if (raw.error) {
      throw new ApiError(raw.error.code, `${raw.error.status}: ${raw.error.message}`);
    }

    // Check if routes exist
    if (!raw.routes || raw.routes.length === 0) {
      throw new ResponseParseError("No routes returned from API");
    }

    const route = raw.routes[0];

    // Validate required fields
    if (typeof route.distanceMeters !== "number") {
      throw new ResponseParseError("Invalid or missing distanceMeters in response");
    }

    if (!route.duration) {
      throw new ResponseParseError("Invalid or missing duration in response");
    }

    // Parse duration from ISO 8601 format (e.g., "1234s")
    const durationMatch = route.duration.match(/^(\d+)s$/);
    if (!durationMatch) {
      throw new ResponseParseError(`Invalid duration format: ${route.duration}`);
    }

    const durationSeconds = parseInt(durationMatch[1], 10);

    return {
      distanceMeters: route.distanceMeters,
      durationSeconds,
      encodedPolyline: route.polyline?.encodedPolyline,
    };
  }
}
