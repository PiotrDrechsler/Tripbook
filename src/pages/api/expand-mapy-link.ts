import type { APIRoute } from "astro";

interface MapyLinkRequest {
  shortUrl: string;
}

interface MapyLinkResponse {
  latitude: number;
  longitude: number;
  finalUrl: string;
}

interface ErrorResponse {
  error: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = (await request.json()) as MapyLinkRequest;
    const { shortUrl } = body;

    if (!shortUrl) {
      const errorResponse: ErrorResponse = {
        error: "Missing shortUrl parameter",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate URL format
    if (!shortUrl.includes("mapy.com")) {
      const errorResponse: ErrorResponse = {
        error: "Invalid mapy.com URL",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Follow redirects with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let finalUrl: string;
    try {
      const response = await fetch(shortUrl, {
        redirect: "follow",
        signal: controller.signal,
      });
      finalUrl = response.url;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        const errorResponse: ErrorResponse = {
          error: "Request timeout - mapy.com nie odpowiada",
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 504,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    // Extract coordinates using regex
    const xMatch = finalUrl.match(/[&?]x=([^&]+)/);
    const yMatch = finalUrl.match(/[&?]y=([^&]+)/);

    if (!xMatch || !yMatch) {
      const errorResponse: ErrorResponse = {
        error: "Nie znaleziono współrzędnych w URL. Sprawdź czy link jest poprawny.",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse coordinates
    // Note: mapy.com uses x=longitude, y=latitude
    const longitude = parseFloat(xMatch[1]);
    const latitude = parseFloat(yMatch[1]);

    if (isNaN(latitude) || isNaN(longitude)) {
      const errorResponse: ErrorResponse = {
        error: "Nieprawidłowy format współrzędnych",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return coordinates in Google Maps format
    const response: MapyLinkResponse = {
      latitude,
      longitude,
      finalUrl,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error expanding mapy.com link:", error);
    const errorResponse: ErrorResponse = {
      error: "Błąd serwera podczas rozwijania linku",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
