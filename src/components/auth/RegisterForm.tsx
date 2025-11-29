import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation
    if (!email || !password || !confirmPassword) {
      setError("Wszystkie pola są wymagane");
      return;
    }

    if (!validateEmail(email)) {
      setError("Nieprawidłowy format email");
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
      // Call register API endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        setError(data.message || "Wystąpił błąd podczas rejestracji");
        setIsSubmitting(false);
        return;
      }

      // Success - show success message
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = "/login?message=registration_success";
      }, 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Registration error:", err);
      setError("Wystąpił błąd połączenia. Spróbuj ponownie.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center space-y-4">
          <div className="text-green-600 text-5xl">✓</div>
          <h2 className="text-xl font-semibold text-green-800">Konto zostało utworzone!</h2>
          <div className="space-y-2">
            <p className="text-green-700">Na Twój adres email został wysłany link potwierdzający.</p>
            <p className="text-sm text-green-600">
              Sprawdź swoją skrzynkę pocztową (w tym folder SPAM) i kliknij w link, aby aktywować konto.
            </p>
          </div>
          <p className="text-sm text-green-600 mt-4">Przekierowywanie do logowania...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Rejestracja</h1>
        <p className="text-gray-600">Utwórz nowe konto</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="twoj@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
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
          {isSubmitting ? "Rejestracja..." : "Zarejestruj się"}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Masz już konto?{" "}
        <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
          Zaloguj się
        </a>
      </div>
    </div>
  );
}
