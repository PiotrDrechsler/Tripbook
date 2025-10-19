# API Endpoint Implementation Plan: List Trips

## 1. Przegląd punktu końcowego

Endpoint służy do pobrania listy tras z bazy danych z obsługą paginacji i sortowania. Klient może wysłać parametry zapytania (page, limit, sort), a serwer zwraca posortowaną, stronicowaną listę tras wraz z metadanymi paginacji.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Ścieżka URL: `/api/trips`
- Nagłówki: Brak wymaganych
- Parametry zapytania (query parameters):
  - Opcjonalne:
    - `page` (number): numer strony, domyślnie: 1, minimum: 1
    - `limit` (number): liczba elementów na stronę, domyślnie: 20, minimum: 1, maksimum: 100
    - `sort` (string): pole sortowania, domyślnie: "-created_at" (prefiks "-" oznacza malejąco)

### Przykłady URL

```
GET /api/trips
GET /api/trips?page=2&limit=10
GET /api/trips?sort=name
GET /api/trips?sort=-trip_date
GET /api/trips?page=1&limit=50&sort=-created_at
```

## 3. Wykorzystywane typy

- `ListTripsResponseDto` (src/types.ts): główna odpowiedź, zawiera pola: `data: TripDto[]`, `pagination: PaginationDto`
- `TripDto` (src/types.ts): DTO pojedynczej trasy, pola: `id`, `name`, `description`, `map_url`, `trip_date`, `created_at`, `updated_at`
- `PaginationDto` (src/types.ts): metadane paginacji, pola: `page`, `limit`, `total`, `total_pages`
- `ErrorResponseDto` (src/types.ts): format błędów: `{ error: string; message: string; field?: string }`

## 4. Szczegóły odpowiedzi

- 200 OK
  - Zwraca obiekt `ListTripsResponseDto` jako JSON
  - W przypadku braku tras zwraca pustą tablicę `data: []` z paginacją `total: 0`
- Kody statusu błędów:
  - 400 Bad Request: nieprawidłowe parametry zapytania (np. limit > 100, page < 1)
  - 500 Internal Server Error: nieoczekiwany błąd serwera

## 5. Przepływ danych

1. Klient → Astro API Route (`src/pages/api/trips/index.ts`, handler `export async function GET`)
2. Walidacja parametrów zapytania za pomocą Zod:
   - sprawdzenie typu i zakresu wartości `page`, `limit`
   - walidacja formatu `sort` (dozwolone wartości: "name", "-name", "trip_date", "-trip_date", "created_at", "-created_at")
3. Parsowanie parametrów:
   - wyodrębnienie nazwy kolumny i kierunku sortowania (ascending/descending) z parametru `sort`
   - obliczenie offset dla paginacji: `(page - 1) * limit`
4. Wywołanie serwisu: `tripService.listTrips({ page, limit, sortColumn, sortDirection }, locals.supabase)`
5. Serwis wykonuje dwa zapytania:
   - `supabase.from('trips').select('*', { count: 'exact' }).order(...).range(...)` - pobiera rekordy
   - Używa `count` z pierwszego zapytania do obliczenia `total_pages`
6. Mapowanie rekordów na `TripDto[]` (usunięcie `user_id`)
7. Utworzenie obiektu `ListTripsResponseDto` z danymi i metadanymi paginacji
8. Zwrócenie odpowiedzi JSON z kodem 200

## 6. Względy bezpieczeństwa

- Obecnie endpoint publiczny; w przyszłości wymaga nagłówka `Authorization: Bearer <token>` i filtrowania po `user_id`
- Walidacja parametrów zapytania zapobiega atakom SQL Injection
- Ograniczenie `limit` do maksymalnie 100 zapobiega przeciążeniu serwera
- Walidacja `sort` tylko do dozwolonych kolumn zapobiega ujawnieniu struktury bazy danych
- Unikać nadmiernego ujawniania wewnętrznych błędów (logować szczegóły, a klientowi zwracać ogólny `500`)

## 7. Obsługa błędów

| Kod | Warunek                                      | Format odpowiedzi                                                             |
| --- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| 400 | `limit` poza zakresem 1-100                  | `{ error: "Validation error", message: "Limit must be between 1 and 100" }`   |
| 400 | `page` < 1                                   | `{ error: "Validation error", message: "Page must be greater than 0" }`       |
| 400 | nieprawidłowa wartość `sort`                 | `{ error: "Validation error", message: "Invalid sort parameter: ..." }`       |
| 400 | nieprawidłowy typ parametru (np. page="abc") | `{ error: "Validation error", message: "Page must be a number" }`             |
| 500 | Błąd serwera (np. awaria DB)                 | `{ error: "Internal Server Error", message: "An unexpected error occurred" }` |

Dodatkowo logować wszystkie błędy za pomocą `console.error` lub Sentry.

## 8. Rozważania dotyczące wydajności

- Zapytanie z paginacją jest wydajne; upewnić się, że indeksy na kolumnach `created_at`, `trip_date`, `name` są poprawnie skonfigurowane
- Użycie `select('*', { count: 'exact' })` wykonuje jedno zapytanie z liczeniem
- Ograniczenie `limit` do 100 elementów zapobiega pobieraniu zbyt dużych zbiorów danych
- W przyszłości rozważyć cache'owanie dla często używanych kombinacji parametrów

## 9. Kroki implementacji

### 9.1 Utworzenie schematu walidacji

**Plik**: `src/lib/schemas/tripSchema.ts`

Dodać nowy schemat:

```typescript
/**
 * Validation schema for listing trips query parameters
 *
 * Validates:
 * - page: optional positive integer, default: 1
 * - limit: optional integer between 1 and 100, default: 20
 * - sort: optional string matching allowed sort patterns, default: "-created_at"
 */
export const listTripsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val > 0, "Page must be a positive number"),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, "Limit must be between 1 and 100"),

  sort: z
    .string()
    .optional()
    .default("-created_at")
    .refine(
      (val) => ["name", "-name", "trip_date", "-trip_date", "created_at", "-created_at"].includes(val),
      "Invalid sort parameter. Allowed values: name, -name, trip_date, -trip_date, created_at, -created_at"
    ),
});

/**
 * Type inferred from the listTripsQuerySchema
 */
export type ListTripsQueryInput = z.infer<typeof listTripsQuerySchema>;
```

### 9.2 Rozszerzenie typów

**Plik**: `src/types.ts`

Typy `ListTripsResponseDto` i `PaginationDto` już istnieją - nie wymagają zmian.

Opcjonalnie dodać typ parametrów dla serwisu:

```typescript
/**
 * Parameters for listing trips
 */
export interface ListTripsParams {
  page: number;
  limit: number;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}
```

### 9.3 Implementacja serwisu

**Plik**: `src/lib/services/tripService.ts`

Dodać nową funkcję:

```typescript
/**
 * Retrieves a paginated and sorted list of trips
 *
 * @param params - Pagination and sorting parameters
 * @param supabase - Supabase client instance
 * @returns Object containing trips array and pagination metadata
 * @throws Error if the database operation fails
 */
export async function listTrips(params: ListTripsParams, supabase: SupabaseClient): Promise<ListTripsResponseDto> {
  const { page, limit, sortColumn, sortDirection } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Query database with pagination, sorting, and counting
  const query = supabase
    .from("trips")
    .select("*", { count: "exact" })
    .order(sortColumn, { ascending: sortDirection === "asc" })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error listing trips:", error);
    throw new Error(`Failed to list trips: ${error.message}`);
  }

  // Map database records to TripDto (exclude user_id)
  const trips: TripDto[] = (data || []).map((trip) => ({
    id: trip.id,
    name: trip.name,
    description: trip.description,
    map_url: trip.map_url,
    trip_date: trip.trip_date,
    created_at: trip.created_at,
    updated_at: trip.updated_at,
  }));

  // Calculate pagination metadata
  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const response: ListTripsResponseDto = {
    data: trips,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
    },
  };

  return response;
}
```

### 9.4 Implementacja API Route

**Plik**: `src/pages/api/trips/index.ts`

Dodać handler `GET` do istniejącego pliku:

```typescript
/**
 * GET /api/trips
 * Retrieves a paginated and sorted list of trips
 *
 * Query parameters:
 * - page: number (optional, default: 1, min: 1)
 * - limit: number (optional, default: 20, min: 1, max: 100)
 * - sort: string (optional, default: "-created_at", allowed: name, -name, trip_date, -trip_date, created_at, -created_at)
 *
 * Responses:
 * - 200: List of trips with pagination metadata
 * - 400: Validation error (invalid query parameters)
 * - 500: Internal server error
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Parse query parameters from URL
    const searchParams = url.searchParams;
    const queryParams = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      sort: searchParams.get("sort") || undefined,
    };

    // Validate query parameters with Zod
    let validatedParams;
    try {
      validatedParams = listTripsQuerySchema.parse(queryParams);
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

    // Parse sort parameter to extract column and direction
    const sortParam = validatedParams.sort;
    const sortDirection = sortParam.startsWith("-") ? "desc" : "asc";
    const sortColumn = sortParam.startsWith("-") ? sortParam.slice(1) : sortParam;

    // Prepare parameters for service
    const params: ListTripsParams = {
      page: validatedParams.page,
      limit: validatedParams.limit,
      sortColumn,
      sortDirection,
    };

    // Call service to list trips
    const response = await listTrips(params, locals.supabase);

    // Return success response
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/trips:", error);

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

### 9.5 Aktualizacja importów

W pliku `src/pages/api/trips/index.ts` dodać importy:

```typescript
import { listTripsQuerySchema } from "../../../lib/schemas/tripSchema";
import { listTrips } from "../../../lib/services/tripService";
import type { ListTripsParams, ListTripsResponseDto } from "../../../types";
```

W pliku `src/types.ts` dodać (jeśli jeszcze nie istnieje):

```typescript
export interface ListTripsParams {
  page: number;
  limit: number;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}
```

## 10. Testowanie

### 10.1 Testy manualne

Sprawdzić działanie endpointu używając narzędzi typu:

- Postman
- curl
- Thunder Client (VS Code extension)

Przykładowe testy:

```bash
# Test 1: Podstawowe zapytanie
curl http://localhost:4321/api/trips

# Test 2: Paginacja
curl "http://localhost:4321/api/trips?page=2&limit=5"

# Test 3: Sortowanie rosnąco po nazwie
curl "http://localhost:4321/api/trips?sort=name"

# Test 4: Sortowanie malejąco po dacie
curl "http://localhost:4321/api/trips?sort=-trip_date"

# Test 5: Nieprawidłowy limit
curl "http://localhost:4321/api/trips?limit=150"

# Test 6: Nieprawidłowa strona
curl "http://localhost:4321/api/trips?page=0"

# Test 7: Nieprawidłowy sort
curl "http://localhost:4321/api/trips?sort=invalid_field"
```

### 10.2 Oczekiwane rezultaty

- Test 1: 200 OK, lista tras z domyślną paginacją (page=1, limit=20, sort=-created_at)
- Test 2: 200 OK, druga strona z 5 elementami
- Test 3: 200 OK, trasy posortowane alfabetycznie po nazwie
- Test 4: 200 OK, trasy posortowane od najnowszej do najstarszej daty
- Test 5: 400 Bad Request, komunikat "Limit must be between 1 and 100"
- Test 6: 400 Bad Request, komunikat "Page must be a positive number"
- Test 7: 400 Bad Request, komunikat o nieprawidłowym parametrze sort

## 11. Potencjalne problemy i rozwiązania

| Problem                                     | Rozwiązanie                                                     |
| ------------------------------------------- | --------------------------------------------------------------- |
| Wolne zapytania przy dużej liczbie rekordów | Dodać indeksy na kolumny `created_at`, `trip_date`, `name`      |
| Brak tras w bazie danych                    | Zwrócić pustą tablicę z total=0, nie błąd                       |
| Parametry zapytania z nieprawidłowym typem  | Zod transformuje stringi na liczby, waliduje poprawność         |
| Sortowanie po null wartościach              | PostgreSQL/Supabase domyślnie sortuje NULL jako ostatnie (DESC) |

## 12. Przyszłe ulepszenia

- **Filtrowanie**: dodać parametry `search` (wyszukiwanie w name/description), `from_date`, `to_date`
- **Uwierzytelnianie**: filtrować trasy po `user_id` z JWT tokena
- **Cache'owanie**: implementować cache dla często używanych kombinacji parametrów
- **Compression**: włączyć gzip dla odpowiedzi JSON
- **Obsługa cursor-based pagination**: dla lepszej wydajności przy dużych zbiorach danych
