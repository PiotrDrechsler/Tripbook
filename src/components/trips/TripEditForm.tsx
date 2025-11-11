import React, { useState } from "react";
import type { TripViewModel, UpdateTripCommand, ErrorResponseDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMapyLink } from "@/lib/hooks/useMapyLink";
import { Spinner } from "./Spinner";
import { formatCoordinatesDMS } from "@/lib/utils/coordinates";

interface TripEditFormProps {
  trip: TripViewModel;
}

export function TripEditForm({ trip }: TripEditFormProps) {
  const [formData, setFormData] = useState({
    name: trip.name,
    description: trip.description || "",
    map_url: trip.map_url,
    trip_date: trip.trip_date || "",
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
      [name]: value,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);

    try {
      // Prepare update command (only changed fields)
      const command: UpdateTripCommand = {
        name: formData.name !== trip.name ? formData.name : undefined,
        description: formData.description !== (trip.description || "") ? formData.description : undefined,
        map_url: formData.map_url !== trip.map_url ? formData.map_url : undefined,
        trip_date: formData.trip_date !== (trip.trip_date || "") ? formData.trip_date : undefined,
        // Include coordinates if map URL changed and they are available
        latitude: formData.map_url !== trip.map_url && latitude !== null ? latitude : undefined,
        longitude: formData.map_url !== trip.map_url && longitude !== null ? longitude : undefined,
      };

      // Remove undefined fields
      const cleanedCommand = Object.fromEntries(
        Object.entries(command).filter(([, value]) => value !== undefined)
      ) as UpdateTripCommand;

      // If nothing changed, just go back
      if (Object.keys(cleanedCommand).length === 0) {
        window.location.href = `/trips/${trip.id}`;
        return;
      }

      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedCommand),
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

      // Success - redirect to details page
      window.location.href = `/trips/${trip.id}`;
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = `/trips/${trip.id}`;
  };

  return (
    <div className="flex h-full flex-col">
      <div>
        <h1 className="text-3xl font-bold">Edytuj wycieczkę</h1>
        <p className="mt-2 text-muted-foreground">Zaktualizuj informacje o swojej wycieczce</p>
      </div>

      {generalError && (
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{generalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col overflow-auto">
        <div className="space-y-6">
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
              value={formData.description}
              onChange={handleChange}
              maxLength={2000}
              rows={5}
              placeholder="Opisz swoją wycieczkę..."
              aria-invalid={!!errors.description}
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            <p className="text-xs text-muted-foreground">{formData.description.length} / 2000 znaków</p>
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

            {/* Coordinates extraction feedback */}
            {mapyLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-muted bg-muted/50 p-3">
                <Spinner />
                <span className="text-sm text-muted-foreground">Wyciąganie współrzędnych...</span>
              </div>
            )}

            {mapyError && !mapyLoading && formData.map_url && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">⚠ {mapyError}</p>
              </div>
            )}

            {mapySuccess &&
              latitude !== null &&
              longitude !== null &&
              typeof latitude === "number" &&
              typeof longitude === "number" && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
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
              value={formData.trip_date}
              onChange={handleChange}
              aria-invalid={!!errors.trip_date}
              disabled={isSubmitting}
            />
            {errors.trip_date && <p className="text-sm text-destructive">{errors.trip_date}</p>}
          </div>
        </div>

        {/* Form actions - always visible at bottom */}
        <div className="mt-6 flex flex-shrink-0 gap-3 border-t bg-background pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  );
}
