# 🚀 Quick Reference - Integracja Logowania

## 📁 Zmodyfikowane/Utworzone Pliki

### ✨ Nowe Pliki

```
src/lib/schemas/authSchema.ts          # Schematy Zod dla auth
src/pages/api/auth/login.ts            # Endpoint logowania
.ai/auth-login-integration-summary.md  # Dokumentacja techniczna
.ai/auth-login-testing-guide.md        # Przewodnik testowania
.ai/auth-login-quick-reference.md      # Ten plik
```

### 🔧 Zmodyfikowane Pliki

```
package.json                           # + @supabase/ssr
src/db/supabase.client.ts             # SSR client factory
src/env.d.ts                          # + User, Session types
src/types.ts                          # + Auth DTOs
src/middleware/index.ts               # + Session handling + redirects
src/components/auth/LoginForm.tsx     # + API integration
src/pages/login.astro                 # + Per-page auth check
```

---

## 🔑 Kluczowe Zmiany

### 1. Supabase SSR Client

**Przed:**

```typescript
export const supabaseClient = createClient<Database>(url, key);
```

**Po:**

```typescript
export function createSupabaseServerClient(cookies: AstroCookies): SupabaseClient {
  return createServerClient<Database>(url, key, {
    cookies: { get, set, remove },
  });
}
```

**Dlaczego:** Automatyczne zarządzanie cookies, refresh tokens, type safety.

---

### 2. Middleware z Autoryzacją

**Dodane:**

- Tworzenie Supabase client z cookies
- Pobieranie sesji: `supabase.auth.getSession()`
- Dodanie `user`, `session` do `context.locals`
- Automatyczne przekierowania:
  - `/trips/*` bez sesji → `/login?message=unauthorized`
  - `/login`, `/register` z sesją → `/trips`

**Użycie w stronach:**

```astro
---
const user = Astro.locals.user;
const session = Astro.locals.session;
---
```

---

### 3. API Endpoint Logowania

**URL:** `POST /api/auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**

```json
{
  "message": "Zalogowano pomyślnie",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Response 401:**

```json
{
  "error": "Unauthorized",
  "message": "Nieprawidłowy email lub hasło"
}
```

**Funkcje:**

- Walidacja Zod
- `supabase.auth.signInWithPassword()`
- Mapowanie błędów na polskie komunikaty
- Automatyczne ustawienie cookies przez `@supabase/ssr`

---

### 4. LoginForm React Component

**Dodane:**

- `fetch('/api/auth/login')` w `handleSubmit`
- Obsługa response: success → `window.location.href = '/trips'`
- Obsługa błędów: wyświetlenie `data.message`
- Try-catch dla błędów połączenia

---

### 5. Typy TypeScript

**Nowe DTOs:**

```typescript
interface UserDto {
  id: string;
  email: string;
}

interface AuthResponseDto {
  message: string;
  user: UserDto;
}
```

**Rozszerzone App.Locals:**

```typescript
interface Locals {
  supabase: SupabaseClient;
  user: User | null; // ← nowe
  session: Session | null; // ← nowe
}
```

---

## 🧪 Szybki Test

### 1. Utwórz użytkownika w Supabase

```
Dashboard → Authentication → Users → Add User
Email: test@tripbook.pl
Password: test123456
Auto Confirm: ✓
```

### 2. Uruchom serwer

```bash
npm run dev
```

### 3. Testuj

```
http://localhost:4321/login
Email: test@tripbook.pl
Password: test123456
→ Powinno przekierować do /trips
```

---

## 🔍 Debugging

### Sprawdź cookies

```javascript
// W Console (F12)
document.cookie;
// Szukaj: sb-<project-id>-auth-token
```

### Sprawdź sesję w middleware

```typescript
// src/middleware/index.ts (dodaj tymczasowo)
console.log("Session:", session);
console.log("User:", context.locals.user);
```

### Sprawdź Network

```
DevTools → Network → Filtr: login
Kliknij "Zaloguj się"
Sprawdź:
- Request Payload: {email, password}
- Response: {message, user} lub {error, message}
- Status: 200 (OK) lub 401 (Unauthorized)
```

---

## 📋 Checklist Konfiguracji Supabase

- [ ] Email confirmation wyłączony: `Authentication → Providers → Email → Confirm email: OFF`
- [ ] Użytkownik testowy utworzony z "Auto Confirm User"
- [ ] Zmienne środowiskowe ustawione w `.env`
- [ ] Supabase URL i Key poprawne

---

## 🚨 Najczęstsze Błędy

### "Invalid login credentials"

→ Sprawdź czy email jest potwierdzony w Dashboard

### Redirect loop

→ Sprawdź zmienne środowiskowe, wyczyść cookies

### Brak przekierowania po logowaniu

→ Sprawdź Console, czy są błędy JS

### TypeScript errors

→ Restart TS Server: Ctrl+Shift+P → "TypeScript: Restart TS Server"

---

## 🎯 Następne Kroki

Po zweryfikowaniu logowania:

1. **Rejestracja** - `POST /api/auth/register`
2. **Wylogowanie** - `POST /api/auth/logout` + `UserMenu.tsx`
3. **Reset hasła** - `forgot-password` + `reset-password`
4. **Zabezpieczenie API trips** - dodanie `user_id` checks

---

## 📚 Dokumentacja

- **Szczegóły techniczne:** `.ai/auth-login-integration-summary.md`
- **Przewodnik testowania:** `.ai/auth-login-testing-guide.md`
- **Specyfikacja auth:** `.ai/auth-spec.md`
- **PRD:** `.ai/.prod.md` (US-001)

---

## 🔗 Przydatne Linki

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [@supabase/ssr Docs](https://supabase.com/docs/guides/auth/server-side)
- [Astro Middleware](https://docs.astro.build/en/guides/middleware/)
- [Zod Documentation](https://zod.dev/)

---

**Status:** ✅ Integracja logowania kompletna
**Wersja:** 1.0
**Data:** 2025-11-15
