# Routes API Service Implementation Plan

## 1. Description usługi

`RoutesService` to moduł kliencki (server-side lub browser proxy) w TypeScript, który:

1. Pobiera lokalizację użytkownika (Geolocation API).
2. Pobiera współrzędne punktów wycieczki z Supabase.
3. Buduje żądanie do Google Routes API z podaną trasą i trybem `DRIVE`.
4. Wysyła zapytanie HTTP (fetch) do Google Routes API.
5. Parsuje odpowiedź (dystans w metrach i czas w sekundach).
6. Obsługuje błędy i zwraca spójny obiekt wyniku.

## 2. Konstruktor

```typescript
class RoutesService {
  private supabase: SupabaseClient;
  private apiKey: string;

  constructor(supabaseClient: SupabaseClient) {
    // 1. Inicjalizacja Supabase
    this.supabase = supabaseClient;
    // 2. Pobranie API key z ENV
    const key = process.env.GOOGLE_ROUTES_API_KEY;
    if (!key) throw new Error("Missing GOOGLE_ROUTES_API_KEY");
    this.apiKey = key;
  }
  // ...
}
```

## 3. Publiczne metody i pola

- `async getRouteForTrip(tripId: string): Promise<RouteResult>`
  1. `getUserLocation(): Promise<LatLng>`
  2. `getTripCoordinates(tripId): Promise<LatLng[]>`
  3. `buildRequestBody(origin, waypoints, destination): RoutesRequestBody`
  4. `callRoutesApi(body): Promise<RawRoutesResponse>`
  5. `parseResponse(raw): RouteResult`

## 4. Prywatne metody i pola

- `private async getUserLocation(): Promise<LatLng>`
  ```ts
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(new GeolocationError(err.message))
    );
  });
  ```
- `private async getTripCoordinates(tripId: string): Promise<LatLng[]>`
  ```ts
  const { data, error } = await this.supabase.from("trips").select("locations").eq("id", tripId).single();
  if (error) throw new DataFetchError(error.message);
  return data.locations as LatLng[];
  ```
- `private buildRequestBody(origin: LatLng, waypoints: LatLng[], destination: LatLng): RoutesRequestBody`
  ```ts
  return {
    origin: { latLng: origin },
    destination: { latLng: destination },
    travelMode: "DRIVE",
    waypoints: waypoints.map((p) => ({ latLng: p })),
  };
  ```
- `private async callRoutesApi(body: RoutesRequestBody): Promise<RawRoutesResponse>`
  ```ts
  const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${this.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
  ```
- `private parseResponse(raw: RawRoutesResponse): RouteResult`
  ```ts
  const route = raw.routes?.[0];
  if (!route) throw new ResponseParseError("No routes returned");
  return {
    distanceMeters: route.distanceMeters,
    durationSeconds: Math.round(route.duration.seconds + route.duration.nanos / 1e9),
  };
  ```

## 5. Obsługa błędów

1. **GeolocationError** – brak/praw dostępu, timeout.
2. **DataFetchError** – błąd Supabase (sieć/RLS).
3. **MissingApiKeyError** – brak klucza w ENV.
4. **ApiError** – HTTP 4xx/5xx z Google (invalid key/quota).
5. **ResponseParseError** – nieoczekiwany format odpowiedzi.
6. **NetworkError** – timeout, offline.
7. **RateLimitError** – kod błędu 429.

## 6. Kwestie bezpieczeństwa

- **API Key**: trzymać wyłącznie na server-side (Astro API route).
- **CORS**: wywołania Google zawsze przez backend proxy.
- **Walidacja**: sprawdzać zakres i typ współrzędnych.
- **RLS**: upewnić się, że Supabase używa właściwych polityk.
- **Logowanie**: nie logować kluczy i wrażliwych danych.

## 7. Plan wdrożenia krok po kroku

1. ✅ `npm install @supabase/supabase-js` (jeśli potrzebne).
2. ✅ Stwórz `src/lib/services/routesService.ts`.
3. ✅ Zaimportuj `SupabaseClient`, zdefiniuj typy `LatLng`, `RoutesRequestBody`, `RawRoutesResponse`, `RouteResult`.
4. ✅ Zaimplementuj konstruktor (pobranie `GOOGLE_ROUTES_API_KEY`).
5. ✅ Zaimplementuj `getUserLocation()` z obsługą błędów.
6. ✅ Zaimplementuj `getTripCoordinates()` odczytując `locations` z Supabase.
7. ✅ Zaimplementuj `buildRequestBody()`, walidując co najmniej 2 punkty.
8. ✅ Zaimplementuj `callRoutesApi()`, używając fetch w Astro API route.
9. ✅ Zaimplementuj `parseResponse()`, mapując na `distanceMeters` i `durationSeconds`.
10. ✅ Zdefiniuj i wyeksportuj custom Error klasy: `GeolocationError`, `ApiError`, itp.
11. ✅ Utwórz plik serwera: `src/pages/api/routes.ts` (Astro endpoint) wywołujący `RoutesService`.
12. ✅ Dodaj ENV: `GOOGLE_ROUTES_API_KEY=…` do `.env` i dokumentacji.

## 8. Dodatkowe implementacje

13. ✅ Utworzono migrację bazy danych: `supabase/migrations/20251111000000_add_locations_array_to_trips.sql`
14. ✅ Zaktualizowano typy bazy danych: `src/db/database.types.ts` (dodano kolumnę `locations`)
15. ✅ Utworzono hook React: `src/lib/hooks/useRouteInfo.ts`
16. ✅ Utworzono komponent UI: `src/components/trips/RouteInfo.tsx`
17. ✅ Zintegrowano komponent z widokiem szczegółów: `src/components/trips/TripDetailsView.tsx`
18. ✅ Utworzono dokumentację: `src/lib/services/routesService.example.md`
19. ✅ Zaktualizowano README.md z instrukcjami konfiguracji i opisem funkcjonalności
