# API Endpoint Implementation Plan: Create Trip (POST /api/trips)

## 1. Przegląd punktu końcowego

Punkt końcowy służy do dodawania nowej trasy (trip) dla uwierzytelnionego użytkownika.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: `/api/trips`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
  - `Content-Type: application/json`
- Parametry:
  - Wymagane:
    - `name`: string, maksymalna długość 100 znaków
    - `map_url`: string, musi zawierać `"mapy.com"`
    - `trip_date`: string, format `YYYY-MM-DD`
  - Opcjonalne:
    - `description`: string, maksymalna długość 2000 znaków
- Request Body (JSON):

```json
{
  "name": "Trip name",
  "description": "Opis wycieczki (opcjonalnie)",
  "map_url": "https://mapy.com/...",
  "trip_date": "2025-10-18"
}
```

## 3. Wykorzystywane typy

- `CreateTripDTO` (Pick<TablesInsert<'trips'>, 'name' | 'description' | 'map_url' | 'trip_date'>)
- `CreateTripCommand` (z polem `payload: CreateTripDTO`)
- `TripDTO` (pełny rekord trasy z bazy)

## 4. Szczegóły odpowiedzi

- Sukces (201 Created):
  - Body zawiera nowo utworzony obiekt Trip:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "...",
    "description": "...",
    "map_url": "...",
    "trip_date": "YYYY-MM-DD",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- Błędy:
  - 400 Bad Request: nieudana walidacja (szczegóły w ciele odpowiedzi)
  - 401 Unauthorized: brak/nieprawidłowy token
  - 500 Internal Server Error: błąd serwera lub bazy danych

## 5. Przepływ danych

1. Middleware (`src/middleware/index.ts`) przypisuje `supabase` do `context.locals`.
2. `POST /api/trips`:
   - Ekstrahowanie tokena z `Authorization` i weryfikacja JWT
   - Parsowanie i walidacja body za pomocą Zod (`CreateTripSchema`)
   - Wywołanie serwisu `tripsService.createTrip(userId, payload)`
   - Serwis korzysta z `context.locals.supabase`:
     - `insert` do tabeli `trips` z `user_id = userId`
   - Zwrócenie wstawionego rekordu jako odpowiedź 201

## 6. Względy bezpieczeństwa

- Autoryzacja: weryfikacja Bearer JWT przed logiką biznesową
- RLS w Supabase: `user_id = auth.uid()`
- Walidacja wejścia (Zod + constraints w DB)
- Sanityzacja URL (uniknięcie XSS, open redirect) przez wymóg `mapy.com`

## 7. Obsługa błędów

- Walidacja Zod:
  - Rzuć `ValidationError` → odpowiedź 400 z listą błędów
- Brak/nieprawidłowy token:
  - Rzuć `401 Unauthorized`
- Błąd DB:
  - Log do konsoli/Sentry
  - Odpowiedź 500

## 8. Rozważania dotyczące wydajności

- Indeks B-tree na kolumnie `user_id` (już istnieje)
- Minimalizacja rozmiaru payload
- Użycie paginacji i limitowania przy listowaniu

## 9. Kroki implementacji

1. Utworzyć `src/lib/validators/trips.ts` z Zod schema:

   ```ts
   import { z } from "zod";

   export const CreateTripSchema = z.object({
     name: z.string().min(1).max(100),
     description: z.string().max(2000).optional(),
     map_url: z
       .string()
       .url()
       .refine((u) => u.includes("mapy.com")),
     trip_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
   });
   ```

2. Utworzyć serwis `src/lib/services/trips.ts`:

   ```ts
   import type { CreateTripDTO, TripDTO } from "../types";

   export async function createTrip(supabase, userId: string, data: CreateTripDTO): Promise<TripDTO> {
     const { data: trip, error } = await supabase
       .from("trips")
       .insert({ user_id: userId, ...data })
       .select()
       .single();
     if (error) throw error;
     return trip;
   }
   ```

3. Utworzyć endpoint `src/pages/api/trips.ts`:

   ```ts
   import type { APIRoute } from "astro";
   import { CreateTripSchema } from "../../lib/validators/trips";
   import { createTrip } from "../../lib/services/trips";

   export const prerender = false;

   export const POST: APIRoute = async ({ request, locals }) => {
     const authHeader = request.headers.get("Authorization");
     if (!authHeader?.startsWith("Bearer ")) return new Response(null, { status: 401 });
     const token = authHeader.split(" ")[1];
     const { data: user, error: userErr } = await locals.supabase.auth.getUser(token);
     if (userErr || !user) return new Response(null, { status: 401 });

     let payload;
     try {
       payload = CreateTripSchema.parse(await request.json());
     } catch (err) {
       return new Response(JSON.stringify({ errors: err.errors }), { status: 400 });
     }

     try {
       const trip = await createTrip(locals.supabase, user.id, payload);
       return new Response(JSON.stringify(trip), { status: 201 });
     } catch {
       return new Response(null, { status: 500 });
     }
   };
   ```

4. Zaktualizować `tsconfig.json` i dodać nowy folder `lib/validators` i `lib/services` do ścieżek.
5. Udokumentować w README sekcję „API Endpoints”.
