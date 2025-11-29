import type { APIRoute } from "astro";
import { z } from "zod";

import { forgotPasswordSchema } from "@/lib/schemas/authSchema";
import type { ErrorResponseDto, PasswordResetResponseDto } from "@/types";

export const prerender = false;

/**
 * POST /api/auth/forgot-password
 * Sends a password reset email to the user
 *
 * Request body:
 * - email: string (required, valid email format)
 *
 * Responses:
 * - 200: Email sent successfully
 * - 400: Validation error (invalid email format)
 * - 500: Internal server error
 *
 * Note: For security, we always return 200 even if the email doesn't exist
 * This prevents email enumeration attacks
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
      validatedData = forgotPasswordSchema.parse(body);
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

    // Send password reset email via Supabase
    const { error } = await locals.supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
    });

    // For security: Always return success, even if email doesn't exist
    // This prevents email enumeration attacks
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Password reset error:", error);

      // Still return success to prevent email enumeration
      // In production, you might want to log this for monitoring
    }

    // Return success response (always, for security)
    const successResponse: PasswordResetResponseDto = {
      message: "Jeśli konto z tym adresem email istnieje, został wysłany link do resetowania hasła.",
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in POST /api/auth/forgot-password:", error);

    const errorResponse: ErrorResponseDto = {
      error: "Internal Server Error",
      message: "Wystąpił błąd podczas wysyłania linku. Spróbuj ponownie.",
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
