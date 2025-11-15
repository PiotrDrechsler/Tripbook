import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
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
    if (!email) {
      setError("Email jest wymagany");
      return;
    }

    if (!validateEmail(email)) {
      setError("Nieprawidłowy format email");
      return;
    }

    setIsSubmitting(true);

    // TODO: API call will be implemented later
    // For now, just simulate the submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      console.log("Password reset request for:", email);
    }, 1000);
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
          <div className="text-blue-600 text-5xl text-center">📧</div>
          <h2 className="text-xl font-semibold text-blue-800 text-center">Link został wysłany!</h2>
          <p className="text-blue-700 text-center">
            Link do resetowania hasła został wysłany na podany adres email. Sprawdź swoją skrzynkę pocztową.
          </p>
          <div className="pt-4">
            <a href="/login" className="block text-center text-blue-600 hover:text-blue-800 hover:underline">
              Wróć do logowania
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Odzyskiwanie hasła</h1>
        <p className="text-gray-600">Podaj swój adres email, a wyślemy Ci link do resetowania hasła</p>
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Wysyłanie..." : "Wyślij link resetujący"}
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
