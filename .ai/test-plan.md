# Plan Testów dla projektu Tripbook

## 1. Wprowadzenie i cele testowania

Celem planu jest zweryfikowanie poprawności, niezawodności, bezpieczeństwa i wydajności aplikacji Tripbook. Testy obejmą zarówno warstwę frontend (Astro 5 + React 19 + Tailwind 4 + Shadcn/ui), backend (Astro API + Supabase + Zod), jak i integrację z zewnętrznymi usługami (Mapy.com, Google Routes API).

## 2. Zakres testów

- Autoryzacja i uwierzytelnianie (rejestracja, logowanie, wylogowanie, reset hasła)
- Ochrona tras i middleware Astro
- CRUD tras (tworzenie, edycja, usuwanie, odczyt)
- Ekstrakcja współrzędnych z linków Mapy.com i podgląd mapy
- Obliczanie tras przez Google Routes API, cache w localStorage, sortowanie
- Walidacja danych po stronie klienta i serwera (Zod)
- UI/UX oraz responsywność i dostępność komponentów Shadcn/ui
- Wydajność ładowania list tras i odpowiedzi API

## 3. Typy testów do przeprowadzenia

### Testy jednostkowe (Vitest + Testing Library)

- Funkcje pomocnicze (`coordinates.ts`, `utils.ts`)
- Schematy Zod (`authSchema.ts`, `tripSchema.ts`)
- Hooki Reactowe (`useTrips`, `useTrip`, `useMapyLink`, `useRouteInfo`)
- Komponenty React w izolacji (CreateTripForm, LoginForm, etc.)

### Testy integracyjne (Vitest + Docker)

- Endpointy API (`/api/auth/*`, `/api/expand-mapy-link`, `/api/routes`)
- Połączenie z Supabase (signUp, signIn, signOut, CRUD trips)
- Obsługa błędów i mapowanie statusów HTTP
- Middleware Astro (ochrona tras, przekierowania)

### Testy end-to-end (Playwright)

- Scenariusze użytkownika w przeglądarce (Chrome, Firefox, Safari):  
  – Rejestracja → potwierdzenie → logowanie → CRUD tras → logout  
  – Ekstrakcja Mapy.com → Route calculation → cache → sortowanie
- Multi-browser testing
- Visual regression (screenshoty)

### Testy API (Bruno + REST Client)

- Pliki `.http` w repozytorium jako dokumentacja żywych przykładów
- Kolekcje Bruno dla manualnych testów
- Automatyzacja przez Vitest dla CI/CD

### Testy bezpieczeństwa

- RLS w Supabase – próby dostępu do zasobów bez uprawnień
- Testy XSS/SQL-Injection na formularzach i endpointach
- Validacja tokenów i sesji
- Rate limiting (jeśli wdrożone)

### Testy wydajnościowe (Lighthouse CI)

- Czas ładowania listy tras przy 100+ rekordach
- Latencja wywołań `/api/routes` (<200 ms)
- Core Web Vitals (LCP, FID, CLS)
- Lighthouse audyty w każdym PR

### Testy dostępności (Axe + Pa11y)

- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader compatibility
- ARIA attributes validation

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Autoryzacja

1. Rejestracja z poprawnymi danymi → kod 201, redirect `/login?message=registration_success`
2. Rejestracja z istniejącym emailem → kod 409, komunikat „Użytkownik … istnieje”
3. Logowanie poprawne → kod 200, redirect `/trips`
4. Logowanie z błędnym hasłem → kod 401, komunikat „Nieprawidłowy email lub hasło”
5. Wylogowanie → kod 200, redirect `/login?message=logout_success`
6. Reset hasła:  
   • “Zapomniałem hasła” → mail z tokenem  
   • Reset z tokenem → kod 200, redirect `/login?message=password_reset_success`

### 4.2 Middleware i ochrona tras

1. Wejście na `/trips` bez sesji → redirect `/login?message=unauthorized`
2. Wejście na `/login` gdy zalogowany → redirect `/trips`

### 4.3 CRUD tras

1. Tworzenie trasy z poprawnymi danymi → nowy rekord w DB, przekierowanie/feedback
2. Walidacja pól formularza (nazwa, opis, link Mapy.com)
3. Edycja i usuwanie trasy → odpowiednie zapytania SQL i UI update
4. Obsługa pustej listy (komponent EmptyState)

### 4.4 Mapy.com Link & MapPreview

1. Wprowadzenie linku Mapy.com → wywołanie `/api/expand-mapy-link` → zwrócenie współrzędnych
2. Nieprawidłowy link → kod 400, komunikat błędu w UI
3. Render iframe w `MapPreview`, fallback do linku zewnętrznego

### 4.5 Google Routes API & Cache

1. Pozycja geolokalizacyjna dostępna → przycisk „Oblicz trasę” → wywołanie `/api/routes` → dane trasy
2. Błąd zewnętrznego API → status 5xx lub 429 → komunikat w UI
3. Cache w localStorage → odczyt przy odświeżeniu → wskaźnik „💾 Zapisano”
4. Sortowanie tras według odległości i czasu

## 5. Środowisko testowe

### Baza danych testowa

```yaml
# docker-compose.test.yml
services:
  supabase-test:
    image: supabase/postgres:15
    environment:
      POSTGRES_PASSWORD: test
      POSTGRES_DB: tripbook_test
    ports:
      - "54322:5432"
```

### Mockowanie zewnętrznych API

- **MSW (Mock Service Worker)** – mockowanie Mapy.com i Google Routes API
- **Vitest mocks** – mockowanie Supabase w testach jednostkowych

### Zmienne środowiskowe

- `.env.test` – zmienne dla testów integracyjnych
- `.env.e2e` – zmienne dla testów E2E Playwright
- `.env.local` – lokalne overridy (nie commitować)

## 6. Narzędzia do testowania

### Testy jednostkowe i integracyjne

- **Vitest** + **Testing Library** (React) – najlepszy wybór dla Astro/Vite, szybki, ESM-first
- **@supabase/supabase-js** + **Docker Compose** – izolowana baza testowa

### Testy E2E

- **Playwright** – najlepsze narzędzie E2E w 2025, multi-browser, auto-waiting, świetna integracja z CI

### Testy API

- **Bruno** – open-source, file-based, Git-friendly (zamiennik Postman)
- **REST Client VSCode** – pliki `.http` w repozytorium jako dokumentacja i testy
- **MSW (Mock Service Worker)** – mockowanie zewnętrznych API w testach

### Jakość kodu

- **ESLint** – już skonfigurowany, sprawdza TypeScript + React + Astro
- **Prettier** + **prettier-plugin-tailwindcss** – formatowanie i sortowanie klas Tailwind

### Performance

- **Lighthouse CI** – automatyczne audyty w GitHub Actions
- **Unlighthouse** – skanowanie całej strony, raporty HTML z trendami

### Accessibility

- **@axe-core/playwright** – testy WCAG w ramach E2E
- **Pa11y CI** – automatyczne audyty dostępności w CI

### Visual Regression (opcjonalnie)

- **Chromatic** – automatyczne screenshoty i visual diff w PR

## 7. Harmonogram testów

| Faza                    | Zakres                                 | Czas     |
| ----------------------- | -------------------------------------- | -------- |
| Konfiguracja środowiska | Docker, Vitest, Playwright, Bruno      | 1 dzień  |
| Testy jednostkowe       | Hooki, utilsy, schematy, komponenty    | 2 dni    |
| Testy integracyjne      | API + Supabase + middleware            | 2 dni    |
| Testy E2E               | Scenariusze użytkownika, multi-browser | 3 dni    |
| Testy bezpieczeństwa    | RLS, XSS, SQLi, session validation     | 1 dzień  |
| Testy wydajnościowe     | Lighthouse CI + Unlighthouse           | 1 dzień  |
| Testy dostępności       | Axe + Pa11y, WCAG compliance           | 1 dzień  |
| Visual regression       | Chromatic setup (opcjonalnie)          | 0.5 dnia |
| Raport i poprawki       | Weryfikacja wyników, dokumentacja      | 1–2 dni  |

**Łącznie:** ~11-13 dni

## 8. Kryteria akceptacji testów

- ≥ 90% pokrycia jednostkowego dla krytycznych modułów (hooki, serwisy, utils)
- 100% zielonych scenariuszy E2E w CI dla wszystkich przeglądarek (Chrome, Firefox, Safari)
- Brak krytycznych błędów po testach bezpieczeństwa (XSS, SQLi, RLS)
- Czas ładowania kluczowych stron < 2s (LCP < 2.5s)
- API response time < 200ms dla 95% percentyla
- Lighthouse score > 90 dla Performance, Accessibility, Best Practices
- WCAG 2.1 Level AA compliance (100% testów Axe przechodzi)
- Zero visual regressions w PR (jeśli Chromatic włączone)

## 9. Role i odpowiedzialności

- **QA Engineer**: projektowanie i wykonanie testów, raportowanie
- **Developer**: utrzymanie i aktualizacja testów jednostkowych/integracyjnych
- **DevOps**: konfiguracja środowisk testowych, CI/CD
- **Product Owner**: akceptacja wyników, priorytety bugów

## 10. Procedury raportowania błędów

- **GitHub Issues**: template z krokami, zrzutami ekranu, oczekiwanym vs. rzeczywistym
- **Severity**: blocker, krytyczny, wysoki, średni, niski
- **Workflow**:
  1. QA zgłasza issue z labelem `bug`
  2. Przypisanie do developera
  3. Developer tworzy branch `fix/issue-XXX`
  4. Weryfikacja poprawki przez QA
  5. Zamknięcie issue po merge

---

## 11. Uzasadnienie wyboru technologii

### Dlaczego Vitest zamiast Jest?

- ✅ **20x szybszy** dzięki Vite
- ✅ **ESM-first** – zgodne z Astro 5
- ✅ **Zero config** dla projektów TypeScript + Vite
- ✅ API kompatybilne z Jest (łatwa migracja wiedzy)

### Dlaczego Playwright zamiast Cypress?

- ✅ **Multi-browser out-of-the-box** (Chrome, Firefox, Safari, Edge)
- ✅ **Szybsze i stabilniejsze** auto-waiting
- ✅ **Lepsza obsługa iframe** (kluczowe dla Mapy.com)
- ✅ **Trace viewer** i video recording wbudowane
- ✅ **Microsoft Support** – aktywny rozwój

### Dlaczego Bruno zamiast Postman?

- ✅ **Git-friendly** – kolekcje w plain text
- ✅ **Open-source** – bez chmury, bez vendor lock-in
- ✅ **Lekki** – nie wymaga desktop app
- ✅ **Privacy-first** – wszystko lokalnie

### Dlaczego REST Client VSCode?

- ✅ **Pliki `.http` w repo** – dokumentacja jako kod
- ✅ **Szybkie testowanie** bez opuszczania IDE
- ✅ **Wsparcie zmiennych** i environments
- ✅ **Zero dependencies**

---

## 12. Przykłady konfiguracji

### Vitest Config (`vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "test/", "dist/"],
    },
  },
});
```

### Playwright Config (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
});
```

### REST Client Example (`test/api/auth.http`)

```http
### Variables
@baseUrl = http://localhost:4321
@email = test@tripbook.pl
@password = test123456

### Register
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}",
  "confirmPassword": "{{password}}"
}

### Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}"
}

### Get Trips
GET {{baseUrl}}/api/trips
```

### Docker Compose Test DB (`docker-compose.test.yml`)

```yaml
version: "3.8"
services:
  postgres-test:
    image: supabase/postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: test
      POSTGRES_DB: tripbook_test
    ports:
      - "54322:5432"
    volumes:
      - ./supabase/migrations:/docker-entrypoint-initdb.d
```

### GitHub Action Lighthouse CI (`.github/workflows/lighthouse.yml`)

```yaml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

---

## 13. Instalacja narzędzi testowych

```bash
# Testy jednostkowe i integracyjne
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom

# Testy E2E
npm install -D @playwright/test

# Testy API
npm install -D msw

# Accessibility
npm install -D @axe-core/playwright pa11y-ci

# Performance
npm install -D @lhci/cli unlighthouse

# Prettier + Tailwind
npm install -D prettier-plugin-tailwindcss
```

---

## 14. Struktura katalogów testowych

```
tripbook/
├── test/
│   ├── setup.ts                    # Vitest setup
│   ├── unit/
│   │   ├── utils/
│   │   │   └── coordinates.test.ts
│   │   ├── hooks/
│   │   │   ├── useTrips.test.tsx
│   │   │   └── useRouteInfo.test.tsx
│   │   └── schemas/
│   │       └── authSchema.test.ts
│   ├── integration/
│   │   ├── api/
│   │   │   ├── auth.test.ts
│   │   │   └── trips.test.ts
│   │   └── middleware.test.ts
│   └── fixtures/
│       ├── trips.json
│       └── users.json
├── e2e/
│   ├── auth.spec.ts
│   ├── trips.spec.ts
│   └── routes.spec.ts
├── test-api/
│   ├── auth.http
│   ├── trips.http
│   └── routes.http
├── vitest.config.ts
├── playwright.config.ts
└── docker-compose.test.yml
```
