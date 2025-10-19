# Plan implementacji widoku listy wycieczek (Trips View)

## 1. Przegląd

Widok listy wycieczek jest głównym interfejsem dla zalogowanego użytkownika. Jego celem jest wyświetlenie paginowanej listy wszystkich wycieczek dodanych przez użytkownika. Widok ten musi obsługiwać stany ładowania, błędu oraz pustej listy, a także umożliwiać nawigację między stronami wyników.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/trips`. Implementacja będzie wymagała utworzenia nowego pliku strony w Astro pod adresem `src/pages/trips.astro`.

## 3. Struktura komponentów

Hierarchia komponentów zostanie zorganizowana w następujący sposób, aby oddzielić logikę od prezentacji:

```
src/pages/trips.astro
└── TripsListContainer.tsx (client:load)
    ├── if (isLoading) <Spinner />
    ├── if (error) <ErrorMessage />
    ├── if (no trips) <EmptyState />
    └── if (has trips)
        ├── TripsList.tsx
        │   └── TripListItem.tsx (mapowany po tablicy wycieczek)
        └── Pagination.tsx
```

## 4. Szczegóły komponentów

### `TripsPage.astro`

- **Opis komponentu**: Plik strony Astro, który pełni rolę punktu wejściowego dla ścieżki `/trips`. Renderuje główny komponent React i przekazuje mu odpowiednie dyrektywy klienckie.
- **Główne elementy**: `Layout`, `<TripsListContainer client:load />`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: Brak.

### `TripsListContainer.tsx`

- **Opis komponentu**: Komponent-kontener, który zarządza stanem, logiką pobierania danych oraz warunkowym renderowaniem komponentów podrzędnych.
- **Główne elementy**: Logika `useTrips`, warunkowe renderowanie `<Spinner>`, `<EmptyState>`, `<TripsList>` i `<Pagination>`.
- **Obsługiwane interakcje**: Zmiana strony w komponencie `<Pagination>`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `ListTripsResponseDto`.
- **Propsy**: `onTripSelected: (tripId: string) => void;`.

### `TripsList.tsx`

- **Opis komponentu**: Komponent prezentacyjny, który otrzymuje listę wycieczek i renderuje ją za pomocą komponentu `TripListItem`.
- **Główne elementy**: Mapowanie tablicy `TripDto[]` na komponenty `<TripListItem />`.
- **Obsługiwane interakcje**: Brak (przekazuje obsługę zdarzeń w dół).
- **Obsługiwana walidacja**: Brak.
- **Typy**: `TripDto[]`.
- **Propsy**: `trips: TripDto[]; onTripSelected: (tripId: string) => void;`.

### `TripListItem.tsx`

- **Opis komponentu**: Wyświetla informacje o pojedynczej wycieczce (nazwa, data utworzenia) i obsługuje kliknięcie elementu.
- **Główne elementy**: Elementy `<div>` lub komponent `Card` z `shadcn/ui` zawierający nazwę i sformatowaną datę.
- **Obsługiwane interakcje**: `onClick`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `TripDto`.
- **Propsy**: `trip: TripDto; onTripSelected: (tripId: string) => void;`.

### `Pagination.tsx`

- **Opis komponentu**: Umożliwia nawigację między stronami listy wycieczek.
- **Główne elementy**: Przyciski "Poprzednia", "Następna", numery stron. Może być zaimplementowany z użyciem komponentów `Pagination` z `shadcn/ui`.
- **Obsługiwane interakcje**: `onPageChange`.
- **Obsługiwana walidacja**: Zapobiega nawigacji do stron spoza zakresu (poniżej 1, powyżej `totalPages`).
- **Typy**: `PaginationDto`.
- **Propsy**: `pagination: PaginationDto; onPageChange: (page: number) => void;`.

## 5. Typy

Implementacja będzie bazować na istniejących typach DTO zdefiniowanych w `src/types.ts`. Nie ma potrzeby tworzenia nowych typów ViewModel.

- **`ListTripsResponseDto`**: Główny typ odpowiedzi z API.
  - `data: TripDto[]`: Tablica obiektów wycieczek.
  - `pagination: PaginationDto`: Obiekt z metadanymi paginacji.
- **`TripDto`**: Obiekt transferu danych dla pojedynczej wycieczki.
  - `id: string`
  - `name: string`
  - `created_at: string` (format ISO 8601, wymaga sformatowania do wyświetlenia).
  - ...pozostałe pola.
- **`PaginationDto`**: Metadane dotyczące paginacji.
  - `page: number`
  - `limit: number`
  - `total: number`
  - `total_pages: number`

## 6. Zarządzanie stanem

Stan będzie zarządzany lokalnie w komponencie `TripsListContainer.tsx` przy użyciu hooków React. Zostanie stworzony dedykowany custom hook `useTrips` do enkapsulacji logiki pobierania danych.

- **Hook `useTrips`**:
  - **Cel**: Pobieranie danych z endpointu `/api/trips`.
  - **Argumenty**: `queryParams: { page: number; limit: number; sort: string; }`.
  - **Zwraca**: `{ data: ListTripsResponseDto | null, isLoading: boolean, error: Error | null }`.
  - **Logika**: Wykorzystuje `useEffect` do ponownego pobierania danych, gdy `queryParams` ulegną zmianie.
- **Stan w `TripsListContainer`**:
  - `queryParams`: Przechowuje aktualne parametry (`page`, `limit`, `sort`) i jest przekazywany do hooka `useTrips`. Zmiana tego stanu (np. przez komponent `Pagination`) inicjuje ponowne pobranie danych.

## 7. Integracja API

Integracja z API będzie realizowana poprzez wywołania `fetch` do endpointu `GET /api/trips` wewnątrz hooka `useTrips`.

- **Endpoint**: `GET /api/trips`
- **Parametry zapytania**: `page`, `limit`, `sort`. Zostaną one dynamicznie dodane do URL na podstawie stanu `queryParams`.
- **Typy żądania**: Parametry zapytania są zgodne z `ListTripsParams` z `src/types.ts`.
- **Typy odpowiedzi**: Oczekiwana odpowiedź ma strukturę `ListTripsResponseDto`.

## 8. Interakcje użytkownika

- **Wyświetlenie strony**: Po załadowaniu komponentu `TripsListContainer`, automatycznie uruchamiane jest zapytanie o pierwszą stronę wycieczek. W trakcie ładowania wyświetlany jest `Spinner`.
- **Zmiana strony**: Użytkownik klika na przycisk w komponencie `Pagination`. Wywoływana jest funkcja `onPageChange` z nowym numerem strony, co aktualizuje stan `queryParams` w `TripsListContainer` i inicjuje pobranie nowej partii danych.
- **Wybór wycieczki**: Użytkownik klika na element `TripListItem`. Wywoływana jest funkcja `onTripSelected` z ID wybranej wycieczki, co pozwala komponentowi nadrzędnemu na dalsze działania (np. otwarcie panelu bocznego).

## 9. Warunki i walidacja

Walidacja po stronie frontendu skupia się na zapewnieniu poprawności parametrów wysyłanych do API.

- **Paginacja**: Komponent `Pagination` będzie nieaktywny dla przycisków "Poprzednia" (na pierwszej stronie) i "Następna" (na ostatniej stronie), aby uniemożliwić wysyłanie zapytań o nieistniejące strony.
- **Sortowanie i limit**: Parametry `sort` i `limit` będą miały stałe, zakodowane na stałe wartości, co eliminuje potrzebę ich walidacji po stronie użytkownika.

## 10. Obsługa błędów

- **Błąd API lub sieci**: Jeśli wywołanie `fetch` w `useTrips` zakończy się niepowodzeniem, hook ustawi stan `error`. Komponent `TripsListContainer` wyświetli wtedy generyczny komunikat o błędzie, np. "Wystąpił błąd podczas ładowania wycieczek.".
- **Brak danych**: Jeśli API zwróci pustą tablicę `data`, `TripsListContainer` wykryje ten stan (`data.data.length === 0`) i wyrenderuje komponent `EmptyState` z komunikatem "Brak wycieczek".

## 11. Kroki implementacji

1.  **Utworzenie pliku strony**: Stwórz plik `src/pages/trips.astro` i dodaj podstawowy `Layout`.
2.  **Stworzenie komponentów szkieletowych**: Stwórz puste pliki `.tsx` dla: `TripsListContainer`, `TripsList`, `TripListItem`, `Pagination`, `Spinner`, `EmptyState` w katalogu `src/components/trips`.
3.  **Implementacja `useTrips` hook**: Stwórz plik `src/lib/hooks/useTrips.ts` i zaimplementuj w nim logikę pobierania danych, obsługę stanu ładowania, danych i błędów.
4.  **Implementacja `TripsListContainer`**: Zintegruj hook `useTrips`, dodaj zarządzanie stanem `queryParams` i zaimplementuj logikę warunkowego renderowania.
5.  **Implementacja komponentów prezentacyjnych**: Wypełnij logiką i stylami (Tailwind) komponenty `TripsList`, `TripListItem`, `Pagination`, `Spinner` i `EmptyState`, opierając się na propsach. Użyj komponentów `shadcn/ui` tam, gdzie to możliwe.
6.  **Sformatowanie daty**: W komponencie `TripListItem` użyj `Intl.DateTimeFormat` lub zewnętrznej biblioteki (np. `date-fns`) do sformatowania daty `created_at` do czytelnej postaci.
7.  **Połączenie całości**: Zaimportuj i wyrenderuj `<TripsListContainer client:load />` w `src/pages/trips.astro`, przekazując niezbędne propsy.
8.  **Stylowanie**: Dopracuj wygląd widoku za pomocą klas Tailwind, aby zapewnić spójność z resztą aplikacji.
