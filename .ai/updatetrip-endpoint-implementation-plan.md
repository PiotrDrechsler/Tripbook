# API Endpoint Implementation Plan: Update Trip

## 1. Przegląd punktu końcowego

Endpoint PATCH `/api/trips/{tripId}` umożliwia częściową aktualizację istniejącej trasy. Klient może przesłać dowolne podzbiory mutowalnych pól (`name`, `description`, `map_url`, `trip_date`), aby zmienić wartości tych pól w bazie danych.

## 2. Szczegóły żądania

- Metoda HTTP: PATCH
- Struktura URL: `/api/trips/{tripId}`
- Nagłówki:
  - `Content-Type: application/json`
- Parametry:
  - Wymagane:
    - `tripId` (UUID) – identyfikator trasy w ścieżce URL
  - Opcjonalne (podaj tylko pola do aktualizacji):
    - `name` (string, max 100 znaków)
    - `description` (string|null, max 2000 znaków; `null` czyści opis)
    - `map_url` (string zawierający "mapy.com")
    - `trip_date` (string|null, ISO 8601 YYYY-MM-DD; `null` czyści datę)
- Przykład ciała żądania:
  ```json
  {
    "name": "Extended Weekend Hiking in Tatra Mountains",
    "description": "Now a three-day hiking adventure with camping.",
    "trip_date": "2025-11-14"
  }
  ```

## 3. Wykorzystywane typy

- `UpdateTripCommand` (src/types.ts) – DTO dla aktualizacji trasy, zawierający mutowalne pola.
- `TripDto` (src/types.ts) – zwracany obiekt trasy bez `user_id`.
- `ErrorResponseDto` (src/types.ts) – format błędów: `{ error: string; message: string; field?: string }`.
- W `src/lib/schemas/tripSchema.ts`:
  - `getTripParamsSchema` / `GetTripParams` – do walidacji `params.id`.
  - `updateTripSchema` / `UpdateTripInput` – do walidacji ciała PATCH.

## 4. Szczegóły odpowiedzi

- 200 OK
  - Body: `TripDto` ze zaktualizowanym rekordem i nowym `updated_at`.
- 400 Bad Request
  - Niepoprawne formaty/typy (UUID, długości pola, data itp.).
  - Body:
    ```json
    { "error": "Validation error", "message": "<opis błędu>", "field": "<nazwa pola>" }
    ```
- 422 Unprocessable Entity
  - `map_url` nie zawiera "mapy.com".
  - Body:
    ```json
    { "error": "Validation error", "message": "Map URL must contain 'mapy.com'", "field": "map_url" }
    ```
- 404 Not Found
  - Brak trasy o podanym `tripId`.
  - Body:
    ```json
    { "error": "Not found", "message": "Trip with ID '<tripId>' does not exist" }
    ```
- 500 Internal Server Error
  - Nieoczekiwany błąd serwera lub bazy.
  - Body:
    ```json
    { "error": "Internal Server Error", "message": "An unexpected error occurred" }
    ```

## 5. Przepływ danych

1. Walidacja `params.id` przez `getTripParamsSchema.parse(params)`.
2. Parsowanie i walidacja ciała PATCH przez `updateTripSchema.parse(await request.json())`.
3. Wywołanie serwisu:
   ```ts
   const result = await tripService.updateTrip(input.id, command, locals.supabase);
   ```
4. Obsługa wyniku:
   - Jeśli `result === null` → 404 Not Found.
   - W przeciwnym razie mapowanie `result` na `TripDto` i zwrot 200.

## 6. Względy bezpieczeństwa

- Obecnie publiczny; w przyszłości ochrona JWT przez middleware Astro.
- Zod sanitizuje i waliduje wejście, zapobiegając SQL Injection i niepoprawnym danym.
- Nigdy nie przyjmuj ani nie nadpisuj pola `user_id` z żądania.

## 7. Obsługa błędów

- **ZodError** → 400 (pierwszy błąd z `error.message` i `error.path`).
- **map_url refine** → 422.
- **Brak rekordu** → 404.
- **Błąd Supabase** → log + 500.
- Logi:
  ```ts
  console.error("Error updating trip:", error);
  console.error("Error in PATCH /api/trips/[id]:", error);
  ```

## 8. Wydajność

- UPDATE po kluczu głównym (PRIMARY KEY UUID) jest szybki.
- Indeks na `id` i `updated_at` optymalizuje operację.
- Użycie `.update(...).select().single()` minimalizuje ilość zapytań.

## 9. Kroki implementacji

1. **Zdefiniować `updateTripSchema`** w `src/lib/schemas/tripSchema.ts`.
2. **Dodać `updateTrip`** w `src/lib/services/tripService.ts`.
3. **Utworzyć handler PATCH** w `src/pages/api/trips/[id].ts` zgodnie ze schematem.
4. **Dodać importy** (`updateTripSchema`, `updateTrip`, `UpdateTripCommand`).
5. **Testy manualne**: curl dla scenariuszy 200, 400, 422, 404.
6. **Code review & lint**.
7. **Merge & deploy** na staging.
