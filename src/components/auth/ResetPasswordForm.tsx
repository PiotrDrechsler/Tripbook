import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Extract token from URL hash (Supabase sends it as #access_token=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      setHasToken(!!accessToken);
    }
  }, []);

  // Check if token is valid
  if (!hasToken) {
    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg space-y-4">
          <div className="text-red-600 text-5xl text-center">⚠️</div>
          <h2 className="text-xl font-semibold text-red-800 text-center">Link nieprawidłowy</h2>
          <p className="text-red-700 text-center">Link resetujący jest nieprawidłowy lub wygasł.</p>
          <div className="pt-4 space-y-2">
            <a href="/forgot-password" className="block text-center text-blue-600 hover:text-blue-800 hover:underline">
              Wyślij nowy link
            </a>
            <a href="/login" className="block text-center text-gray-600 hover:text-gray-800 hover:underline">
              Wróć do logowania
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation
    if (!password || !confirmPassword) {
      setError("Wszystkie pola są wymagane");
      return;
    }

    if (password.length < 6) {
      setError("Hasło musi mieć minimum 6 znaków");
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call reset password API endpoint
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        setError(data.message || "Wystąpił błąd podczas zmiany hasła");
        setIsSubmitting(false);
        return;
      }

      // Success - show success message and redirect
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login?message=password_reset_success";
      }, 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Reset password error:", err);
      setError("Wystąpił błąd połączenia. Spróbuj ponownie.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg space-y-4">
          <div className="text-green-600 text-5xl text-center">✓</div>
          <h2 className="text-xl font-semibold text-green-800 text-center">Hasło zostało zmienione!</h2>
          <p className="text-green-700 text-center">Przekierowywanie do logowania...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Nowe hasło</h1>
        <p className="text-gray-600">Ustaw nowe hasło do swojego konta</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nowe hasło</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
          <p className="text-xs text-gray-500">Minimum 6 znaków</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Potwierdzenie hasła</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Zapisywanie..." : "Zmień hasło"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
          Wróć do logowania
        </a>
      </div>
    </div>
  );
}
