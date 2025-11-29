import { z } from "zod";

/**
 * Schema for user registration
 * Validates email, password, and password confirmation
 */
export const registerSchema = z
  .object({
    email: z.string().email("Nieprawidłowy format email"),
    password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

/**
 * Schema for user login
 * Validates email and password
 */
export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

/**
 * Schema for forgot password request
 * Validates email only
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
});

/**
 * Schema for password reset
 * Validates token, new password, and password confirmation
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token jest wymagany"),
    password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

// Export TypeScript types inferred from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
