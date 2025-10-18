import type { SupabaseClient } from "../../db/supabase.client";

/**
 * Result of authentication - either success with user or error response
 */
export type AuthResult = { success: true; userId: string } | { success: false; response: Response };

/**
 * Authenticates the request using Bearer token
 * @param request - Astro API request
 * @param supabase - Supabase client from context.locals
 * @returns AuthResult with userId or error Response
 */
export async function authenticateRequest(request: Request, supabase: SupabaseClient): Promise<AuthResult> {
  // Extract and verify Bearer token
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      success: false,
      response: jsonResponse({ error: "Missing or invalid Authorization header" }, 401),
    };
  }

  const token = authHeader.split(" ")[1];

  // Verify user authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return {
      success: false,
      response: jsonResponse({ error: "Invalid or expired token" }, 401),
    };
  }

  return {
    success: true,
    userId: user.id,
  };
}

/**
 * Creates a JSON response with appropriate headers
 * @param data - Data to serialize (or null for empty body)
 * @param status - HTTP status code
 * @returns Response object
 */
export function jsonResponse(data: unknown, status: number): Response {
  if (data === null) {
    return new Response(null, { status });
  }

  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Formats Zod validation errors into user-friendly format
 * @param errors - Array of Zod errors
 * @returns Formatted error details
 */
export function formatValidationErrors(errors: { path: (string | number)[]; message: string }[]) {
  return errors.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
}
