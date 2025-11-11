import { useState, useEffect, useCallback, useMemo } from "react";

interface UseMapyLinkResult {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Simple debounce implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function useMapyLink(shortUrl: string): UseMapyLinkResult {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const expandMapyLink = useCallback(async (url: string) => {
    // Reset states
    setLoading(true);
    setError(null);
    setSuccess(false);
    setLatitude(null);
    setLongitude(null);

    try {
      // Use local API endpoint instead of Supabase Edge Function
      const functionUrl = "/api/expand-mapy-link";

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shortUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nie udało się rozwinąć linku");
      }

      const data = await response.json();

      setLatitude(data.latitude);
      setLongitude(data.longitude);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced version of expandMapyLink
  const debouncedExpandMapyLink = useMemo(() => debounce(expandMapyLink, 300), [expandMapyLink]);

  useEffect(() => {
    // Only process if URL is not empty and looks like a mapy.com URL
    if (!shortUrl || shortUrl.trim() === "") {
      setLatitude(null);
      setLongitude(null);
      setError(null);
      setSuccess(false);
      setLoading(false);
      return;
    }

    // Basic validation
    if (!shortUrl.includes("mapy.com")) {
      setError("Podaj prawidłowy link mapy.com");
      setSuccess(false);
      setLoading(false);
      return;
    }

    // Call debounced function
    debouncedExpandMapyLink(shortUrl);
  }, [shortUrl, debouncedExpandMapyLink]);

  return {
    latitude,
    longitude,
    loading,
    error,
    success,
  };
}
