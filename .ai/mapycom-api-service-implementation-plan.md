# Mapy.com API Service Implementation Plan

## 1. Opis usługi

Usługa `MapyComService` to warstwa integracji z zewnętrznym API Mapy.com, odpowiedzialna za:

1. Archiwizację i pobieranie zaplanowanych tras użytkowników.
2. Wysyłanie zapytań trasowych z parametrami: start, end, routeType, waypoints.
3. Parsowanie odpowiedzi: distance, duration, geometry (GeoJSON LineString).
4. Ujednolicenie typów tras i formatów geometrii w aplikacji.

Technologie: TypeScript, Fetch API (lub Axios), Astro/React, środowisko Node w API Astro.

## 2. Opis konstruktora

**Konstruktor** klasy `MapyComService` powinien przyjmować:

1. `apiKey: string` – klucz autoryzacyjny do API Mapy.com.
2. `baseUrl?: string` – opcjonalny URL bazy (domyślnie `https://api.mapy.com/v1/route`).
3. `timeoutMs?: number` – limit czasu zapytania (np. `5000`).

Przykład sygnatury:

```typescript
export class MapyComService {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(apiKey: string, baseUrl = "https://api.mapy.com/v1/route", timeoutMs = 5000) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }
  // ...
}
```

## 3. Publiczne metody i pola

1. `getRoute(params: RouteRequest): Promise<RouteResponse>`
   - Parametry wejściowe:
     1. `start: [number, number]` – współrzędne [lon, lat].
     2. `end: [number, number]` – współrzędne [lon, lat].
     3. `routeType: RouteType` – jednen z: `"car_fast_traffic"`, `"car_fast"`, `"car_shortest"`, `"walk"`, `"bicycle"`.
     4. `waypoints?: Array<[number, number]>` – opcjonalne punkty pośrednie.
   - Zwracany obiekt:
     ```json
     {
       "distance": number,
       "duration": number,
       "geometry": { "type": "LineString", "coordinates": [[lon, lat], ...] }
     }
     ```

2. `archiveRoute(id: string, data: RouteResponse): Promise<void>`
   - Zapisuje odpowiedź trasy do bazy Supabase lub innego store.

3. Pole `defaultHeaders: Record<string,string>`
   - Nagłówki używane globalnie (np. `Authorization`).

## 4. Prywatne metody i pola

1. `buildUrl(params: RouteRequest): string`
   - Składa pełen URL z query string.

2. `handleResponse(response: Response): Promise<RouteResponse>`
   - Waliduje kod HTTP, parsuje JSON, sprawdza kształt obiektu.

3. `validateParams(params: RouteRequest): void`
   - Rzuca błędy early-return gdy współrzędne są poza zakresem lub brak kluczowych pól.

4. Pole `logger` – opcjonalnie instancja loggera do debugowania.

## 5. Obsługa błędów

Potencjalne scenariusze:

1. NetworkError
2. HTTP 4xx (np. 400 Bad Request)
3. HTTP 401/403 (brak lub niepoprawny `apiKey`)
4. HTTP 5xx (błąd serwera)
5. Timeout
6. Nieprawidłowa struktura odpowiedzi (np. brak `geometry`)

Dla każdego:

1. Reject z dedykowanym typem błędu (klasy `MapyComError` rozszerzające `Error`).
2. Retry logic (opcjonalnie) dla 5xx i Timeout.
3. Wczesna walidacja parametrów.

## 6. Kwestie bezpieczeństwa

1. Przechowywanie `apiKey` w bezpiecznym env (pliku `.env`, Supabase Secrets).
2. Ograniczenie dostępu do API poprzez serwer (nie od frontendu).
3. Rate limiting po stronie serwera.
4. Sanitacja inputu (sprawdzanie zakresu współrzędnych).
5. Użycie HTTPS i weryfikacja certyfikatów.

## 7. Plan wdrożenia krok po kroku

1. **Konfiguracja środowiska**
   1. Dodać `MAPYCOM_API_KEY` do `.env` i do `env.d.ts`.
   2. Zainstalować ewentualny client HTTP (`npm install axios` lub użyć native fetch).

2. **Utworzenie pliku serwisu**
   - `src/lib/services/MapyComService.ts`

3. **Implementacja konstruktora**
   - Inicjalizacja pól `apiKey`, `baseUrl`, `timeoutMs`.

4. **Implementacja publicznych metod**
   1. `getRoute`:
      - Wywołanie `validateParams`, `buildUrl`, `fetch`, `handleResponse`.
      - Przykład użycia:

```typescript
const svc = new MapyComService(import.meta.env.MAPYCOM_API_KEY);
const route = await svc.getRoute({
  start: [21.012229, 52.229676],
  end: [21.017532, 52.231958],
  routeType: "walk",
  waypoints: [[21.015, 52.23]],
});
```

5. **Implementacja prywatnych metod**
   - `buildUrl`, `handleResponse`, `validateParams`.

6. **Dodanie typów**
   - W `src/types.ts`:

```typescript
type RouteType = "car_fast_traffic" | "car_fast" | "car_shortest" | "walk" | "bicycle";

interface RouteRequest {
  start: [number, number];
  end: [number, number];
  routeType: RouteType;
  waypoints?: Array<[number, number]>;
}

interface RouteResponse {
  distance: number;
  duration: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}
```

8. **Integracja w aplikacji**
   1. Zmodyfikować hook `useTrip` aby używał `MapyComService`.
   2. Wyświetlić trasę w komponencie `MapPreview`.

9. **Deployment**
   1. Weryfikacja env na produkcji.
   2. Monitorowanie i logowanie błędów.

---

_Dokument przygotowany zgodnie z wymaganiami stacku Astro 5, TS 5, React 19, Tailwind 4, Shadcn/ui._
