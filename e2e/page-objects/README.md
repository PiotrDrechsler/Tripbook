# Page Object Model (POM) - E2E Tests

## 📚 Struktura Page Objects

Wzorzec Page Object Model został zaimplementowany dla scenariusza dodawania nowej wycieczki zgodnie z najlepszymi praktykami Playwright.

### Hierarchia klas

```
BasePage (abstrakcyjna klasa bazowa)
├── HomePage - strona główna
└── TripsPage - lista wycieczek

CreateTripModal - modal tworzenia wycieczki (standalone)
```

## 🏗️ Klasy Page Objects

### 1. BasePage

**Plik:** `e2e/page-objects/BasePage.ts`

Abstrakcyjna klasa bazowa dla wszystkich Page Objects. Zapewnia wspólne metody:

- `goto(path: string)` - Nawigacja do ścieżki
- `getTitle()` - Pobranie tytułu strony
- `waitForPageLoad()` - Oczekiwanie na załadowanie strony

### 2. TripsPage

**Plik:** `e2e/page-objects/TripsPage.ts`

Reprezentuje stronę listy wycieczek (`/trips`).

#### Locatory:

- `pageTitle` - Tytuł "Moje wycieczki"
- `addTripButton` - Przycisk "Dodaj trasę" (`data-testid="add-trip-button"`)
- `tripsList` - Lista wycieczek
- `emptyState` - Stan pusty "Brak wycieczek"
- `sortByDateButton`, `sortByDistanceButton`, `sortByDurationButton` - Przyciski sortowania
- `paginationInfo`, `previousPageButton`, `nextPageButton` - Paginacja

#### Kluczowe metody:

- `goto()` - Przejście do `/trips`
- `clickAddTrip()` - Otworzenie modala tworzenia wycieczki
- `getTripByName(name)` - Znalezienie wycieczki po nazwie
- `selectTripByName(name)` - Kliknięcie na wycieczkę
- `sortByDate()`, `sortByDistance()`, `sortByDuration()` - Sortowanie
- `goToNextPage()`, `goToPreviousPage()` - Nawigacja stronami

### 3. CreateTripModal

**Plik:** `e2e/page-objects/CreateTripModal.ts`

Reprezentuje modal tworzenia nowej wycieczki.

#### Locatory formularza:

- `modal` - Kontener modala (`data-testid="create-trip-modal"`)
- `form` - Formularz (`data-testid="create-trip-form"`)
- `nameInput` - Pole nazwy (`data-testid="trip-name-input"`)
- `descriptionInput` - Pole opisu (`data-testid="trip-description-input"`)
- `mapUrlInput` - Pole linku mapy (`data-testid="trip-map-url-input"`)
- `dateInput` - Pole daty (`data-testid="trip-date-input"`)

#### Locatory walidacji:

- `nameError`, `descriptionError`, `mapUrlError`, `dateError` - Błędy pól
- `formError` - Ogólny błąd formularza (`data-testid="form-error"`)

#### Locatory stanu współrzędnych:

- `coordinatesLoading` - Ładowanie współrzędnych (`data-testid="coordinates-loading"`)
- `coordinatesError` - Błąd współrzędnych (`data-testid="coordinates-error"`)
- `coordinatesSuccess` - Sukces współrzędnych (`data-testid="coordinates-success"`)

#### Locatory akcji:

- `submitButton` - Przycisk "Zapisz" (`data-testid="submit-trip-button"`)
- `cancelButton` - Przycisk "Anuluj" (`data-testid="cancel-trip-button"`)
- `closeButton` - Przycisk X (zamknięcie)

#### Kluczowe metody:

**Podstawowe:**

- `waitForModal()` - Oczekiwanie na pojawienie się modala
- `isOpen()` - Sprawdzenie czy modal jest otwarty
- `close()`, `cancel()` - Zamknięcie modala
- `waitForClose()` - Oczekiwanie na zamknięcie

**Wypełnianie formularza:**

- `fillName(name)` - Wypełnienie nazwy
- `fillDescription(description)` - Wypełnienie opisu
- `fillMapUrl(url)` - Wypełnienie linku mapy
- `fillDate(date)` - Wypełnienie daty (format: YYYY-MM-DD)
- `submit()` - Wysłanie formularza

**Walidacja:**

- `hasNameError()`, `hasDescriptionError()`, etc. - Sprawdzenie błędów
- `getNameError()`, `getDescriptionError()`, etc. - Pobranie treści błędu

**Współrzędne:**

- `waitForCoordinatesSuccess()` - Oczekiwanie na ekstrakcję współrzędnych
- `isCoordinatesLoading()` - Sprawdzenie stanu ładowania
- `hasCoordinatesSuccess()` - Sprawdzenie sukcesu
- `hasCoordinatesError()` - Sprawdzenie błędu

**Wysokopoziomowe:**

- `createTrip(data)` - Wypełnienie i wysłanie całego formularza
- `fillWithInvalidData(data)` - Wypełnienie danymi do testów walidacji

## 🎯 Scenariusz testowy

### Krok po kroku: Dodawanie nowej wycieczki

```typescript
// 1. Inicjalizacja Page Objects
const tripsPage = new TripsPage(page);
const createTripModal = new CreateTripModal(page);

// 2. Przejście do strony wycieczek
await tripsPage.goto();

// 3. Kliknięcie "Dodaj trasę"
await tripsPage.clickAddTrip();

// 4. Wypełnienie formularza
await createTripModal.createTrip({
  name: "Wycieczka do Tatr",
  description: "Piękna wycieczka w góry",
  mapUrl: "https://mapy.cz/s/hokakucoto",
  date: "2025-12-15",
});

// 5. Weryfikacja sukcesu
await expect(tripsPage.getTripByName("Wycieczka do Tatr")).toBeVisible();
```

## 📝 Przykłady użycia

### Test 1: Podstawowe utworzenie wycieczki

```typescript
test("should create a new trip", async ({ page }) => {
  const tripsPage = new TripsPage(page);
  const modal = new CreateTripModal(page);

  await tripsPage.goto();
  await tripsPage.clickAddTrip();

  await modal.createTrip({
    name: "Test Trip",
    mapUrl: "https://mapy.cz/s/hokakucoto",
  });

  await modal.waitForClose();
  await expect(tripsPage.getTripByName("Test Trip")).toBeVisible();
});
```

### Test 2: Walidacja wymaganych pól

```typescript
test("should validate required fields", async ({ page }) => {
  const tripsPage = new TripsPage(page);
  const modal = new CreateTripModal(page);

  await tripsPage.goto();
  await tripsPage.clickAddTrip();

  await modal.submit(); // Bez wypełnienia pól

  await expect(modal.nameInput).toHaveAttribute("required");
  await expect(modal.mapUrlInput).toHaveAttribute("required");
});
```

### Test 3: Walidacja długości nazwy

```typescript
test("should validate name length", async ({ page }) => {
  const tripsPage = new TripsPage(page);
  const modal = new CreateTripModal(page);

  await tripsPage.goto();
  await tripsPage.clickAddTrip();

  await modal.fillName("A".repeat(101)); // Przekroczenie limitu
  await modal.fillMapUrl("https://mapy.cz/s/hokakucoto");
  await modal.submit();

  await expect(modal.nameError).toBeVisible();
  expect(await modal.getNameError()).toContain("100 znaków");
});
```

### Test 4: Ekstrakcja współrzędnych

```typescript
test("should extract coordinates from mapy.cz link", async ({ page }) => {
  const tripsPage = new TripsPage(page);
  const modal = new CreateTripModal(page);

  await tripsPage.goto();
  await tripsPage.clickAddTrip();

  await modal.fillName("Test");
  await modal.fillMapUrl("https://mapy.cz/s/hokakucoto");

  await modal.waitForCoordinatesSuccess();
  await expect(modal.coordinatesSuccess).toBeVisible();

  const successText = await modal.coordinatesSuccess.textContent();
  expect(successText).toContain("✓");
  expect(successText).toContain("Współrzędne:");
});
```

### Test 5: Zamykanie modala

```typescript
test("should close modal on cancel", async ({ page }) => {
  const tripsPage = new TripsPage(page);
  const modal = new CreateTripModal(page);

  await tripsPage.goto();
  await tripsPage.clickAddTrip();

  await modal.fillName("Test");
  await modal.cancel();

  await modal.waitForClose();
  await expect(modal.modal).not.toBeVisible();
});
```

## 🔍 Atrybuty data-testid

Wszystkie kluczowe elementy mają dedykowane atrybuty `data-testid`:

### Przyciski akcji:

- `add-trip-button` - Przycisk "Dodaj trasę"
- `submit-trip-button` - Przycisk "Zapisz"
- `cancel-trip-button` - Przycisk "Anuluj"

### Kontener:

- `create-trip-modal` - Modal
- `create-trip-form` - Formularz

### Pola formularza:

- `trip-name-input` - Nazwa wycieczki
- `trip-description-input` - Opis wycieczki
- `trip-map-url-input` - Link do mapy
- `trip-date-input` - Data wycieczki

### Błędy walidacji:

- `trip-name-error` - Błąd nazwy
- `trip-description-error` - Błąd opisu
- `trip-map-url-error` - Błąd linku
- `trip-date-error` - Błąd daty
- `form-error` - Ogólny błąd formularza

### Stany współrzędnych:

- `coordinates-loading` - Ładowanie
- `coordinates-error` - Błąd
- `coordinates-success` - Sukces

## 🚀 Uruchamianie testów

```bash
# Wszystkie testy E2E
npm run test:e2e

# Tylko testy tworzenia wycieczki
npx playwright test create-trip

# Z UI Playwright
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Konkretna przeglądarka
npx playwright test --project=chromium
```

## 📦 Eksportowanie

Wszystkie Page Objects są dostępne przez centralny punkt eksportu:

```typescript
import { TripsPage, CreateTripModal } from "./page-objects";
```

## 🎨 Najlepsze praktyki

1. **Enkapsulacja** - Locatory i logika interakcji w Page Objects
2. **Reużywalność** - Metody wysokopoziomowe (`createTrip()`)
3. **Czytelność** - Nazwy metod opisują akcje użytkownika
4. **Stabilność** - Używanie `data-testid` zamiast klas CSS
5. **Asynchroniczność** - Wszystkie metody z `async/await`
6. **Waity** - Wbudowane oczekiwanie w metodach Page Objects
7. **TypeScript** - Pełne typowanie dla bezpieczeństwa

## 🔧 Rozszerzanie

### Dodawanie nowych Page Objects:

1. Utwórz nową klasę rozszerzającą `BasePage`
2. Zdefiniuj locatory jako `readonly` właściwości
3. Dodaj metody reprezentujące akcje użytkownika
4. Eksportuj przez `e2e/page-objects/index.ts`

```typescript
export class NewPage extends BasePage {
  readonly someElement: Locator;

  constructor(page: Page) {
    super(page);
    this.someElement = page.getByTestId("some-element");
  }

  async performAction() {
    await this.someElement.click();
  }
}
```

## 📚 Dokumentacja dodatkowa

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Isolation](https://playwright.dev/docs/test-isolation)
