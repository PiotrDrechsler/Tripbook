# Routes Service - Przykłady użycia

## Opis

`RoutesService` to serwis do obliczania tras z wykorzystaniem Google Routes API. Serwis pobiera lokalizację użytkownika, współrzędne wycieczki z bazy danych i oblicza dystans oraz czas dojazdu.

## Konfiguracja

### 1. Zmienna środowiskowa

Dodaj klucz API Google Routes do pliku `.env`:

```bash
GOOGLE_ROUTES_API_KEY=your_google_routes_api_key_here
```

### 2. Włączenie API w Google Cloud Console

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Włącz [Routes API](https://console.cloud.google.com/apis/library/routes.googleapis.com)
3. Utwórz klucz API w [Credentials](https://console.cloud.google.com/apis/credentials)

## Użycie w API Endpoint (Server-side)

### Podstawowe użycie

```typescript
import type { APIRoute } from "astro";
import { RoutesService } from "../../lib/services/routesService";

export const POST: APIRoute = async ({ request, locals }) => {
  const { tripId, userLocation } = await request.json();

  // Inicjalizacja serwisu z kluczem API z ENV
  const apiKey = import.meta.env.GOOGLE_ROUTES_API_KEY;
  const routesService = new RoutesService(locals.supabase, apiKey);

  try {
    // Oblicz trasę (lokalizacja użytkownika jest przekazywana z frontendu)
    const routeResult = await routesService.getRouteForTrip(tripId, userLocation);

    return new Response(JSON.stringify(routeResult), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Obsługa błędów
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

## Użycie w React (Frontend)

### Hook useRouteInfo

Hook automatycznie pobiera lokalizację użytkownika z przeglądarki (Geolocation API):

```typescript
import { useRouteInfo } from "../../lib/hooks/useRouteInfo";

function MyComponent({ tripId }: { tripId: string }) {
  const { data, loading, error, fetchRoute } = useRouteInfo();

  const handleGetRoute = async () => {
    try {
      // Hook automatycznie pobierze lokalizację użytkownika i wyśle do API
      await fetchRoute(tripId);
    } catch (err) {
      console.error("Failed to fetch route:", err);
    }
  };

  return (
    <div>
      <button onClick={handleGetRoute} disabled={loading}>
        {loading ? "Obliczanie..." : "Oblicz trasę"}
      </button>

      {error && <p>Błąd: {error}</p>}

      {data && (
        <div>
          <p>Dystans: {(data.distanceMeters / 1000).toFixed(1)} km</p>
          <p>Czas: {Math.floor(data.durationSeconds / 60)} min</p>
        </div>
      )}
    </div>
  );
}
```

### Komponent RouteInfo

```typescript
import { RouteInfo } from "../../components/trips/RouteInfo";

function TripDetails({ tripId }: { tripId: string }) {
  return (
    <div>
      <h1>Szczegóły wycieczki</h1>

      {/* Automatyczne pobieranie informacji o trasie */}
      <RouteInfo tripId={tripId} autoFetch={true} />

      {/* Lub z manualnym pobieraniem */}
      <RouteInfo tripId={tripId} autoFetch={false} />
    </div>
  );
}
```

## Struktura danych

### RouteResult

```typescript
interface RouteResult {
  distanceMeters: number; // Dystans w metrach
  durationSeconds: number; // Czas w sekundach
  encodedPolyline?: string; // Zakodowana linia trasy (opcjonalnie)
}
```

### Przykładowa odpowiedź

```json
{
  "distanceMeters": 45230,
  "durationSeconds": 2580,
  "encodedPolyline": "encoded_polyline_string..."
}
```

## Obsługa błędów

### Typy błędów

```typescript
// Błąd geolokalizacji (brak dostępu do lokalizacji użytkownika)
GeolocationError: "User denied geolocation permission";

// Błąd pobierania danych z bazy
DataFetchError: "Failed to fetch trip coordinates: ...";

// Błąd walidacji
ValidationError: "Trip does not have coordinates set";

// Błąd API Google
ApiError: "API Error 400: Invalid request";

// Przekroczenie limitu zapytań
RateLimitError: "Rate limit exceeded";

// Błąd sieciowy
NetworkError: "Network request failed. Please check your connection.";
```

### Przykład obsługi błędów

```typescript
try {
  const result = await routesService.getRouteForTrip(tripId);
  console.log("Route calculated:", result);
} catch (error) {
  if (error.name === "GeolocationError") {
    alert("Proszę włączyć dostęp do lokalizacji w przeglądarce");
  } else if (error.name === "ValidationError") {
    alert("Wycieczka nie ma ustawionych współrzędnych");
  } else if (error.name === "RateLimitError") {
    alert("Przekroczono limit zapytań. Spróbuj ponownie później.");
  } else {
    alert("Wystąpił błąd podczas obliczania trasy");
  }
}
```

## Wsparcie dla wielu punktów trasy

### Struktura bazy danych

Tabela `trips` wspiera dwa formaty współrzędnych:

1. **Pojedynczy punkt** (legacy):
   - `latitude: number`
   - `longitude: number`

2. **Wiele punktów** (nowy format):
   - `locations: JSONB[]`

```json
[
  { "latitude": 49.2646, "longitude": 19.8645 },
  { "latitude": 50.0614, "longitude": 19.9383 },
  { "latitude": 50.2649, "longitude": 19.0238 }
]
```

### Priorytet

Serwis automatycznie wybiera format:

1. Jeśli `locations` zawiera ≥2 punkty → używa `locations`
2. W przeciwnym razie → używa `latitude` i `longitude`

### Dodawanie wielu punktów

```sql
UPDATE trips
SET locations = '[
  {"latitude": 49.2646, "longitude": 19.8645},
  {"latitude": 50.0614, "longitude": 19.9383}
]'::jsonb
WHERE id = 'trip-uuid';
```

## Wymagania

### Geolokalizacja

- Przeglądarka musi wspierać Geolocation API
- Użytkownik musi udzielić zgody na dostęp do lokalizacji
- Połączenie HTTPS (wymagane dla geolokalizacji w większości przeglądarek)

**Jak to działa:**

1. Użytkownik klika "Oblicz trasę" w przeglądarce
2. Przeglądarka pyta o pozwolenie na dostęp do lokalizacji
3. Hook `useRouteInfo` pobiera współrzędne GPS z przeglądarki
4. Współrzędne są wysyłane do API endpoint (`/api/routes`)
5. Serwis `RoutesService` oblicza trasę używając Google Routes API
6. Wynik jest zwracany do przeglądarki i wyświetlany użytkownikowi

**Dlaczego nie pobieramy lokalizacji na serwerze?**

- Geolocation API działa tylko w przeglądarce (wymaga dostępu do GPS/Wi-Fi)
- Serwer (Node.js/Astro) nie ma dostępu do lokalizacji użytkownika
- To rozwiązanie jest bardziej bezpieczne - użytkownik kontroluje swoją lokalizację

### Google Routes API

- Aktywny klucz API
- Włączone Routes API w projekcie Google Cloud
- Wystarczający limit zapytań (quota)

## Bezpieczeństwo

### ✅ Dobre praktyki

- Klucz API przechowywany tylko w zmiennych środowiskowych server-side
- Wszystkie wywołania Google API przez backend proxy (Astro API routes)
- Walidacja wszystkich danych wejściowych
- Obsługa wszystkich scenariuszy błędów

### ❌ Czego unikać

- Nie eksponuj klucza API w kodzie frontend
- Nie wysyłaj zapytań bezpośrednio z przeglądarki do Google API
- Nie loguj wrażliwych danych (klucze API, współrzędne użytkownika)

## Limity i ograniczenia

### Google Routes API

- Limity zapytań zależne od planu (sprawdź w Google Cloud Console)
- Maksymalna liczba waypoints: 25
- Timeout: 10 sekund dla geolokalizacji

### Wydajność

- Cache wyników po stronie klienta (hook `useRouteInfo`)
- Rozważ implementację cache po stronie serwera dla często używanych tras
- Użyj `autoFetch={false}` dla lepszej kontroli nad momentem pobierania danych

## Rozszerzenia

### Dodatkowe funkcje do rozważenia

1. **Cache tras** - zapisywanie obliczonych tras w bazie danych
2. **Alternatywne trasy** - `computeAlternativeRoutes: true`
3. **Różne tryby podróży** - WALK, BICYCLE, TRANSIT
4. **Unikanie opłat/autostrad** - `routeModifiers`
5. **Wizualizacja trasy** - dekodowanie `encodedPolyline` i wyświetlanie na mapie

## Wsparcie

W przypadku problemów:

1. Sprawdź logi w konsoli przeglądarki
2. Sprawdź logi serwera (Astro)
3. Zweryfikuj konfigurację Google Cloud Console
4. Sprawdź limity API w Google Cloud Console
