import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  message?: string;
}

export default function LoginForm({ message }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email || !password) {
      setError("Wszystkie pola są wymagane");
      return;
    }

    if (!validateEmail(email)) {
      setError("Nieprawidłowy format email");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call login API endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        setError(data.message || "Wystąpił błąd podczas logowania");
        setIsSubmitting(false);
        return;
      }

      // Success - redirect to trips page
      window.location.href = "/trips";
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Login error:", err);
      setError("Wystąpił błąd połączenia. Spróbuj ponownie.");
      setIsSubmitting(false);
    }
  };

  // Display message from query params
  const getMessageText = (messageCode?: string): string | null => {
    if (!messageCode) return null;

    const messages: Record<string, string> = {
      session_expired: "Twoja sesja wygasła. Zaloguj się ponownie.",
      unauthorized: "Musisz się zalogować, aby uzyskać dostęp.",
      logout_success: "Wylogowano pomyślnie.",
      registration_success: "Konto zostało utworzone! Sprawdź email i potwierdź konto, aby się zalogować.",
      password_reset_success: "Hasło zostało zmienione! Możesz się teraz zalogować.",
    };

    return messages[messageCode] || null;
  };

  const displayMessage = getMessageText(message);

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Logowanie</h1>
        <p className="text-gray-600">Zaloguj się do swojego konta</p>
      </div>

      {displayMessage && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">{displayMessage}</div>
      )}

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
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </form>

      <div className="space-y-2 text-center text-sm">
        <a href="/forgot-password" className="text-blue-600 hover:text-blue-800 hover:underline block">
          Zapomniałeś hasła?
        </a>
        <div className="text-gray-600">
          Nie masz konta?{" "}
          <a href="/register" className="text-blue-600 hover:text-blue-800 hover:underline">
            Zarejestruj się
          </a>
        </div>
      </div>
    </div>
  );
}
