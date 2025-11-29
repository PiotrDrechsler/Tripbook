import type { APIRoute } from "astro";

import type { ErrorResponseDto, LogoutResponseDto } from "@/types";

export const prerender = false;

/**
 * POST /api/auth/logout
 * Logs out the current user and clears their session
 *
 * Responses:
 * - 200: Logout successful
 * - 500: Internal server error
 */
export const POST: APIRoute = async ({ locals }) => {
  try {
    // Sign out the user using Supabase Auth
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error during logout:", error);

      const errorResponse: ErrorResponseDto = {
        error: "Logout Error",
        message: "Wystąpił błąd podczas wylogowania",
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return success response
    const successResponse: LogoutResponseDto = {
      message: "Wylogowano pomyślnie",
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in POST /api/auth/logout:", error);

    const errorResponse: ErrorResponseDto = {
      error: "Internal Server Error",
      message: "Wystąpił błąd podczas wylogowania",
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
