# 🏠 Zabezpieczenie Strony Głównej - Implementacja

## 📋 Wymagania (PRD US-001)

Strona główna `/` powinna działać następująco:

- **Dla niezalogowanych:** Wyświetlać panel z opcjami logowania i rejestracji
- **Dla zalogowanych:** Przekierować automatycznie do `/trips`

## ✅ Zaimplementowane Rozwiązanie

### **Podwójna Warstwa Zabezpieczeń**

Zgodnie z najlepszymi praktykami inżynierskimi, implementujemy **defense in depth** - dwie warstwy kontroli dostępu:

#### **Warstwa 1: Middleware (Globalny)**

**Plik:** `src/middleware/index.ts`

```typescript
// Lista tras tylko dla niezalogowanych (login, register, home)
const authRoutes = ["/login", "/register", "/"];
const isAuthRoute = authRoutes.some((route) => context.url.pathname === route);

// Jeśli trasa auth i użytkownik zalogowany → redirect do /trips
if (isAuthRoute && session) {
  return context.redirect("/trips");
}
```

**Zalety:**

- ✅ Centralne zarządzanie przekierowaniami
- ✅ Działa dla wszystkich tras w tablicy `authRoutes`
- ✅ Jeden punkt konfiguracji
- ✅ Uniwersalne podejście - łatwe dodawanie nowych tras

#### **Warstwa 2: Per-Page Check (Lokalny)**

**Plik:** `src/pages/index.astro`

```typescript
// Check if user is already logged in (provided by middleware)
const user = Astro.locals.user;

// If logged in, redirect to /trips (as per PRD US-001)
if (user) {
  return Astro.redirect("/trips");
}
```

**Zalety:**

- ✅ Dodatkowa warstwa bezpieczeństwa (defense in depth)
- ✅ Jawna intencja w kodzie strony
- ✅ Łatwiejsze debugowanie (można dodać logi na poziomie strony)
- ✅ Działa nawet jeśli middleware zostanie przypadkowo wyłączony

---

## 🔧 Wykorzystanie Supabase SSR Client

### **Uniwersalne Podejście**

Zgodnie z `src/db/supabase.client.ts` i najlepszymi praktykami:

1. **Middleware tworzy client dla każdego request:**

   ```typescript
   const supabase = createSupabaseServerClient(context.cookies);
   ```

2. **Automatyczne zarządzanie cookies:**
   - `@supabase/ssr` automatycznie obsługuje get/set/remove cookies
   - Tokens są bezpiecznie przechowywane z `httpOnly`, `secure`, `sameSite`

3. **Session dostępna w context.locals:**

   ```typescript
   context.locals.user = session?.user ?? null;
   context.locals.session = session;
   ```

4. **Strony używają danych z context.locals:**
   ```typescript
   const user = Astro.locals.user;
   ```

### **Dlaczego To Uniwersalne?**

✅ **Type-safe:** TypeScript zapewnia pełną type safety
✅ **DRY:** Nie duplikujemy logiki pobierania sesji
✅ **Consistent:** Wszystkie strony używają tego samego mechanizmu
✅ **Maintainable:** Jedna zmiana w middleware → działa wszędzie
✅ **Testable:** Łatwe do przetestowania (mock `Astro.locals`)

---

## 🧪 Testowanie

### **Test 1: Zalogowany Użytkownik**

**Kroki:**

1. Zaloguj się (test1@tripbook.pl)
2. Wpisz w pasku adresu: `http://localhost:3000/`
3. Naciśnij Enter

**Oczekiwany rezultat:**

- ✅ Automatyczne przekierowanie do `/trips`
- ✅ Brak możliwości zobaczenia landing page

### **Test 2: Niezalogowany Użytkownik**

**Kroki:**

1. Wyloguj się (lub otwórz incognito)
2. Wpisz w pasku adresu: `http://localhost:3000/`
3. Naciśnij Enter

**Oczekiwany rezultat:**

- ✅ Wyświetlenie landing page z opcjami logowania/rejestracji
- ✅ Dwa przyciski: "Zaloguj się" i "Zarejestruj się"

### **Test 3: Middleware Failover**

**Symulacja:**
Jeśli middleware z jakiegoś powodu nie zadziała, per-page check nadal przekieruje zalogowanego użytkownika.

---

## 📊 Flow Diagram

```
┌─────────────┐
│   Browser   │
│  GET /      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│    Middleware               │
│  - Create Supabase client   │
│  - Get session              │
│  - Set locals.user          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Middleware Auth Check      │
│  "/" in authRoutes?         │
│  session exists?            │
└──────┬──────────────────────┘
       │
       ├─YES─► Redirect to /trips
       │
       ▼ NO
┌─────────────────────────────┐
│   index.astro               │
│  - Check Astro.locals.user  │
│  - If user exists?          │
└──────┬──────────────────────┘
       │
       ├─YES─► Redirect to /trips
       │
       ▼ NO
┌─────────────────────────────┐
│   Render Landing Page       │
│  - "Zaloguj się" button     │
│  - "Zarejestruj się" button │
└─────────────────────────────┘
```

---

## 🎯 Zgodność z Best Practices

### ✅ **Inżynieria Oprogramowania**

1. **Defense in Depth:** Dwie warstwy kontroli dostępu
2. **Separation of Concerns:** Middleware (routing) + Page (view logic)
3. **DRY (Don't Repeat Yourself):** Session management w jednym miejscu
4. **Single Source of Truth:** `Astro.locals.user` jako źródło prawdy
5. **Fail-Safe:** Jeśli jedna warstwa zawiedzie, druga nadal działa

### ✅ **Astro Best Practices**

1. **SSR Mode:** Wykorzystanie `output: "server"` w Astro config
2. **Middleware First:** Centralna logika przed renderowaniem
3. **Context Locals:** Przekazywanie danych przez `Astro.locals`
4. **Early Return:** `return Astro.redirect()` przed renderowaniem

### ✅ **Supabase SSR Best Practices**

1. **Server Client:** Używamy `createServerClient` (nie browser client)
2. **Cookie Management:** Automatyczne przez `@supabase/ssr`
3. **Type Safety:** `SupabaseClient<Database>` z pełnym typowaniem
4. **Session per Request:** Nowy client dla każdego żądania

---

## 🔒 Bezpieczeństwo

### **Co Jest Chronione:**

✅ Zalogowani użytkownicy **nie mogą** zobaczyć landing page  
✅ Niezalogowani użytkownicy **mogą** zobaczyć landing page  
✅ Session jest weryfikowana na serwerze (nie w przeglądarce)  
✅ Brak możliwości ominięcia przez manipulację cookies

### **Dlaczego Jest Bezpieczne:**

1. **Server-Side Validation:** Sprawdzanie sesji na serwerze
2. **HttpOnly Cookies:** JavaScript nie ma dostępu do tokenów
3. **Automatic Token Refresh:** `@supabase/ssr` automatycznie odświeża
4. **No Client-Side Logic:** Decyzje o dostępie na serwerze, nie w JS

---

## 📝 Podsumowanie Zmian

### **Zmodyfikowane Pliki:**

```
src/middleware/index.ts    ✏️ Dodano "/" do authRoutes
src/pages/index.astro      ✏️ Dodano per-page auth check
```

### **Linie Kodu:**

- Middleware: +1 linia (dodanie "/" do tablicy)
- index.astro: +4 linie (check + redirect)
- **Całkowity koszt:** 5 linii kodu

### **Zalety Podejścia:**

- ✅ Minimalna ilość kodu
- ✅ Maksymalna uniwersalność
- ✅ Zgodność z PRD i best practices
- ✅ Łatwe utrzymanie i rozbudowa

---

## 🚀 Dodawanie Nowych Chronoionych Stron

Aby dodać nową stronę z tym samym mechanizmem:

### **Opcja 1: Middleware (Rekomendowana)**

```typescript
// W src/middleware/index.ts
const authRoutes = ["/login", "/register", "/", "/new-page"];
```

### **Opcja 2: Per-Page**

```astro
---
// W src/pages/new-page.astro
const user = Astro.locals.user;
if (user) {
  return Astro.redirect("/trips");
}
---
```

---

**Status:** ✅ Strona główna zabezpieczona zgodnie z PRD i best practices  
**Data:** 2024-12-15
