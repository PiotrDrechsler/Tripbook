1. Użycie języka polskiego jako jedynego języka UI dla MVP.
2. Formatowanie dat za pomocą `date-fns`/`luxon` z hookiem `useLocale` w Zustand.
3. Rezygnacja z testów komponentów w pierwszej fazie.
4. Dynamiczne ustawianie meta-tagów za pomocą `Astro.setHead`.
5. Lazy-load `MapPreview` przy użyciu `React.lazy` i `Suspense`.
6. Optymalizacja obrazów przez `@astrojs/image`.
7. Konfiguracja SWR/React Query z retry, timeout i feedbackiem użytkownika.
8. Brak wdrożenia zaawansowanego logowania błędów (Sentry) w tej fazie.
9. Rezygnacja ze wsparcia PWA w MVP.
10. Dodanie `ThemeProvider` i hooka `useTheme` w Zustand, synchronizacja motywu dark mode klasą na `html`.
11. Struktura routingu w `src/pages`: `/login`, `/trips`, `/trips/[id]`, modal/panel dla formularza.
12. Zarządzanie stanem globalnym w Zustand (`user`, `trips`, `selectedTripId`).
13. Fetchowanie danych i cache SWR z paginacją i prefetch.
14. Komponenty Shadcn/ui: `FormField`, `Dialog`, `EmptyState`, `AlertDialog`, `Spinner`, `Toast`, `Pagination`.
15. Responsywność Tailwind: `grid-cols-1 md:grid-cols-2`.
16. ARIA i dostępność: `aria-label`, logiczny tab-order, kontrasty.
17. Dynamiczne heady przez `Astro.setHead`.
18. Lazy-loading `MapPreview`.
19. Optymalizacja obrazów `@astrojs/image`.
20. Dark mode z Tailwind `dark` → class i Zustand.

    W oparciu o PRD, tech stack i plan API zaplanowano następującą architekturę UI: Aplikacja będzie korzystać z Astro/React z routingiem plikowym w `src/pages`. Kluczowe widoki to: ekran logowania (`/login`), lista tripów (`/trips`), szczegóły tripu (`/trips/[id]`) oraz modal/panel dodawania lub edycji tripu. Nawigacja oparta na linkach Astro umożliwi łatwe przejście między tymi ekranami.

Stan aplikacji będzie zarządzany w globalnym store Zustand, zawierającym dane użytkownika, listę tripów i wybrany trip ID. Dane z API będą pobierane z użyciem SWR lub React Query, z paginacją, retry i timeout oraz prefetchingiem kolejnych zestawów danych, a stany ładowania i błędów obsłużą komponenty Shadcn/ui (`Spinner`, `Toast`, `AlertDialog`).

Formularze tworzenia i edycji będą zbudowane z użyciem `FormField` i `Dialog` Shadcn/ui oraz React Hook Form z walidacją w czasie rzeczywistym. Podgląd mapy zostanie wyrenderowany w komponencie `MapPreview` ładowanym lazy przez `React.lazy` i `Suspense` po weryfikacji URL.

Responsywność zapewni Tailwind z `grid-cols-1 md:grid-cols-2` dla listy i panelu, a dostępność zostanie osiągnięta przez ARIA, logiczny tab-order i wysoki kontrast kolorów. Obrazy i ilustracje zoptymalizuje `@astrojs/image`.

Dark mode będzie konfigurowany w `tailwind.config.js` (dark → class) oraz zarządzany przez `ThemeProvider` i hook `useTheme` w Zustand, przełączany przez toggle w nagłówku.

- Szczegóły UI ekranów rejestracji i logowania (pola, walidacja, UX) wymagają doprecyzowania.
- Mechanizmy autoryzacji UI (redirect, ochrona rout) zostaną zaimplementowane w kolejnej iteracji.
