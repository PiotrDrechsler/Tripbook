// Edge Function to expand mapy.com short links and extract coordinates
// Converts mapy.com short URLs to full URLs and extracts latitude/longitude

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { shortUrl }: MapyLinkRequest = await req.json();

    if (!shortUrl) {
      return new Response(JSON.stringify({ error: "Missing shortUrl parameter" } as ErrorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate URL format
    if (!shortUrl.includes("mapy.com")) {
      return new Response(JSON.stringify({ error: "Invalid mapy.com URL" } as ErrorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      if (error.name === "AbortError") {
        return new Response(JSON.stringify({ error: "Request timeout - mapy.com nie odpowiada" } as ErrorResponse), {
          status: 504,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      return new Response(
        JSON.stringify({
          error: "Nie znaleziono współrzędnych w URL. Sprawdź czy link jest poprawny.",
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse coordinates
    // Note: mapy.com uses x=longitude, y=latitude
    const longitude = parseFloat(xMatch[1]);
    const latitude = parseFloat(yMatch[1]);

    if (isNaN(latitude) || isNaN(longitude)) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format współrzędnych",
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return coordinates in Google Maps format
    const response: MapyLinkResponse = {
      latitude,
      longitude,
      finalUrl,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error expanding mapy.com link:", error);
    return new Response(
      JSON.stringify({
        error: "Błąd serwera podczas rozwijania linku",
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
