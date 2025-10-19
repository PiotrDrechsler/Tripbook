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
- `ListTripsParams` (do dodania w src/types.ts): parametry dla serwisu, pola: `page`, `limit`, `sortColumn`, `sortDirection`

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
4. Mapowanie parametrów na `ListTripsParams`
5. Wywołanie serwisu: `tripService.listTrips(params, locals.supabase)`
6. Serwis wykonuje zapytanie:
   - `supabase.from('trips').select('*', { count: 'exact' }).order(...).range(...)` - pobiera rekordy z liczeniem
   - Używa `count` do obliczenia `total_pages`
7. Mapowanie rekordów na `TripDto[]` (usunięcie `user_id`)
8. Utworzenie obiektu `ListTripsResponseDto` z danymi i metadanymi paginacji
9. Zwrócenie odpowiedzi JSON z kodem 200

## 6. Względy bezpieczeństwa

- Obecnie endpoint publiczny; w przyszłości wymaga nagłówka `Authorization: Bearer <token>` i filtrowania po `user_id`
- Walidacja parametrów zapytania zapobiega atakom SQL Injection
- Ograniczenie `limit` do maksymalnie 100 zapobiega przeciążeniu serwera
- Walidacja `sort` tylko do dozwolonych kolumn zapobiega ujawnieniu struktury bazy danych
- Unikać nadmiernego ujawniania wewnętrznych błędów (logować szczegóły, a klientowi zwracać ogólny `500`)

## 7. Obsługa błędów

| Kod | Warunek                                      | Format odpowiedzi                                                                       |
| --- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| 400 | `limit` poza zakresem 1-100                  | `{ error: "Validation error", message: "Parameter 'limit' must be between 1 and 100" }` |
| 400 | `page` < 1                                   | `{ error: "Validation error", message: "Page must be a positive number" }`              |
| 400 | nieprawidłowa wartość `sort`                 | `{ error: "Validation error", message: "Invalid sort parameter: ..." }`                 |
| 400 | nieprawidłowy typ parametru (np. page="abc") | `{ error: "Validation error", message: "Page must be a number" }`                       |
| 500 | Błąd serwera (np. awaria DB)                 | `{ error: "Internal Server Error", message: "An unexpected error occurred" }`           |

Dodatkowo logować wszystkie błędy za pomocą wbudowanego loggera (console.error lub Sentry).

## 8. Rozważania dotyczące wydajności

- Zapytanie z paginacją jest wydajne; upewnić się, że indeksy na kolumnach `created_at`, `trip_date`, `name` są poprawnie skonfigurowane
- Użycie `select('*', { count: 'exact' })` wykonuje jedno zapytanie z liczeniem
- Ograniczenie `limit` do 100 elementów zapobiega pobieraniu zbyt dużych zbiorów danych
- W przyszłości rozważyć cache'owanie dla często używanych kombinacji parametrów
- Minimalizacja serializacji/parsowania JSON po stronie serwera

## 9. Kroki implementacji

1. Utworzyć schemat walidacji w `src/lib/schemas/tripSchema.ts`:
   - zdefiniować `listTripsQuerySchema` z Zod
   - walidacja `page` (string → number, > 0)
   - walidacja `limit` (string → number, 1-100)
   - walidacja `sort` (dozwolone wartości: name, -name, trip_date, -trip_date, created_at, -created_at)
   - wyeksportować typ `ListTripsQueryInput`

2. Rozszerzyć typy w `src/types.ts`:
   - dodać interfejs `ListTripsParams` z polami: `page`, `limit`, `sortColumn`, `sortDirection`
   - typy `ListTripsResponseDto` i `PaginationDto` już istnieją

3. Rozszerzyć serwis `src/lib/services/tripService.ts`:
   - zaimplementować `async function listTrips(params: ListTripsParams, supabase: SupabaseClient): Promise<ListTripsResponseDto>`
   - obliczyć offset: `(page - 1) * limit`
   - wykonać zapytanie z `.select('*', { count: 'exact' }).order(...).range(...)`
   - zmapować rekordy na `TripDto[]` (usunąć `user_id`)
   - obliczyć `total_pages`: `Math.ceil(total / limit)`
   - zwrócić `ListTripsResponseDto`

4. Rozszerzyć Astro API route `src/pages/api/trips/index.ts`:
   - dodać handler `export async function GET({ url, locals })`
   - parsować parametry zapytania z `url.searchParams`
   - walidować za pomocą `listTripsQuerySchema`
   - parsować `sort` na `sortColumn` i `sortDirection`
   - zmapować na `ListTripsParams`
   - wywołać `listTrips(params, locals.supabase)`
   - zwrócić odpowiedź JSON z kodem 200

5. Dodać obsługę błędów:
   - obsłużyć wyjątki Zod (zwrócić 400 z `ErrorResponseDto`)
   - obsłużyć błędy Supabase (logować i zwrócić 500)
   - upewnić się, że wszystkie błędy są w formacie `ErrorResponseDto`

6. Przeprowadzić testy manualne:
   - sprawdzić podstawowe zapytanie bez parametrów
   - sprawdzić paginację (page=2, limit=10)
   - sprawdzić sortowanie (sort=name, sort=-trip_date)
   - sprawdzić błędy walidacji (limit=150, page=0, sort=invalid)
   - sprawdzić pustą listę (gdy brak tras w bazie)

7. Przeprowadzić code review i ewentualną poprawę bezpieczeństwa oraz lint
