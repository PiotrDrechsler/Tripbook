import type { APIRoute } from "astro";
import { z } from "zod";

import { registerSchema } from "@/lib/schemas/authSchema";
import type { AuthResponseDto, ErrorResponseDto } from "@/types";

export const prerender = false;

/**
 * POST /api/auth/register
 * Registers a new user with email and password
 *
 * Request body:
 * - email: string (required, valid email format)
 * - password: string (required, minimum 6 characters)
 * - confirmPassword: string (required, must match password)
 *
 * Responses:
 * - 201: Registration successful, returns user data
 * - 400: Validation error (invalid email format, passwords don't match, etc.)
 * - 409: Conflict (user with this email already exists)
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
      validatedData = registerSchema.parse(body);
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

    // Attempt to sign up with Supabase Auth
    const { data, error } = await locals.supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    // Handle authentication errors
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Registration error:", error);

      // Map Supabase errors to user-friendly Polish messages
      let message = "Wystąpił błąd podczas rejestracji";
      let statusCode = 500;

      // Check for specific error types
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        message = "Użytkownik z tym adresem email już istnieje";
        statusCode = 409; // Conflict
      } else if (error.message.includes("Password")) {
        message = "Hasło nie spełnia wymagań bezpieczeństwa";
        statusCode = 400;
      } else if (error.message.includes("Email")) {
        message = "Nieprawidłowy format adresu email";
        statusCode = 400;
      }

      const errorResponse: ErrorResponseDto = {
        error: statusCode === 409 ? "Conflict" : "Registration Error",
        message,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify we have user data
    if (!data.user) {
      const errorResponse: ErrorResponseDto = {
        error: "Registration Error",
        message: "Nie udało się utworzyć konta",
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return success response with user data
    const successResponse: AuthResponseDto = {
      message: "Konto zostało utworzone pomyślnie",
      user: {
        id: data.user.id,
        email: data.user.email ?? "",
      },
    };

    return new Response(JSON.stringify(successResponse), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in POST /api/auth/register:", error);

    const errorResponse: ErrorResponseDto = {
      error: "Internal Server Error",
      message: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.",
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
