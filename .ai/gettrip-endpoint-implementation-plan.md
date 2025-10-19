# API Endpoint Implementation Plan: Get Trip Details

## 1. Przegląd punktu końcowego

Cel: Udostępnić szczegóły pojedynczej trasy z bazy danych na podstawie UUID  
Metoda: `GET`  
URL: `/api/trips/{tripId}`

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Ścieżka URL: `/api/trips/{tripId}`
- Parametry:
  - Wymagane:
    - `tripId` (string, UUID) – identyfikator trasy
  - Opcjonalne: brak
- Body: brak

## 3. Wykorzystywane typy

- `TripDto` (src/types.ts) – zwracany obiekt trasy
- `ErrorResponseDto` (src/types.ts) – format błędów
- (Nowy) `GetTripParams` – typ Zod dla walidacji `{ id: string }`

## 4. Szczegóły odpowiedzi

- 200 OK
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Weekend Hiking in Tatra Mountains",
    "description": "A beautiful two-day hiking trip…",
    "map_url": "https://mapy.com/…",
    "trip_date": "2025-11-15",
    "created_at": "2025-10-19T14:30:00.000Z",
    "updated_at": "2025-10-19T14:30:00.000Z"
  }
  ```
- 400 Bad Request
  ```json
  { "error": "Validation error", "message": "Invalid tripId format", "field": "id" }
  ```
- 404 Not Found
  ```json
  { "error": "Not found", "message": "Trip with ID '{tripId}' does not exist" }
  ```
- 500 Internal Server Error
  ```json
  { "error": "Internal Server Error", "message": "An unexpected error occurred" }
  ```

## 5. Przepływ danych

1. Klient → Astro API Route (`src/pages/api/trips/[id].ts`, handler `GET`)
2. Parser Zod (`getTripParamsSchema`) waliduje `params.id` jako UUID
3. Wywołanie serwisu:
   ```ts
   tripService.getTripById(params.id, locals.supabase);
   ```
4. Serwis:
   - `supabase.from("trips").select().eq("id", id).single()`
   - Jeśli `error` → log + throw
   - Jeśli `data` puste → return null
   - Zwraca surowy rekord `Tables<"trips">`
5. API Route:
   - Jeśli wynik `null` → 404
   - Mappowanie rekordu na `TripDto` (usunięcie `user_id`)
   - Zwraca 200 + JSON

## 6. Względy bezpieczeństwa

- Obecnie publiczny, w przyszłości:
  - Wymaganie nagłówka `Authorization: Bearer <token>`
  - Middleware JWT w Astro weryfikujący token
  - Sprawdzenie `trip.user_id === auth.uid()`
- Walidacja UUID zapobiega wstrzyknięciom
- Unikać ujawniania szczegółów błędów w odpowiedziach produkcyjnych

## 7. Obsługa błędów

| Scenariusz                       | Kod | Odpowiedź                     |
| -------------------------------- | --- | ----------------------------- |
| Nieprawidłowy format UUID        | 400 | Validation error, field: `id` |
| Brak rekordu o podanym `tripId`  | 404 | Not found                     |
| Błąd połączenia / Supabase error | 500 | Internal Server Error         |

## 8. Rozważania dotyczące wydajności

- Zapytanie po indeksowanym kluczu głównym (UUID) – optymalne
- Jednolinijkowe wywołanie `.single()` – minimalne koszty
- Możliwość cache’owania w przyszłości po stronie CDN

## 9. Etapy wdrożenia

1. **Schemat walidacji**
   - Plik: `src/lib/schemas/tripSchema.ts`
   - Dodaj:
     ```ts
     export const getTripParamsSchema = z.object({
       id: z.string().uuid("Invalid tripId format"),
     });
     export type GetTripParams = z.infer<typeof getTripParamsSchema>;
     ```
2. **Serwis**
   - Plik: `src/lib/services/tripService.ts`
   - Dodaj:
     ```ts
     export async function getTripById(id: string, supabase: SupabaseClient): Promise<Tables<"trips"> | null> {
       const { data, error } = await supabase.from("trips").select("*").eq("id", id).single();
       if (error && error.code !== "PGRST116") {
         console.error("Error fetching trip:", error);
         throw new Error(error.message);
       }
       return data || null;
     }
     ```
3. **API Route**
   - Nowy plik: `src/pages/api/trips/[id].ts`
   - Zawartość:

     ```ts
     import { GetTripParams, getTripParamsSchema } from "../../../lib/schemas/tripSchema";
     import { getTripById } from "../../../lib/services/tripService";
     import type { TripDto, ErrorResponseDto } from "../../../types";
     import type { APIRoute } from "astro";

     export const GET: APIRoute = async ({ params, locals }) => {
       // Validate params
       let input: GetTripParams;
       try {
         input = getTripParamsSchema.parse(params);
       } catch (e) {
         const first = (e as z.ZodError).errors[0];
         const errRes: ErrorResponseDto = {
           error: "Validation error",
           message: first.message,
           field: first.path.join("."),
         };
         return new Response(JSON.stringify(errRes), { status: 400, headers: { "Content-Type": "application/json" } });
       }

       try {
         const trip = await getTripById(input.id, locals.supabase);
         if (!trip) {
           const errRes: ErrorResponseDto = {
             error: "Not found",
             message: `Trip with ID '${input.id}' does not exist`,
           };
           return new Response(JSON.stringify(errRes), {
             status: 404,
             headers: { "Content-Type": "application/json" },
           });
         }
         const dto: TripDto = {
           id: trip.id,
           name: trip.name,
           description: trip.description,
           map_url: trip.map_url,
           trip_date: trip.trip_date,
           created_at: trip.created_at,
           updated_at: trip.updated_at,
         };
         return new Response(JSON.stringify(dto), { status: 200, headers: { "Content-Type": "application/json" } });
       } catch (error) {
         console.error("Error in GET /api/trips/[id]:", error);
         const errRes: ErrorResponseDto = { error: "Internal Server Error", message: (error as Error).message };
         return new Response(JSON.stringify(errRes), { status: 500, headers: { "Content-Type": "application/json" } });
       }
     };
     ```

4. **Importy i typy**
   - Upewnij się, że w `src/types.ts` są `TripDto`, `ErrorResponseDto`
5. **Dokumentacja**
   - Zaktualizuj README.md lub dokumenty API
6. **Testy manualne**
   - `curl http://localhost:4321/api/trips/<valid-uuid>`
   - `curl http://localhost:4321/api/trips/invalid-id` → 400
   - `curl http://localhost:4321/api/trips/00000000-0000-0000-0000-000000000000` → 404
7. **Code review & lint**
   - Sprawdź style i obsługę błędów zgodnie z wytycznymi
8. **Merge & deploy**
   - Upewnij się, że endpoint działa na środowisku staging bez błędów
