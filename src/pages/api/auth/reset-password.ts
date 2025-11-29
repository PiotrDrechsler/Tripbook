import type { APIRoute } from "astro";
import { z } from "zod";

import { resetPasswordSchema } from "@/lib/schemas/authSchema";
import type { ErrorResponseDto, PasswordResetResponseDto } from "@/types";

export const prerender = false;

/**
 * POST /api/auth/reset-password
 * Resets user password using a valid reset token
 *
 * Request body:
 * - password: string (required, minimum 6 characters)
 * - confirmPassword: string (required, must match password)
 *
 * Responses:
 * - 200: Password reset successfully
 * - 400: Validation error (passwords don't match, too short, etc.)
 * - 401: Invalid or expired token
 * - 500: Internal server error
 *
 * Note: The token is provided via the access_token from the password reset email link
 * Supabase automatically validates the token through the session
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const errorResponse: ErrorResponseDto = {
        error: "Bad Request",
        message: "Nieprawidłowy format danych",
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = resetPasswordSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];

        const errorResponse: ErrorResponseDto = {
          error: "Validation error",
          message: firstError.message,
          field: firstError.path.join("."),
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw error;
    }

    // Check if user has a valid session (from password reset link)
    const {
      data: { session },
    } = await locals.supabase.auth.getSession();

    if (!session) {
      const errorResponse: ErrorResponseDto = {
        error: "Unauthorized",
        message: "Link resetujący jest nieprawidłowy lub wygasł. Wyślij nowy link.",
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update password
    const { error } = await locals.supabase.auth.updateUser({
      password: validatedData.password,
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Password update error:", error);

      let message = "Wystąpił błąd podczas zmiany hasła";
      let statusCode = 500;

      // Handle specific error cases
      if (error.message.includes("Password")) {
        message = "Hasło nie spełnia wymagań bezpieczeństwa";
        statusCode = 400;
      } else if (error.message.includes("token") || error.message.includes("session")) {
        message = "Link resetujący wygasł. Wyślij nowy link.";
        statusCode = 401;
      }

      const errorResponse: ErrorResponseDto = {
        error: statusCode === 401 ? "Unauthorized" : "Bad Request",
        message,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return success response
    const successResponse: PasswordResetResponseDto = {
      message: "Hasło zostało zmienione pomyślnie",
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in POST /api/auth/reset-password:", error);

    const errorResponse: ErrorResponseDto = {
      error: "Internal Server Error",
      message: "Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie.",
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
