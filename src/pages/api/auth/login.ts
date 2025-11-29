import type { APIRoute } from "astro";
import { z } from "zod";

import { loginSchema } from "@/lib/schemas/authSchema";
import type { AuthResponseDto, ErrorResponseDto } from "@/types";

export const prerender = false;

/**
 * POST /api/auth/login
 * Authenticates a user with email and password
 *
 * Request body:
 * - email: string (required, valid email format)
 * - password: string (required, minimum 1 character)
 *
 * Responses:
 * - 200: Login successful, returns user data
 * - 400: Validation error (invalid email format, missing fields)
 * - 401: Unauthorized (invalid credentials)
 * - 500: Internal server error
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
      validatedData = loginSchema.parse(body);
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

    // Attempt to sign in with Supabase Auth
    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    // Handle authentication errors
    if (error) {
      // Map Supabase errors to user-friendly Polish messages
      let message = "Nieprawidłowy email lub hasło";

      // Specific error handling based on error code
      switch (error.message) {
        case "Invalid login credentials":
          message = "Nieprawidłowy email lub hasło";
          break;
        case "Email not confirmed":
          message = "Email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową.";
          break;
        case "User not found":
          message = "Użytkownik o podanym adresie email nie istnieje";
          break;
        default:
          // For security, don't expose specific error details
          message = "Nieprawidłowy email lub hasło";
      }

      const errorResponse: ErrorResponseDto = {
        error: "Unauthorized",
        message,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify we have user data
    if (!data.user) {
      const errorResponse: ErrorResponseDto = {
        error: "Unauthorized",
        message: "Nieprawidłowy email lub hasło",
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return success response with user data
    const successResponse: AuthResponseDto = {
      message: "Zalogowano pomyślnie",
      user: {
        id: data.user.id,
        email: data.user.email ?? "",
      },
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in POST /api/auth/login:", error);

    const errorResponse: ErrorResponseDto = {
      error: "Internal Server Error",
      message: "Wystąpił błąd podczas logowania. Spróbuj ponownie.",
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
