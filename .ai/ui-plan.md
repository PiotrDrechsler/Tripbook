# Architektura UI dla Tripbook

## 1. Przegląd struktury UI

Aplikacja składa się z dwóch głównych trybów:

- Ekrany uwierzytelniania (logowanie i rejestracja)
- Chroniona przestrzeń aplikacji (SPA) z widokami listy tras, szczegółów trasy oraz formularzami dodawania/edycji w modalach lub panelach.

## 2. Lista widoków

### 2.1 Widok logowania

- Ścieżka: `/login`
- Cel: uwierzytelnienie użytkownika
- Kluczowe informacje: pola email, hasło; przycisk „Zaloguj”; link do rejestracji
- Kluczowe komponenty: `FormField`, `Button`, `Toast`/`AlertDialog` dla błędów
- UX/Dostępność: autofocus na email, aria-label, logiczny tab-order, walidacja HTML5, komunikaty po polsku
- Bezpieczeństwo: przesyłanie danych po HTTPS, ograniczenie prób logowania

### 2.2 Widok rejestracji

- Ścieżka: `/register`
- Cel: założenie konta użytkownika
- Kluczowe informacje: pola email, hasło; przycisk „Zarejestruj się”
- Komponenty i UX analogiczne do logowania

### 2.3 Widok listy tras

- Ścieżka: `/trips`
- Cel: prezentacja wszystkich tras użytkownika
- Kluczowe informacje: lista nazw tras i dat utworzenia; przycisk „Dodaj trasę”
- Kluczowe komponenty: `EmptyState`, `Spinner`, `Pagination`, `TripListItem`
- UX/Dostępność: ładowanie danych z SWR/React Query, lazy loading stron, aria-live dla aktualizacji listy
- Bezpieczeństwo: ochrona routingu przez middleware po zalogowaniu

### 2.4 Widok szczegółów trasy

- Ścieżka: `/trips/[id]`
- Cel: wyświetlenie szczegółowych informacji o trasie
- Kluczowe informacje: nazwa, opis, data wycieczki, przycisk „Otwórz mapę” (link z target="\_blank"), przyciski „Edytuj” i „Usuń”
- Komponenty: `MapPreview` (lazy-loaded), `Button`, `AlertDialog` dla potwierdzenia usunięcia
- UX/Dostępność: aria-describedby opis, obsługa stanu ładowania i błędów 404
- Bezpieczeństwo: walidacja ID w routingu, potwierdzenie przed usunięciem

### 2.5 Formularz dodawania/edycji trasy

- Tryb: modal lub panel boczny
- Cele: tworzenie nowej lub modyfikacja istniejącej trasy
- Kluczowe komponenty: `Dialog`, `FormField`, `DatePicker`, `Button`, `Toast` dla potwierdzeń
- UX/Dostępność: focus trap, aria-modal, real-time validation, wypełnianie pól przy edycji
- Bezpieczeństwo: walidacja map_url zawierającego "mapy.com" przed wysłaniem

### 2.6 Widok błędu/404

- Ścieżka: dynamiczna lub `/404`
- Cel: informowanie o nieznalezieniu zasobu lub błędzie aplikacji
- Komponenty: `EmptyState`, `Button` „Powrót”
- UX/Dostępność: czytelny komunikat, aria-live

### 2.7 Mapowanie User Stories

- US-001, US-002 → widoki logowania i rejestracji
- US-003 → modal tworzenia trasy
- US-004 → widok listy tras
- US-005 → widok szczegółów trasy
- US-006 → modal edycji trasy
- US-007 → potwierdzenie usunięcia w `AlertDialog`
- US-008 → przycisk „Wyloguj” w nagłówku
- US-009 → pełny przepływ E2E przez akcje CRUD

## 3. Mapa podróży użytkownika

1. Użytkownik otwiera `/login` lub `/register`.
2. Po uwierzytelnieniu przekierowanie na `/trips`.
3. Lista tras: może wybrać „Dodaj trasę” lub kliknąć istniejącą pozycję.
4. Wybór trasy otwiera `/trips/[id]` lub modal edycji.
5. Z poziomu szczegółów może edytować lub usuwać trasę.
6. Po operacji powrót do listy albo przekierowanie na listę.
7. Wylogowanie przenosi na `/login`.

## 4. Układ i struktura nawigacji

- Stały nagłówek po zalogowaniu: logo, przycisk „Dodaj trasę”, przycisk „Wyloguj”.
- Menu mobilne (hamburger) pokazuje linki do listy tras i ustawień.
- Breadcrumbs lub tok nawigacji (Lista → Szczegóły).

## 5. Kluczowe komponenty

- FormField: standaryzowane pola formularzy z walidacją
- Dialog: modal/panel do CRUD
- EmptyState: informowanie o braku danych
- Spinner: wskazanie ładowania
- Toast/AlertDialog: powiadomienia i potwierdzenia
- Pagination: nawigacja po stronach listy
- MapPreview: dynamiczne ładowanie mapy z mapy.com
- DatePicker: wybór daty wycieczki
- ThemeProvider i useTheme: zarządzanie motywem dark/light
