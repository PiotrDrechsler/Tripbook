import React, { useState } from "react";
import type { CreateTripCommand, ErrorResponseDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreateTripFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTripForm({ onClose, onSuccess }: CreateTripFormProps) {
  const [formData, setFormData] = useState<CreateTripCommand>({
    name: "",
    description: null,
    map_url: "",
    trip_date: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || null,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateMapUrl = (url: string): boolean => {
    return url.includes("mapy.com");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);

    // Client-side validation
    const validationErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      validationErrors.name = "Nazwa jest wymagana";
    }

    if (formData.name && formData.name.length > 100) {
      validationErrors.name = "Nazwa nie może przekraczać 100 znaków";
    }

    if (!formData.map_url || formData.map_url.trim().length === 0) {
      validationErrors.map_url = "Link do mapy jest wymagany";
    } else if (!validateMapUrl(formData.map_url)) {
      validationErrors.map_url = 'Link musi zawierać "mapy.com"';
    }

    if (formData.description && formData.description.length > 2000) {
      validationErrors.description = "Opis nie może przekraczać 2000 znaków";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData: ErrorResponseDto = await response.json();

        // If there's a field-specific error
        if (errorData.field) {
          setErrors({ [errorData.field]: errorData.message });
        } else {
          setGeneralError(errorData.message);
        }
        setIsSubmitting(false);
        return;
      }

      await response.json();

      // Success - show alert and close modal
      alert("Wycieczka została pomyślnie zapisana!");
      onSuccess();
      onClose();
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{generalError}</p>
        </div>
      )}

      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nazwa wycieczki <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={100}
          placeholder="np. Wycieczka do Tatr"
          aria-invalid={!!errors.name}
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Description field */}
      <div className="space-y-2">
        <Label htmlFor="description">Opis</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          maxLength={2000}
          rows={4}
          placeholder="Opisz swoją wycieczkę..."
          aria-invalid={!!errors.description}
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        <p className="text-xs text-muted-foreground">{(formData.description || "").length} / 2000 znaków</p>
      </div>

      {/* Map URL field */}
      <div className="space-y-2">
        <Label htmlFor="map_url">
          Link do mapy <span className="text-destructive">*</span>
        </Label>
        <Input
          id="map_url"
          name="map_url"
          type="url"
          value={formData.map_url}
          onChange={handleChange}
          required
          placeholder="https://mapy.com/..."
          aria-invalid={!!errors.map_url}
          disabled={isSubmitting}
        />
        {errors.map_url && <p className="text-sm text-destructive">{errors.map_url}</p>}
        <p className="text-xs text-muted-foreground">Link musi zawierać &quot;mapy.com&quot;</p>
      </div>

      {/* Trip date field */}
      <div className="space-y-2">
        <Label htmlFor="trip_date">Data wycieczki</Label>
        <Input
          id="trip_date"
          name="trip_date"
          type="date"
          value={formData.trip_date || ""}
          onChange={handleChange}
          aria-invalid={!!errors.trip_date}
          disabled={isSubmitting}
        />
        {errors.trip_date && <p className="text-sm text-destructive">{errors.trip_date}</p>}
      </div>

      {/* Form actions */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Zapisywanie..." : "Zapisz"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
          Anuluj
        </Button>
      </div>
    </form>
  );
}
