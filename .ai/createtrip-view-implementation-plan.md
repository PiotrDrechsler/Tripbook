# Plan implementacji widoku Tworzenie wycieczki

## 1. Przegląd

Widok umożliwia użytkownikowi dodanie nowej wycieczki do kolekcji poprzez formularz otwierany w modalu (lub panelu bocznym). Formularz waliduje dane lokalnie i zdalnie, a po sukcesie zamyka modal, pokazuje alert i odświeża listę tras.

## 2. Routing widoku

Widok jest częścią strony `/trips`. Formularz uruchamiany jest z przycisku „Dodaj trasę” widocznego w komponencie nagłówka na stronie `/trips`.

## 3. Struktura komponentów

- TripsPage (`src/pages/trips.astro`)
  - Header
    - AddTripButton
  - CreateTripModal
    - CreateTripForm
  - TripsListContainer

## 4. Szczegóły komponentów

### AddTripButton

- Opis: Przycisk w nagłówku strony `/trips` otwierający modal.
- Elementy:
  - `<Button>` z ikoną i tekstem „Dodaj trasę”.
- Zdarzenia:
  - onClick → ustawia `isModalOpen = true`.
- Propsy:
  - `onOpen: () => void`.

### CreateTripModal

- Opis: Kontener modal/panel boczny z trapem focus i aria-modal.
- Elementy:
  - `<Dialog>` z shadcn/ui, fokusowany na pierwszym elemencie.
  - Dziecko: `<CreateTripForm>`.
- Zdarzenia:
  - zamknięcie modalu (przycisk Anuluj lub po sukcesie) → `onClose`.
- Propsy:
  - `isOpen: boolean`, `onClose: () => void`.

### CreateTripForm

- Opis: Formularz pól do tworzenia wycieczki.
- Główne elementy:
  - Label + Input name (required, maxLength=100)
  - Label + Textarea description (optional, maxLength=2000)
  - Label + Input map_url (required, pattern `/mapy\.com/`)
  - Label + Input date trip_date (optional)
  - Akcje: Button[type=submit], Button „Anuluj”
- Zdarzenia:
  - onChange → aktualizuje `formData`, usuwa błąd pola
  - onSubmit → wywołuje `createTrip(formData)`
  - onCancel → `onClose()`
- Walidacja lokalna:
  - HTML5 `required`, `maxLength`
  - pattern dla map_url
- Propsy:
  - `onSubmit: (data: CreateTripInput) => Promise<TripDto>`
  - `onClose: () => void`
- Typy:
  - DTO request: `CreateTripInput`
  - DTO response: `TripDto`

## 5. Typy

```ts
type CreateTripInput = {
  name: string;
  description?: string | null;
  map_url: string;
  trip_date?: string | null;
};

interface TripDto {
  id: string;
  name: string;
  description: string | null;
  map_url: string;
  trip_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ErrorResponseDto {
  error: string;
  message: string;
  field?: string;
}
```

## 6. Zarządzanie stanem

- Lokalny stan w `CreateTripModal` / `CreateTripForm`:
  - `isSubmitting: boolean`
  - `formData: CreateTripInput`
  - `errors: Record<string,string>`
  - `generalError: string | null`
- Globalny stan:
  - `isModalOpen: boolean` w komponencie nadrzędnym (TripsPage)
- Custom hook (opcjonalnie): `useCreateTrip()` zwracający funkcję `mutate` i stany `isLoading`, `error`.

## 7. Integracja API

- Endpoint: POST `/api/trips`
- Request headers: `{ "Content-Type":"application/json" }`
- Body: JSON.stringify(CreateTripInput)
- Oczekiwany kod 201 + JSON TripDto
- Błędy 400/422: JSON ErrorResponseDto
- Implementacja:
  ```ts
  const response = await fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!response.ok) {
    const err: ErrorResponseDto = await response.json();
    // obsługa err.field / err.message
  }
  const trip: TripDto = await response.json();
  ```

## 8. Interakcje użytkownika

1. Klik „Dodaj trasę” → otwarcie modalu, focus na polu `name`.
2. Wpisywanie danych → czyszczenie błędów przy zmianie.
3. Klik „Zapisz” → walidacja lokalna HTML5 + pattern.
4. Wysłanie żądania:
   - Błędy → pola opcjonalne lub globalny alert.
   - Sukces → `alert('Wycieczka zapisana')`, `onClose()`, odśwież listę.

## 9. Warunki i walidacja

- name: niepusty, max 100
- description: max 2000
- map_url: niepusty, zawiera `mapy.com`
- trip_date: jeśli podany, valid ISO date
- Serwer dodatkowo waliduje zod-em, zwraca `field` przy błędach w JSON.

## 10. Obsługa błędów

- ValidationError (field) → wyświetlenie komunikatu pod polem.
- Błąd ogólny (network, 500) → box na górze formularza.
- Po sukcesie → natywny `alert()`.

## 11. Kroki implementacji

1. W `src/components/trips/TripsListContainer.tsx` dodać stan `isCreateModalOpen` i przycisk `AddTripButton`.
2. Stworzyć `AddTripButton.tsx` w `src/components/trips/`.
3. Stworzyć `CreateTripModal.tsx` w `src/components/trips/` importując shadcn/ui `Dialog`.
4. Stworzyć `CreateTripForm.tsx` w `src/components/trips/` na wzór `TripEditForm.tsx`:
   - Dostosować formData, fetch POST i obsługę błędów.
5. Dodać walidację HTML5 (required, maxLength, pattern).
6. Obsłużyć `onSubmit` → `fetch('/api/trips', ...)`.
7. Po sukcesie: `alert()`, zamknięcie modal, odświeżenie listy (re-fetch lub page reload).
8. Dodać style Tailwind i dostępność (aria-modal, trap focus).
9. Przetestować UX: walidacja, błędy, sukces.
10. Uwzględnić responsywność (sm:, md:) i stan `isSubmitting`.
