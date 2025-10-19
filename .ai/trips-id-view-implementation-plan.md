# Plan implementacji widoku Szczegóły trasy

## 1. Przegląd

Widok Szczegóły trasy umożliwia użytkownikowi podgląd pełnych informacji o wybranej trasie: nazwy, opisu, daty wycieczki oraz interaktywny link do mapy. Dodatkowo oferuje przyciski do edycji i usunięcia trasy.

## 2. Routing widoku

- Ścieżka: `/trips/[id]` (dynamiczna strona Astro w `src/pages/trips/[id].astro`).

## 3. Struktura komponentów

- Layout (stały nagłówek)
  - TripDetailsPage (plik Astro)
    - TripDetailsContainer (React)
      - Spinner / ErrorMessage / NotFound
      - TripDetailsView (React)
        - MapPreview (lazy-loaded)
        - Button „Otwórz mapę”
        - Button „Edytuj”
        - ConfirmDialog „Usuń”

## 4. Szczegóły komponentów

### TripDetailsPage

- Opis: Strona Astro ładuje React Island i przekazuje `id` z URL.
- Główne elementy: `<TripDetailsContainer id={params.id} />`.

### TripDetailsContainer

- Opis: Hook `useTrip(id)` do fetchowania danych i zarządzania stanami.
- Elementy:
  - Spinner (gdy loading)
  - ErrorMessage (gdy error)
  - NotFound (gdy data === null)
  - TripDetailsView (gdy data załadowana)
- Zdarzenia: inicjalizacja fetch, obsługa retry.
- Walidacja: wstępna walidacja `id` UUID (z routera).

### TripDetailsView

- Opis: Prezentuje dane trasy.
- Główne elementy:
  - `<h1>`: nazwa trasy
  - `<p>`: opis (lub tekst „Brak opisu”)
  - `<time>`: sformatowana data (`displayDate`)
  - `<Button as="a" href={map_url} target="_blank">Otwórz mapę</Button>`
  - `<Button variant="secondary" onClick={onEdit}>Edytuj</Button>`
  - `<Button variant="destructive" onClick={openDeleteDialog}>Usuń</Button>`
  - `<ConfirmDialog>` do potwierdzenia usunięcia
- Zdarzenia:
  - onEdit → nawigacja do `/trips/[id]/edit`
  - onDeleteConfirm → wywołanie DELETE, alert, redirect `/trips`
- Walidacja: brak dodatkowej, opiera się na walidacji backendu.
- Typy:
  - `TripViewModel` (z polami TripDto + `displayDate`)
- Propsy:
  - `trip: TripViewModel`
  - `onEdit: () => void`
  - `onDelete: () => Promise<void>`

### MapPreview

- Opis: Lazy-loaded podgląd mapy.
- Elementy: `<iframe>` lub `<MapComponent>` z map_url.
- Walidacja: map_url zawiera `mapy.com`.
- Propsy: `mapUrl: string`

## 5. Typy

```ts
interface TripViewModel {
  id: string;
  name: string;
  description: string | null;
  map_url: string;
  trip_date: string | null;
  created_at: string;
  updated_at: string;
  displayDate: string; // np. "DD.MM.YYYY"
}
```

Pozostałe używane typy: `TripDto`, `ErrorResponseDto`, `GetTripParams`.

## 6. Zarządzanie stanem

- Hook `useTrip(id: string)`:
  - `loading: boolean`
  - `data: TripViewModel | null`
  - `error: ErrorResponseDto | null`
- Lokalny stan `showDeleteDialog: boolean` w kontenerze.

## 7. Integracja API

- GET `/api/trips/${id}` → `useTrip`
  - Request params: `{ id }`
  - Response: `TripDto` → mapowanie na `TripViewModel` + formatowanie daty.
- DELETE `/api/trips/${id}` → `onDelete`
  - Po sukcesie: alert(`Wycieczka usunięta`), redirect `/trips`.

## 8. Interakcje użytkownika

- Wejście na stronę: spinner, następnie dane lub błąd.
- Kliknięcie „Otwórz mapę”: otwiera nową kartę z mapą.
- Kliknięcie „Edytuj”: nawigacja do edycji trasy.
- Kliknięcie „Usuń”: otwiera ConfirmDialog, potwierdzenie usuwa trasę i przekierowuje.

## 9. Warunki i walidacja

- `id` jest UUID: przy niepoprawnym id render 404.
- map_url zawiera „mapy.com”: przed przekazaniem do `<iframe>`.
- Brak opisu: wyświetlić „Brak opisu”.

## 10. Obsługa błędów

- 404 API → komponent NotFound (`EmptyState` z komunikatem).
- Błąd sieci → `ErrorMessage` z `error.message`.
- Błąd usunięcia → alert z komunikatem błędu.

## 11. Kroki implementacji

1. Utworzyć `src/pages/trips/[id].astro` ładowanie `TripDetailsContainer`.
2. Stworzyć hook `useTrip` w `src/lib/hooks/useTrip.ts` (fetch + typy).
3. Zaimplementować `TripDetailsContainer` z obsługą stanów.
4. Stworzyć komponent `TripDetailsView` wg specyfikacji.
5. Zaimplementować `MapPreview` lazy-loaded.
6. Dodać ConfirmDialog dla usunięcia.
7. Dodać formatowanie daty (`date-fns`).
8. Przetestować scenariusze: success, loading, 404, error.
9. Dodać test E2E dla ścieżki GET → render → delete.
10. Zweryfikować dostępność i responsywność.
