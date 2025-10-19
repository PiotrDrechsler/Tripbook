# API Endpoint Implementation Plan: Create Trip

## 1. Przegląd punktu końcowego

Endpoint służy do utworzenia nowego rekordu trasy w bazie danych. Klient wysyła dane trasy (nazwa, opcjonalny opis, adres URL mapy, opcjonalna data), a serwer waliduje dane, zapisuje rekord i zwraca obiekt trasy z metadanymi.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Ścieżka URL: `/api/trips`
- Nagłówki:
  - `Content-Type: application/json`
- Parametry w ciele żądania:
  - Wymagane:
    - `name` (string): nazwa trasy, niepusta, max długość 100
    - `map_url` (string): adres URL mapy, musi zawierać `mapy.com`
  - Opcjonalne:
    - `description` (string|null): opis trasy, max długość 2000
    - `trip_date` (string|null): data w formacie ISO 8601 (YYYY-MM-DD)

### Przykład ciała

```json
{
  "name": "Weekend Hiking in Tatra Mountains",
  "description": "A beautiful two-day hiking trip...",
  "map_url": "https://mapy.com/...",
  "trip_date": "2025-11-15"
}
```

## 3. Wykorzystywane typy

- `CreateTripCommand` (src/types.ts): DTO dla tworzenia trasy, zawiera pola: `name`, `description?`, `map_url`, `trip_date?`
- `TripDto` (src/types.ts): zwracany DTO, pola: `id`, `name`, `description`, `map_url`, `trip_date`, `created_at`, `updated_at`
- `ErrorResponseDto` (src/types.ts): format błędów: `{ error: string; message: string; field?: string }`

## 4. Szczegóły odpowiedzi

- 201 Created
  - Zwraca obiekt `TripDto` jako JSON
- Kody statusu błędów:
  - 400 Bad Request: brak wymaganych pól lub naruszenie ograniczeń długości
  - 422 Unprocessable Entity: niepoprawny `map_url` (nie zawiera `mapy.com`)
  - 500 Internal Server Error: nieoczekiwany błąd serwera

## 5. Przepływ danych

1. Klient → Astro API Route (`src/pages/api/trips/index.ts`, handler `export async function POST`)
2. Walidacja ciała żądania za pomocą Zod:
   - sprawdzenie typu i długości pól
   - walidacja formatu daty i zawartości `map_url`
3. Mapowanie zebranych pól na `CreateTripCommand`
4. Wywołanie serwisu: `tripService.createTrip(command, locals.supabase)`
5. Serwis używa `supabase.from('trips').insert(command).select()` i zwraca pełny rekord
6. Mapowanie rekordu na `TripDto`
7. Zwrócenie odpowiedzi JSON z kodem 201

## 6. Względy bezpieczeństwa

- Obecnie endpoint publiczny; w przyszłości wymaga nagłówka `Authorization: Bearer <token>` i weryfikacji JWT
- Walidacja wejścia chroni przed SQL Injection i nieprawidłowymi danymi
- Upewnić się, że `map_url` zawiera tylko dozwolone domeny
- Unikać nadmiernego ujawniania wewnętrznych błędów (logować szczegóły, a klientowi zwracać ogólny `500`)

## 7. Obsługa błędów

| Kod | Warunek                                         | Format odpowiedzi                                                                             |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 400 | Brak `name` lub `map_url`, lub zbyt długi tekst | `{ error: "Validation error", message: "...", field: "..." }`                                 |
| 422 | `map_url` nie zawiera `mapy.com`                | `{ error: "Validation error", message: "Map URL must contain 'mapy.com'", field: "map_url" }` |
| 500 | Błąd serwera (np. awaria DB)                    | `{ error: "Internal Server Error", message: "..." }`                                          |

Dodatkowo logować wszystkie błędy za pomocą wbudowanego loggera (console.error lub Sentry).

## 8. Rozważania dotyczące wydajności

- Wstawienie jednego rekordu jest operacją szybką; upewnić się, że indeksy (na `user_id`, `created_at`) są poprawnie skonfigurowane
- Zwracanie tylko potrzebnych pól (unikanie SELECT \*)
- Minimalizacja serializacji/parsowania JSON po stronie serwera

## 9. Kroki implementacji

1. Utworzyć plik schematu walidacji `src/lib/schemas/tripSchema.ts` z Zod:
   - zdefiniować `createTripSchema`
2. Utworzyć (lub rozszerzyć) serwis `src/lib/services/tripService.ts`:
   - zaimplementować `async function createTrip(command: CreateTripCommand, supabase: SupabaseClient): Promise<Tables<'trips'>>`
3. Utworzyć Astro API route:
   - `src/pages/api/trips/index.ts`
   - `export const prerender = false`
   - zaimplementować `export async function POST({ request, locals })`
   - parsować JSON, walidować, mapować do `CreateTripCommand`, wywołać serwis, zwracać `TripDto`
4. Dodać mapowanie i obsługę błędów:
   - obsłużyć wyjątki Zod (`formatErrorResponse`) i błędy Supabase (sprawdzić `error` w odpowiedzi)
5. Zaktualizować dokumentację API (`README.md` lub docs) o przykład użycia
6. Przeprowadzić code review i ewentualną poprawę bezpieczeństwa oraz lint
