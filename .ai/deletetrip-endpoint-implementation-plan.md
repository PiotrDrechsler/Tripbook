# API Endpoint Implementation Plan: Delete Trip

## 1. Przegląd punktu końcowego

Endpoint służy do trwałego usunięcia (hard delete) rekordu trasy z bazy danych na podstawie UUID. Klient wysyła żądanie DELETE z identyfikatorem trasy w ścieżce URL, a serwer waliduje identyfikator, sprawdza istnienie rekordu, usuwa go i zwraca odpowiedni kod statusu.

## 2. Szczegóły żądania

- Metoda HTTP: DELETE
- Ścieżka URL: `/api/trips/{tripId}`
- Parametry:
  - Wymagane:
    - `tripId` (string, UUID) – identyfikator trasy w ścieżce URL
  - Opcjonalne: brak
- Request Body: brak
- Request Headers: brak wymaganych

### Przykład żądania

```bash
DELETE /api/trips/550e8400-e29b-41d4-a716-446655440000
```

## 3. Wykorzystywane typy

- `ErrorResponseDto` (src/types.ts) – format błędów: `{ error: string; message: string; field?: string }`
- `GetTripParams` (src/lib/schemas/tripSchema.ts) – typ Zod dla walidacji `{ id: string }` (już istnieje, wykorzystany w GET endpoint)

## 4. Szczegóły odpowiedzi

- **204 No Content** (preferowany)
  - Brak treści odpowiedzi
  - Wskazuje pomyślne usunięcie
- **200 OK** (alternatywny)

  ```json
  {
    "message": "Trip successfully deleted",
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```

- **400 Bad Request**

  ```json
  {
    "error": "Validation error",
    "message": "Invalid tripId format",
    "field": "id"
  }
  ```

- **404 Not Found**

  ```json
  {
    "error": "Not found",
    "message": "Trip with ID '550e8400-e29b-41d4-a716-446655440000' does not exist"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "error": "Internal Server Error",
    "message": "An unexpected error occurred"
  }
  ```

## 5. Przepływ danych

1. Klient → Astro API Route (`src/pages/api/trips/[id].ts`, handler `DELETE`)
2. Walidacja `params.id` za pomocą Zod:
   - Parser `getTripParamsSchema` waliduje UUID
3. Wywołanie serwisu:
   ```ts
   const deleted = await tripService.deleteTrip(input.id, locals.supabase);
   ```
4. Serwis:
   - Sprawdza istnienie trasy: `supabase.from("trips").select("id").eq("id", id).single()`
   - Jeśli nie istnieje → zwraca `false`
   - Jeśli istnieje → wykonuje `supabase.from("trips").delete().eq("id", id)`
   - Jeśli błąd bazy → log + throw
   - Zwraca `true` po pomyślnym usunięciu
5. API Route:
   - Jeśli wynik `false` → 404 Not Found
   - Jeśli wynik `true` → 204 No Content (lub 200 OK z komunikatem)
6. Zwrócenie odpowiedzi

## 6. Względy bezpieczeństwa

- Obecnie publiczny endpoint; w przyszłości:
  - Wymaganie nagłówka `Authorization: Bearer <token>`
  - Middleware JWT w Astro weryfikujący token
  - Sprawdzenie `trip.user_id === auth.uid()` przed usunięciem
- Walidacja UUID zapobiega SQL Injection
- Sprawdzenie istnienia przed usunięciem zapobiega ujawnieniu informacji o nieistniejących zasobach
- Hard delete jest operacją nieodwracalną – w przyszłości można rozważyć soft delete z polem `deleted_at`
- Nie ujawniać szczegółów błędów bazy danych w odpowiedziach produkcyjnych

## 7. Obsługa błędów

| Scenariusz                       | Kod | Odpowiedź                                                                      |
| -------------------------------- | --- | ------------------------------------------------------------------------------ |
| Nieprawidłowy format UUID        | 400 | `{ error: "Validation error", message: "Invalid tripId format", field: "id" }` |
| Brak rekordu o podanym `tripId`  | 404 | `{ error: "Not found", message: "Trip with ID '...' does not exist" }`         |
| Błąd połączenia / Supabase error | 500 | `{ error: "Internal Server Error", message: "An unexpected error occurred" }`  |

**Logowanie błędów**:

- Wszystkie błędy walidacji: `console.error("Validation error in DELETE /api/trips/[id]:", error)`
- Błędy serwisu: `console.error("Error deleting trip:", error)`
- Błędy ogólne: `console.error("Error in DELETE /api/trips/[id]:", error)`

## 8. Rozważania dotyczące wydajności

- Operacja DELETE po indeksowanym kluczu głównym (UUID) jest bardzo szybka
- Dwa zapytania: jedno sprawdzające istnienie, drugie usuwające
  - Można zoptymalizować do jednego zapytania z obsługą wyniku `count`
- Indeks PRIMARY KEY na `id` optymalizuje operację
- Cascade delete automatycznie usuwa powiązane rekordy (jeśli istnieją relacje)
- W przyszłości można rozważyć batch delete dla wielu tras jednocześnie

## 9. Etapy wdrożenia

### 9.1 Wykorzystanie istniejącego schematu walidacji

**Plik**: `src/lib/schemas/tripSchema.ts`

Schemat `getTripParamsSchema` już istnieje i będzie wykorzystany:

```typescript
export const getTripParamsSchema = z.object({
  id: z.string().uuid("Invalid tripId format"),
});
export type GetTripParams = z.infer<typeof getTripParamsSchema>;
```

### 9.2 Implementacja serwisu

**Plik**: `src/lib/services/tripService.ts`

Dodać nową funkcję:

```typescript
/**
 * Deletes a trip by ID (hard delete)
 *
 * @param id - UUID of the trip to delete
 * @param supabase - Supabase client instance
 * @returns true if trip was deleted, false if trip doesn't exist
 * @throws Error if the database operation fails
 */
export async function deleteTrip(id: string, supabase: SupabaseClient): Promise<boolean> {
  // First check if trip exists
  const { data: existingTrip, error: checkError } = await supabase.from("trips").select("id").eq("id", id).single();

  // Handle error (other than not found)
  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking trip existence:", checkError);
    throw new Error(`Failed to check trip: ${checkError.message}`);
  }

  // If trip doesn't exist, return false
  if (!existingTrip) {
    return false;
  }

  // Delete the trip
  const { error: deleteError } = await supabase.from("trips").delete().eq("id", id);

  if (deleteError) {
    console.error("Error deleting trip:", deleteError);
    throw new Error(`Failed to delete trip: ${deleteError.message}`);
  }

  return true;
}
```

### 9.3 Implementacja API Route

**Plik**: `src/pages/api/trips/[id].ts`

Dodać handler `DELETE` do istniejącego pliku (który już zawiera GET i PATCH):

```typescript
/**
 * DELETE /api/trips/{tripId}
 * Permanently deletes a trip (hard delete)
 *
 * Path parameters:
 * - tripId: UUID of the trip to delete
 *
 * Responses:
 * - 204: Trip successfully deleted (no content)
 * - 400: Validation error (invalid UUID format)
 * - 404: Trip not found
 * - 500: Internal server error
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Validate tripId parameter
    let input: GetTripParams;
    try {
      input = getTripParamsSchema.parse(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];

        const errorResponse: ErrorResponseDto = {
          error: "Validation error",
          message: firstError.message,
          field: firstError.path.join("."),
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw error;
    }

    // Call service to delete trip
    const deleted = await deleteTrip(input.id, locals.supabase);

    // If trip doesn't exist, return 404
    if (!deleted) {
      const errorResponse: ErrorResponseDto = {
        error: "Not found",
        message: `Trip with ID '${input.id}' does not exist`,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return 204 No Content for successful deletion
    return new Response(null, {
      status: 204,
    });

    // Alternative: Return 200 OK with message
    // const successResponse = {
    //   message: "Trip successfully deleted",
    //   id: input.id,
    // };
    // return new Response(JSON.stringify(successResponse), {
    //   status: 200,
    //   headers: { "Content-Type": "application/json" },
    // });
  } catch (error) {
    console.error("Error in DELETE /api/trips/[id]:", error);

    // Return generic error response
    const errorResponse: ErrorResponseDto = {
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

### 9.4 Aktualizacja importów

W pliku `src/pages/api/trips/[id].ts` upewnić się, że istnieją importy:

```typescript
import { getTripParamsSchema } from "../../../lib/schemas/tripSchema";
import { deleteTrip } from "../../../lib/services/tripService";
import type { ErrorResponseDto } from "../../../types";
import type { APIRoute } from "astro";
import { z } from "zod";
```

W pliku `src/lib/services/tripService.ts` upewnić się, że eksportowana jest funkcja `deleteTrip`:

```typescript
export { deleteTrip };
```

### 9.5 Dodanie eksportu prerender

Upewnić się, że w `src/pages/api/trips/[id].ts` istnieje:

```typescript
export const prerender = false;
```

## 10. Testowanie

### 10.1 Testy manualne

Sprawdzić działanie endpointu używając narzędzi typu:

- Postman
- curl
- Thunder Client (VS Code extension)

Przykładowe testy:

```bash
# Test 1: Pomyślne usunięcie istniejącej trasy
# Najpierw utwórz trasę, zapisz jej ID
curl -X POST http://localhost:4321/api/trips \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Trip","map_url":"https://mapy.com/test"}'

# Następnie usuń trasę (użyj ID z poprzedniej odpowiedzi)
curl -X DELETE http://localhost:4321/api/trips/{valid-trip-id} -v

# Test 2: Próba usunięcia nieistniejącej trasy
curl -X DELETE http://localhost:4321/api/trips/00000000-0000-0000-0000-000000000000 -v

# Test 3: Nieprawidłowy format UUID
curl -X DELETE http://localhost:4321/api/trips/invalid-id -v

# Test 4: Weryfikacja, że trasa została rzeczywiście usunięta
# Spróbuj pobrać usuniętą trasę
curl http://localhost:4321/api/trips/{deleted-trip-id}
```

### 10.2 Oczekiwane rezultaty

- **Test 1**: 204 No Content, brak treści odpowiedzi
- **Test 2**: 404 Not Found, komunikat "Trip with ID '...' does not exist"
- **Test 3**: 400 Bad Request, komunikat "Invalid tripId format"
- **Test 4**: 404 Not Found (potwierdzenie usunięcia)

### 10.3 Testy edge cases

```bash
# Test 5: Podwójne usunięcie tej samej trasy
curl -X DELETE http://localhost:4321/api/trips/{valid-trip-id}
curl -X DELETE http://localhost:4321/api/trips/{valid-trip-id}
# Pierwsze: 204, drugie: 404

# Test 6: UUID z dużymi literami
curl -X DELETE http://localhost:4321/api/trips/550E8400-E29B-41D4-A716-446655440000

# Test 7: UUID z dodatkowymi spacjami (powinno się nie udać)
curl -X DELETE "http://localhost:4321/api/trips/ 550e8400-e29b-41d4-a716-446655440000 "
```

## 11. Potencjalne problemy i rozwiązania

| Problem                                     | Rozwiązanie                                                         |
| ------------------------------------------- | ------------------------------------------------------------------- |
| Cascade delete usuwa powiązane dane         | Upewnić się, że foreign key constraints są poprawnie skonfigurowane |
| Wyścig w operacjach równoległych            | Transakcje bazy danych (obecnie nie występuje problem)              |
| Potrzeba przywrócenia usuniętej trasy       | Rozważyć soft delete z polem `deleted_at` zamiast hard delete       |
| Audit trail dla usuniętych tras             | Dodać tabelę `trip_audit` logującą operacje DELETE przed wykonaniem |
| Usunięcie dużej liczby powiązanych rekordów | Monitorować wydajność, rozważyć batch operations                    |

## 12. Przyszłe ulepszenia

- **Soft delete**: zamiast trwałego usunięcia, dodać kolumnę `deleted_at` i filtrować usunięte trasy
- **Audit trail**: logowanie operacji DELETE do tabeli audytu przed usunięciem
- **Batch delete**: endpoint do usuwania wielu tras jednocześnie
- **Uwierzytelnianie**: dodać weryfikację JWT i sprawdzenie `user_id`
- **Przywracanie**: endpoint do przywracania soft-deleted tras
- **Confirmation token**: wymaganie tokena potwierdzenia dla krytycznych operacji DELETE
- **Rate limiting**: ograniczenie liczby operacji DELETE na użytkownika/IP
- **Webhook notifications**: powiadomienia o usunięciu trasy do zewnętrznych systemów

## 13. Checklist przed merge

- [ ] Funkcja `deleteTrip` dodana do `tripService.ts`
- [ ] Handler `DELETE` dodany do `[id].ts`
- [ ] Wszystkie importy poprawnie zdefiniowane
- [ ] Testy manualne przeszły pomyślnie (204, 400, 404, 500)
- [ ] Kod zgodny z ESLint bez błędów
- [ ] Logowanie błędów działa poprawnie
- [ ] Dokumentacja API zaktualizowana (jeśli istnieje)
- [ ] Code review przeprowadzony
- [ ] Endpoint działa na środowisku staging

## 14. Różnice od innych endpointów

| Aspekt                | Create/Update               | Get/List                    | Delete               |
| --------------------- | --------------------------- | --------------------------- | -------------------- |
| Request body          | JSON z danymi               | Brak                        | Brak                 |
| Success status        | 200/201                     | 200                         | 204 (lub 200)        |
| Response body         | TripDto                     | TripDto / ListTripsResponse | Brak (lub komunikat) |
| Operacja              | INSERT/UPDATE               | SELECT                      | DELETE               |
| Odwracalność          | Tak (UPDATE możliwy)        | N/A (read-only)             | Nie (nieodwracalne)  |
| Sprawdzenie istnienia | Nie (CREATE) / Tak (UPDATE) | Tak                         | Tak                  |
