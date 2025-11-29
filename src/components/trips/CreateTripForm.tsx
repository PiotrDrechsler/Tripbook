import React, { useState } from "react";
import type { CreateTripCommand, ErrorResponseDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMapyLink } from "@/lib/hooks/useMapyLink";
import { Spinner } from "./Spinner";
import { formatCoordinatesDMS } from "@/lib/utils/coordinates";

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

  // Use the mapy.com link expansion hook
  const {
    latitude,
    longitude,
    loading: mapyLoading,
    error: mapyError,
    success: mapySuccess,
  } = useMapyLink(formData.map_url);

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
    } else if (latitude === null || longitude === null) {
      validationErrors.map_url = "Najpierw wyciągnij współrzędne z linku mapy.com";
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
      // Include coordinates in the request
      const tripData = {
        ...formData,
        latitude,
        longitude,
      };

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripData),
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
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="create-trip-form">
      {generalError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4" data-testid="form-error">
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
          data-testid="trip-name-input"
        />
        {errors.name && (
          <p className="text-sm text-destructive" data-testid="trip-name-error">
            {errors.name}
          </p>
        )}
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
          data-testid="trip-description-input"
        />
        {errors.description && (
          <p className="text-sm text-destructive" data-testid="trip-description-error">
            {errors.description}
          </p>
        )}
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
          placeholder="Wklej link mapy.com (np. https://mapy.com/s/hokakucoto)"
          aria-invalid={!!errors.map_url}
          disabled={isSubmitting}
          data-testid="trip-map-url-input"
        />
        {errors.map_url && (
          <p className="text-sm text-destructive" data-testid="trip-map-url-error">
            {errors.map_url}
          </p>
        )}

        {/* Coordinates extraction feedback */}
        {mapyLoading && (
          <div
            className="flex items-center gap-2 rounded-lg border border-muted bg-muted/50 p-3"
            data-testid="coordinates-loading"
          >
            <Spinner />
            <span className="text-sm text-muted-foreground">Wyciąganie współrzędnych...</span>
          </div>
        )}

        {mapyError && !mapyLoading && formData.map_url && (
          <div
            className="rounded-lg border border-destructive/50 bg-destructive/10 p-3"
            data-testid="coordinates-error"
          >
            <p className="text-sm text-destructive">⚠ {mapyError}</p>
          </div>
        )}

        {mapySuccess &&
          latitude !== null &&
          longitude !== null &&
          typeof latitude === "number" &&
          typeof longitude === "number" && (
            <div
              className="rounded-lg border border-green-500/50 bg-green-500/10 p-3"
              data-testid="coordinates-success"
            >
              <p className="text-sm font-mono text-green-700 dark:text-green-400">
                ✓ Współrzędne: {formatCoordinatesDMS(latitude, longitude)}
              </p>
            </div>
          )}

        <p className="text-xs text-muted-foreground">
          Link musi zawierać &quot;mapy.com&quot; •{" "}
          <a
            href="https://mapy.com/zakladni"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline focus-visible:underline focus-visible:outline-none"
          >
            Zaplanuj trasę na Mapy.com
          </a>
        </p>
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
          data-testid="trip-date-input"
        />
        {errors.trip_date && (
          <p className="text-sm text-destructive" data-testid="trip-date-error">
            {errors.trip_date}
          </p>
        )}
      </div>

      {/* Form actions */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto" data-testid="submit-trip-button">
          {isSubmitting ? "Zapisywanie..." : "Zapisz"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
          data-testid="cancel-trip-button"
        >
          Anuluj
        </Button>
      </div>
    </form>
  );
}
