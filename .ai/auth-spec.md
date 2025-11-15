# Specyfikacja Techniczna - Moduł Autentykacji Tripbook

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Strony Astro (Server-Side Rendered)

#### 1.1.1 Strona Logowania (`/login`)

**Plik:** `src/pages/login.astro`

**Opis:**
Strona renderowana po stronie serwera, zawierająca formularz logowania. Jest to pierwsza strona, którą widzi niezalogowany użytkownik próbujący uzyskać dostęp do aplikacji.

**Odpowiedzialności:**

- Sprawdzenie w middleware czy użytkownik jest już zalogowany (jeśli tak → redirect do `/trips`)
- Renderowanie layoutu z formularzem logowania (React component)
- Obsługa query params dla komunikatów (np. `?message=session_expired`)
- Wyświetlanie linku do strony rejestracji i odzyskiwania hasła

**Struktura:**

```
---
// Frontmatter (server-side logic)
- Sprawdzenie sesji przez Supabase Auth
- Redirect jeśli użytkownik zalogowany
- Parsowanie query params dla komunikatów
---

<Layout title="Logowanie - Tripbook">
  <LoginForm client:load message={messageFromQuery} />
</Layout>
```

**Komunikaty błędów:**

- `session_expired` - "Twoja sesja wygasła. Zaloguj się ponownie."
- `unauthorized` - "Musisz się zalogować, aby uzyskać dostęp."
- `logout_success` - "Wylogowano pomyślnie."

---

#### 1.1.2 Strona Rejestracji (`/register`)

**Plik:** `src/pages/register.astro`

**Opis:**
Strona renderowana po stronie serwera, zawierająca formularz rejestracji nowego użytkownika.

**Odpowiedzialności:**

- Sprawdzenie w middleware czy użytkownik jest już zalogowany (jeśli tak → redirect do `/trips`)
- Renderowanie layoutu z formularzem rejestracji (React component)
- Wyświetlanie linku do strony logowania

**Struktura:**

```
---
// Frontmatter (server-side logic)
- Sprawdzenie sesji przez Supabase Auth
- Redirect jeśli użytkownik zalogowany
---

<Layout title="Rejestracja - Tripbook">
  <RegisterForm client:load />
</Layout>
```

---

#### 1.1.3 Strona Odzyskiwania Hasła (`/forgot-password`)

**Plik:** `src/pages/forgot-password.astro`

**Opis:**
Strona renderowana po stronie serwera, umożliwiająca użytkownikowi zresetowanie hasła przez email.

**Odpowiedzialności:**

- Renderowanie formularza z polem email
- Wyświetlanie komunikatu o wysłaniu linku resetującego
- Link powrotny do strony logowania

**Struktura:**

```
---
// Frontmatter (server-side logic)
- Sprawdzenie sesji (opcjonalnie, można pozwolić zalogowanym)
---

<Layout title="Odzyskiwanie hasła - Tripbook">
  <ForgotPasswordForm client:load />
</Layout>
```

---

#### 1.1.4 Strona Resetowania Hasła (`/reset-password`)

**Plik:** `src/pages/reset-password.astro`

**Opis:**
Strona docelowa po kliknięciu w link z emaila resetującego hasło. Zawiera formularz ustawienia nowego hasła.

**Odpowiedzialności:**

- Walidacja tokenu resetującego z URL
- Renderowanie formularza z polami: nowe hasło, potwierdzenie hasła
- Obsługa błędów (token wygasł, token nieprawidłowy)

**Struktura:**

```
---
// Frontmatter (server-side logic)
- Parsowanie tokenu z query params
- Walidacja tokenu przez Supabase
---

<Layout title="Resetowanie hasła - Tripbook">
  <ResetPasswordForm client:load token={tokenFromQuery} />
</Layout>
```

---

#### 1.1.5 Modyfikacja Strony Głównej (`/`)

**Plik:** `src/pages/index.astro`

**Zmiany:**
Obecnie strona główna wyświetla komponent `Welcome.astro`. Po wdrożeniu autentykacji:

**Implementacja (zgodnie z PRD US-001):**
Strona główna `/` (root, np. `http://localhost:3000/`) jest pierwszą stroną aplikacji:

**Dla niezalogowanych użytkowników:**
Wyświetla panel z opcjami logowania i rejestracji (może być prosty landing z dwoma przyciskami lub bezpośrednio formularz logowania z linkiem do rejestracji).

**Dla zalogowanych użytkowników:**
Automatyczne przekierowanie do `/trips`.

```astro
---
// Sprawdzenie sesji
const session = await locals.supabase.auth.getSession();

// Jeśli użytkownik zalogowany → przekieruj do /trips
if (session.data.session) {
  return Astro.redirect("/trips");
}

// Jeśli niezalogowany → wyświetl panel z opcjami auth
---

<Layout title="Tripbook - Twoja biblioteka wycieczek">
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900"
  >
    <div class="max-w-md w-full space-y-8 p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-white mb-4">Tripbook</h1>
        <p class="text-blue-100/90 mb-8">Twoja osobista biblioteka wycieczek</p>
      </div>

      <div class="space-y-4">
        <a
          href="/login"
          class="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition"
        >
          Zaloguj się
        </a>
        <a
          href="/register"
          class="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg text-center transition border border-white/20"
        >
          Zarejestruj się
        </a>
      </div>
    </div>
  </div>
</Layout>
```

**Uzasadnienie:** Zgodnie z PRD US-001: "Strona główna `/` (root) jest pierwszą stroną, którą widzi użytkownik: dla niezalogowanych wyświetla panel z opcjami logowania i rejestracji, dla zalogowanych przekierowuje do `/trips`."

---

#### 1.1.6 Zabezpieczenie Stron Wycieczek

**Pliki:**

- `src/pages/trips.astro`
- `src/pages/trips/[id].astro`
- `src/pages/trips/[id]/edit.astro`

**Zmiany:**
Dodanie sprawdzenia sesji w frontmatter każdej strony:

```astro
---
// Na początku frontmatter
const session = await locals.supabase.auth.getSession();

if (!session.data.session) {
  return Astro.redirect("/login?message=unauthorized");
}

// Reszta logiki strony
---
```

---

### 1.2 Komponenty React (Client-Side)

#### 1.2.1 LoginForm

**Plik:** `src/components/auth/LoginForm.tsx`

**Odpowiedzialności:**

- Renderowanie formularza z polami: email, hasło
- Walidacja po stronie klienta (format email, hasło niepuste)
- Wywołanie API endpoint `/api/auth/login` (POST)
- Obsługa stanów: loading, error, success
- Przekierowanie po udanym logowaniu na `/trips`
- Linki do `/register` i `/forgot-password`

**Props:**

```typescript
interface LoginFormProps {
  message?: string; // Komunikat z query params
}
```

**Stan komponentu:**

```typescript
{
  email: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;
}
```

**Walidacja:**

- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Hasło: minimum 1 znak (Supabase wymaga min 6, ale sprawdzamy to na backendzie)

**Komunikaty błędów:**

- "Nieprawidłowy email lub hasło"
- "Wszystkie pola są wymagane"
- "Wystąpił błąd. Spróbuj ponownie."

**Wykorzystane komponenty shadcn/ui:**

- `Input` (email, password)
- `Button` (submit)
- `Label`
- Alert/komunikat błędu (custom div z Tailwind)

---

#### 1.2.2 RegisterForm

**Plik:** `src/components/auth/RegisterForm.tsx`

**Odpowiedzialności:**

- Renderowanie formularza z polami: email, hasło, potwierdzenie hasła
- Walidacja po stronie klienta:
  - Format email
  - Hasło minimum 6 znaków
  - Hasła się zgadzają
- Wywołanie API endpoint `/api/auth/register` (POST)
- Obsługa stanów: loading, error, success
- Po udanej rejestracji: komunikat + przekierowanie na `/login` lub automatyczne logowanie

**Props:**

```typescript
interface RegisterFormProps {}
```

**Stan komponentu:**

```typescript
{
  email: string;
  password: string;
  confirmPassword: string;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}
```

**Walidacja:**

- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Hasło: minimum 6 znaków
- Potwierdzenie hasła: musi być identyczne z hasłem

**Komunikaty błędów:**

- "Wszystkie pola są wymagane"
- "Nieprawidłowy format email"
- "Hasło musi mieć minimum 6 znaków"
- "Hasła nie są identyczne"
- "Użytkownik z tym adresem email już istnieje"
- "Wystąpił błąd. Spróbuj ponownie."

**Komunikat sukcesu:**

- "Konto zostało utworzone! Przekierowywanie do logowania..."

**Wykorzystane komponenty shadcn/ui:**

- `Input` (email, password, confirmPassword)
- `Button` (submit)
- `Label`
- Alert/komunikat błędu i sukcesu

**UWAGA:** Zgodnie z PRD (US-001), rejestracja wymaga potwierdzenia hasła. Pole `confirmPassword` jest obowiązkowe i musi być identyczne z polem `password`.

---

#### 1.2.3 ForgotPasswordForm

**Plik:** `src/components/auth/ForgotPasswordForm.tsx`

**Odpowiedzialności:**

- Renderowanie formularza z polem: email
- Walidacja formatu email
- Wywołanie API endpoint `/api/auth/forgot-password` (POST)
- Wyświetlenie komunikatu o wysłaniu linku (nawet jeśli email nie istnieje - security best practice)
- Link powrotny do `/login`

**Props:**

```typescript
interface ForgotPasswordFormProps {}
```

**Stan komponentu:**

```typescript
{
  email: string;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}
```

**Komunikaty:**

- Sukces: "Link do resetowania hasła został wysłany na podany adres email."
- Błąd: "Wystąpił błąd. Spróbuj ponownie."

**Wykorzystane komponenty shadcn/ui:**

- `Input` (email)
- `Button` (submit)
- `Label`

---

#### 1.2.4 ResetPasswordForm

**Plik:** `src/components/auth/ResetPasswordForm.tsx`

**Odpowiedzialności:**

- Renderowanie formularza z polami: nowe hasło, potwierdzenie hasła
- Walidacja: hasło min 6 znaków, hasła identyczne
- Wywołanie API endpoint `/api/auth/reset-password` (POST) z tokenem
- Po sukcesie: komunikat + przekierowanie na `/login`

**Props:**

```typescript
interface ResetPasswordFormProps {
  token: string | null;
}
```

**Stan komponentu:**

```typescript
{
  password: string;
  confirmPassword: string;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}
```

**Komunikaty:**

- Błąd tokenu: "Link resetujący jest nieprawidłowy lub wygasł."
- Sukces: "Hasło zostało zmienione. Przekierowywanie do logowania..."

---

#### 1.2.5 UserMenu

**Plik:** `src/components/auth/UserMenu.tsx`

**Odpowiedzialności:**

- Wyświetlanie emaila zalogowanego użytkownika
- Przycisk "Wyloguj"
- Wywołanie API endpoint `/api/auth/logout` (POST)
- Po wylogowaniu: przekierowanie na `/login?message=logout_success`

**Props:**

```typescript
interface UserMenuProps {
  userEmail: string;
}
```

**Stan komponentu:**

```typescript
{
  isLoggingOut: boolean;
}
```

**Umiejscowienie:**
Prawy górny róg w `Layout.astro` (tylko dla zalogowanych użytkowników).

**Wykorzystane komponenty shadcn/ui:**

- `Button`
- Opcjonalnie: dropdown menu (jeśli chcemy rozbudować o więcej opcji)

**UWAGA:** Zgodnie z PRD (US-001): "Po zalogowaniu, w prawym górnym rogu w głównym @Layout.astro wyświetla się email użytkownika oraz przycisk 'Wyloguj'." Komponent wyświetla email i przycisk wylogowania tylko dla zalogowanych użytkowników.

---

### 1.3 Modyfikacja Layout.astro

**Plik:** `src/layouts/Layout.astro`

**Zmiany:**
Dodanie warunkowego renderowania komponentu `UserMenu` w prawym górnym rogu dla zalogowanych użytkowników.

**Struktura:**

```astro
---
// Sprawdzenie sesji
const session = await locals.supabase.auth.getSession();
const user = session.data.session?.user;
---

<!doctype html>
<html lang="en">
  <head>
    <!-- ... existing head content ... -->
  </head>
  <body>
    {
      user && (
        <header class="fixed top-0 right-0 p-4 z-50">
          <UserMenu client:load userEmail={user.email} />
        </header>
      )
    }

    <slot />
  </body>
</html>
```

---

### 1.4 Scenariusze Użytkownika

#### Scenariusz 1: Rejestracja nowego użytkownika

1. Użytkownik wchodzi na `/register`
2. Wypełnia formularz: email, hasło, potwierdzenie hasła
3. Kliknięcie "Zarejestruj się"
4. Walidacja po stronie klienta
5. Wywołanie `POST /api/auth/register`
6. Backend: walidacja Zod, wywołanie `supabase.auth.signUp()`
7. Sukces: komunikat + przekierowanie na `/login` lub automatyczne logowanie
8. Błąd: wyświetlenie komunikatu (email zajęty, błąd serwera)

#### Scenariusz 2: Logowanie

1. Użytkownik wchodzi na `/login`
2. Wypełnia formularz: email, hasło
3. Kliknięcie "Zaloguj się"
4. Walidacja po stronie klienta
5. Wywołanie `POST /api/auth/login`
6. Backend: walidacja Zod, wywołanie `supabase.auth.signInWithPassword()`
7. Sukces: ustawienie sesji (cookie), przekierowanie na `/trips`
8. Błąd: wyświetlenie komunikatu (nieprawidłowe dane)

#### Scenariusz 3: Wylogowanie

1. Zalogowany użytkownik klika "Wyloguj" w `UserMenu`
2. Wywołanie `POST /api/auth/logout`
3. Backend: wywołanie `supabase.auth.signOut()`, usunięcie sesji
4. Przekierowanie na `/login?message=logout_success`

#### Scenariusz 4: Odzyskiwanie hasła

1. Użytkownik wchodzi na `/forgot-password`
2. Wpisuje email
3. Kliknięcie "Wyślij link"
4. Wywołanie `POST /api/auth/forgot-password`
5. Backend: wywołanie `supabase.auth.resetPasswordForEmail()`
6. Komunikat: "Link został wysłany"
7. Użytkownik otrzymuje email z linkiem
8. Kliknięcie w link → przekierowanie na `/reset-password?token=...`
9. Wypełnienie formularza z nowym hasłem
10. Wywołanie `POST /api/auth/reset-password`
11. Sukces: komunikat + przekierowanie na `/login`

#### Scenariusz 5: Próba dostępu bez logowania

1. Niezalogowany użytkownik próbuje wejść na `/trips`
2. Middleware sprawdza sesję
3. Brak sesji → redirect na `/login?message=unauthorized`
4. Wyświetlenie komunikatu: "Musisz się zalogować"

---

## 2. LOGIKA BACKENDOWA

### 2.1 Endpointy API

#### 2.1.1 POST /api/auth/register

**Plik:** `src/pages/api/auth/register.ts`

**Opis:**
Endpoint do rejestracji nowego użytkownika.

**Request Body:**

```typescript
{
  email: string;
  password: string;
  confirmPassword: string;
}
```

**Walidacja (Zod Schema):**

```typescript
const registerSchema = z
  .object({
    email: z.string().email("Nieprawidłowy format email"),
    password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });
```

**Logika:**

1. Parsowanie i walidacja body
2. Wywołanie `supabase.auth.signUp({ email, password })`
3. Obsługa błędów Supabase (email już istnieje, słabe hasło)
4. Zwrócenie odpowiedzi

**Odpowiedzi:**

- **201 Created:**

```json
{
  "message": "Użytkownik został zarejestrowany",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

- **400 Bad Request:**

```json
{
  "error": "Validation error",
  "message": "Hasła nie są identyczne",
  "field": "confirmPassword"
}
```

- **409 Conflict:**

```json
{
  "error": "Conflict",
  "message": "Użytkownik z tym adresem email już istnieje"
}
```

- **500 Internal Server Error:**

```json
{
  "error": "Internal Server Error",
  "message": "Wystąpił błąd podczas rejestracji"
}
```

---

#### 2.1.2 POST /api/auth/login

**Plik:** `src/pages/api/auth/login.ts`

**Opis:**
Endpoint do logowania użytkownika.

**Request Body:**

```typescript
{
  email: string;
  password: string;
}
```

**Walidacja (Zod Schema):**

```typescript
const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});
```

**Logika:**

1. Parsowanie i walidacja body
2. Wywołanie `supabase.auth.signInWithPassword({ email, password })`
3. Ustawienie sesji w cookie przez `Astro.cookies.set()`
4. Zwrócenie odpowiedzi z danymi użytkownika

**Odpowiedzi:**

- **200 OK:**

```json
{
  "message": "Zalogowano pomyślnie",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

- **401 Unauthorized:**

```json
{
  "error": "Unauthorized",
  "message": "Nieprawidłowy email lub hasło"
}
```

- **400 Bad Request:** (walidacja)
- **500 Internal Server Error**

---

#### 2.1.3 POST /api/auth/logout

**Plik:** `src/pages/api/auth/logout.ts`

**Opis:**
Endpoint do wylogowania użytkownika.

**Request Body:**
Brak (lub pusty obiekt)

**Logika:**

1. Wywołanie `supabase.auth.signOut()`
2. Usunięcie cookie sesji przez `Astro.cookies.delete()`
3. Zwrócenie odpowiedzi

**Odpowiedzi:**

- **200 OK:**

```json
{
  "message": "Wylogowano pomyślnie"
}
```

- **500 Internal Server Error**

---

#### 2.1.4 POST /api/auth/forgot-password

**Plik:** `src/pages/api/auth/forgot-password.ts`

**Opis:**
Endpoint do wysłania emaila z linkiem resetującym hasło.

**Request Body:**

```typescript
{
  email: string;
}
```

**Walidacja (Zod Schema):**

```typescript
const forgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
});
```

**Logika:**

1. Parsowanie i walidacja body
2. Wywołanie `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://domain.com/reset-password' })`
3. Zwrócenie odpowiedzi (zawsze sukces, nawet jeśli email nie istnieje - security)

**Odpowiedzi:**

- **200 OK:**

```json
{
  "message": "Link do resetowania hasła został wysłany"
}
```

- **400 Bad Request:** (walidacja)
- **500 Internal Server Error**

---

#### 2.1.5 POST /api/auth/reset-password

**Plik:** `src/pages/api/auth/reset-password.ts`

**Opis:**
Endpoint do ustawienia nowego hasła po kliknięciu w link z emaila.

**Request Body:**

```typescript
{
  token: string;
  password: string;
  confirmPassword: string;
}
```

**Walidacja (Zod Schema):**

```typescript
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token jest wymagany"),
    password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });
```

**Logika:**

1. Parsowanie i walidacja body
2. Weryfikacja tokenu przez Supabase
3. Wywołanie `supabase.auth.updateUser({ password: newPassword })`
4. Zwrócenie odpowiedzi

**Odpowiedzi:**

- **200 OK:**

```json
{
  "message": "Hasło zostało zmienione"
}
```

- **400 Bad Request:** (walidacja lub token nieprawidłowy)

```json
{
  "error": "Bad Request",
  "message": "Token jest nieprawidłowy lub wygasł"
}
```

- **500 Internal Server Error**

---

### 2.2 Schematy Walidacji (Zod)

**Plik:** `src/lib/schemas/authSchema.ts`

Zawiera wszystkie schematy Zod dla endpointów autentykacji:

- `registerSchema`
- `loginSchema`
- `forgotPasswordSchema`
- `resetPasswordSchema`

**Eksport typów:**

```typescript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

---

### 2.3 Typy (DTOs)

**Plik:** `src/types.ts` (rozszerzenie istniejącego)

Dodanie nowych typów dla autentykacji:

```typescript
/**
 * User DTO - reprezentacja użytkownika zwracana przez API
 */
export interface UserDto {
  id: string;
  email: string;
}

/**
 * Auth Response DTO - odpowiedź po logowaniu/rejestracji
 */
export interface AuthResponseDto {
  message: string;
  user: UserDto;
}

/**
 * Logout Response DTO
 */
export interface LogoutResponseDto {
  message: string;
}

/**
 * Password Reset Response DTO
 */
export interface PasswordResetResponseDto {
  message: string;
}
```

---

### 2.4 Middleware - Rozszerzenie

**Plik:** `src/middleware/index.ts`

**Aktualne zadania middleware:**

- Dodanie `supabaseClient` do `context.locals`

**Nowe zadania:**

- Sprawdzenie sesji użytkownika dla chronionych tras
- Przekierowanie niezalogowanych użytkowników na `/login`
- Dodanie informacji o użytkowniku do `context.locals`

**Rozszerzona logika:**

```typescript
import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  // Dodaj Supabase client do context
  context.locals.supabase = supabaseClient;

  // Pobierz sesję użytkownika
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  // Dodaj informacje o użytkowniku do context
  context.locals.user = session?.user ?? null;
  context.locals.session = session;

  // Lista chronionych tras
  const protectedRoutes = ["/trips", "/trips/"];
  const isProtectedRoute = protectedRoutes.some((route) => context.url.pathname.startsWith(route));

  // Jeśli chroniona trasa i brak sesji → redirect
  if (isProtectedRoute && !session) {
    return context.redirect("/login?message=unauthorized");
  }

  // Lista tras tylko dla niezalogowanych (login, register)
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => context.url.pathname === route);

  // Jeśli trasa auth i użytkownik zalogowany → redirect do /trips
  if (isAuthRoute && session) {
    return context.redirect("/trips");
  }

  return next();
});
```

**Typy dla context.locals:**
Rozszerzenie pliku `src/env.d.ts`:

```typescript
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    supabase: import("./db/supabase.client").SupabaseClient;
    user: import("@supabase/supabase-js").User | null;
    session: import("@supabase/supabase-js").Session | null;
  }
}
```

---

### 2.5 Obsługa Wyjątków

**Wzorzec obsługi błędów w endpointach:**

1. **Błędy walidacji Zod:**
   - Status: 400 Bad Request
   - Format: `ErrorResponseDto` z polem `field`

2. **Błędy Supabase Auth:**
   - Email już istnieje: 409 Conflict
   - Nieprawidłowe dane logowania: 401 Unauthorized
   - Token wygasł/nieprawidłowy: 400 Bad Request

3. **Błędy serwera:**
   - Status: 500 Internal Server Error
   - Logowanie błędu do konsoli
   - Zwrócenie ogólnego komunikatu (bez szczegółów technicznych)

**Przykład try-catch w endpoincie:**

```typescript
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parsowanie body
    const body = await request.json();

    // Walidacja Zod
    let validatedData;
    try {
      validatedData = loginSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return new Response(
          JSON.stringify({
            error: "Validation error",
            message: firstError.message,
            field: firstError.path.join("."),
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw error;
    }

    // Logika biznesowa
    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Nieprawidłowy email lub hasło",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sukces
    return new Response(
      JSON.stringify({
        message: "Zalogowano pomyślnie",
        user: { id: data.user.id, email: data.user.email },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in POST /api/auth/login:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Wystąpił błąd podczas logowania",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
```

---

### 2.6 Aktualizacja Renderowania Stron (SSR)

**Konfiguracja Astro:** `astro.config.mjs`

```javascript
export default defineConfig({
  output: "server", // ✓ już ustawione
  adapter: node({
    mode: "standalone",
  }),
  // ...
});
```

**Implikacje:**

- Wszystkie strony są renderowane po stronie serwera (SSR)
- Middleware wykonuje się przy każdym żądaniu
- Możliwość sprawdzenia sesji w frontmatter każdej strony
- Cookies są dostępne przez `Astro.cookies`

**Przykład użycia w stronie:**

```astro
---
// src/pages/trips.astro
const session = await locals.supabase.auth.getSession();

if (!session.data.session) {
  return Astro.redirect("/login?message=unauthorized");
}

const user = session.data.session.user;
---

<Layout title="Moje wycieczki">
  <!-- Zawartość strony -->
</Layout>
```

---

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja Supabase Auth z Astro

#### 3.1.1 Konfiguracja Supabase Client

**Aktualny stan:**
Plik `src/db/supabase.client.ts` już zawiera konfigurację klienta Supabase:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Bez zmian** - ten klient obsługuje zarówno bazę danych, jak i autentykację.

---

#### 3.1.2 Zarządzanie Sesjami

**Mechanizm:**
Supabase Auth używa JWT (JSON Web Tokens) do zarządzania sesjami. Token jest przechowywany w:

- **localStorage** (domyślnie w aplikacjach SPA)
- **Cookies** (rekomendowane dla SSR w Astro)

**Implementacja w Astro:**

**A) Ustawienie sesji po logowaniu:**

```typescript
// W endpoincie /api/auth/login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (!error && data.session) {
  // Ustawienie cookie z access token
  Astro.cookies.set("sb-access-token", data.session.access_token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dni
  });

  // Ustawienie cookie z refresh token
  Astro.cookies.set("sb-refresh-token", data.session.refresh_token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 dni
  });
}
```

**B) Odczyt sesji w middleware:**

```typescript
// W middleware
const accessToken = context.cookies.get("sb-access-token")?.value;
const refreshToken = context.cookies.get("sb-refresh-token")?.value;

if (accessToken) {
  const {
    data: { session },
  } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  context.locals.session = session;
  context.locals.user = session?.user ?? null;
}
```

**C) Usunięcie sesji po wylogowaniu:**

```typescript
// W endpoincie /api/auth/logout
await supabase.auth.signOut();

Astro.cookies.delete("sb-access-token", { path: "/" });
Astro.cookies.delete("sb-refresh-token", { path: "/" });
```

---

#### 3.1.3 Rejestracja Użytkownika

**Metoda Supabase:**

```typescript
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "securepassword",
});
```

**Opcje konfiguracji w Supabase Dashboard:**

- **Email confirmation:** Czy wymagać potwierdzenia emaila przed logowaniem (domyślnie: tak)
  - Dla MVP można wyłączyć dla uproszczenia
- **Auto-confirm users:** Automatyczne potwierdzenie (dla developmentu)

**Obsługa w endpoincie:**

1. Walidacja danych (email, hasło, potwierdzenie)
2. Wywołanie `signUp()`
3. Jeśli sukces:
   - Opcja A: Automatyczne logowanie (ustawienie sesji)
   - Opcja B: Przekierowanie na `/login` z komunikatem
4. Jeśli błąd (email zajęty): zwrócenie 409 Conflict

---

#### 3.1.4 Logowanie Użytkownika

**Metoda Supabase:**

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "securepassword",
});
```

**Obsługa w endpoincie:**

1. Walidacja danych
2. Wywołanie `signInWithPassword()`
3. Jeśli sukces:
   - Ustawienie sesji w cookies
   - Zwrócenie danych użytkownika
4. Jeśli błąd: zwrócenie 401 Unauthorized

---

#### 3.1.5 Wylogowanie Użytkownika

**Metoda Supabase:**

```typescript
await supabase.auth.signOut();
```

**Obsługa w endpoincie:**

1. Wywołanie `signOut()`
2. Usunięcie cookies z tokenami
3. Zwrócenie komunikatu sukcesu

**Obsługa w komponencie:**
Po otrzymaniu odpowiedzi 200, przekierowanie na `/login?message=logout_success`.

---

#### 3.1.6 Odzyskiwanie Hasła

**Metoda Supabase:**

```typescript
const { error } = await supabase.auth.resetPasswordForEmail("user@example.com", {
  redirectTo: "https://yourdomain.com/reset-password",
});
```

**Konfiguracja w Supabase Dashboard:**

- **Email Templates:** Dostosowanie szablonu emaila resetującego hasło
- **Redirect URLs:** Dodanie `https://yourdomain.com/reset-password` do listy dozwolonych URL

**Flow:**

1. Użytkownik wpisuje email na `/forgot-password`
2. Backend wywołuje `resetPasswordForEmail()`
3. Supabase wysyła email z linkiem zawierającym token
4. Link prowadzi do `/reset-password?token=...&type=recovery`
5. Strona `/reset-password` renderuje formularz
6. Po wypełnieniu formularza: wywołanie `POST /api/auth/reset-password`
7. Backend weryfikuje token i ustawia nowe hasło

**Metoda ustawiania nowego hasła:**

```typescript
// Po weryfikacji tokenu
const { error } = await supabase.auth.updateUser({
  password: "newSecurePassword",
});
```

---

### 3.2 Zabezpieczenie Tras

**Poziomy zabezpieczenia:**

#### Poziom 1: Middleware (globalny)

Sprawdzenie sesji dla wszystkich chronionych tras i automatyczne przekierowanie.

**Zalety:**

- Centralne zarządzanie
- Brak duplikacji kodu
- Automatyczne dla wszystkich nowych stron w `/trips/*`

**Implementacja:** Opisana w sekcji 2.4

---

#### Poziom 2: Sprawdzenie w Frontmatter (per-page)

Dodatkowa weryfikacja w konkretnych stronach (opcjonalnie).

**Przykład:**

```astro
---
// src/pages/trips/[id]/edit.astro
const { id } = Astro.params;
const session = await locals.supabase.auth.getSession();

if (!session.data.session) {
  return Astro.redirect("/login?message=unauthorized");
}

// Dodatkowa logika: sprawdzenie czy użytkownik jest właścicielem wycieczki
const trip = await getTripById(id, locals.supabase);
if (trip && trip.user_id !== session.data.session.user.id) {
  return Astro.redirect("/trips?message=forbidden");
}
---
```

---

#### Poziom 3: Zabezpieczenie API Endpoints

Każdy endpoint manipulujący danymi sprawdza sesję i `user_id`.

**Aktualizacja tripService.ts:**

**Przed:**

```typescript
export async function createTrip(command: CreateTripCommand, supabase: SupabaseClient): Promise<Tables<"trips">> {
  const PLACEHOLDER_USER_ID = "00000000-0000-0000-0000-000000000000";

  const { data, error } = await supabase.from("trips").insert({
    ...command,
    user_id: PLACEHOLDER_USER_ID,
  });
  // ...
}
```

**Po:**

```typescript
export async function createTrip(
  command: CreateTripCommand,
  userId: string,
  supabase: SupabaseClient
): Promise<Tables<"trips">> {
  const { data, error } = await supabase.from("trips").insert({
    ...command,
    user_id: userId,
  });
  // ...
}
```

**Aktualizacja endpointu POST /api/trips:**

```typescript
export const POST: APIRoute = async ({ request, locals }) => {
  // Sprawdzenie sesji
  const {
    data: { session },
  } = await locals.supabase.auth.getSession();

  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Musisz być zalogowany",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Parsowanie i walidacja body
  const body = await request.json();
  const validatedData = createTripSchema.parse(body);

  // Utworzenie wycieczki z user_id z sesji
  const trip = await createTrip(validatedData, session.user.id, locals.supabase);

  // Zwrócenie odpowiedzi
  return new Response(JSON.stringify(tripDto), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
```

**Podobne zmiany w:**

- `GET /api/trips` - filtrowanie po `user_id`
- `GET /api/trips/[id]` - sprawdzenie czy wycieczka należy do użytkownika
- `PATCH /api/trips/[id]` - sprawdzenie właściciela
- `DELETE /api/trips/[id]` - sprawdzenie właściciela

---

### 3.3 Row Level Security (RLS) w Supabase

**Opcjonalne, ale rekomendowane:**
Włączenie RLS na tabeli `trips` dla dodatkowej warstwy bezpieczeństwa.

**Migracja SQL:**

```sql
-- Włączenie RLS na tabeli trips
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Policy: Użytkownik może odczytać tylko swoje wycieczki
CREATE POLICY "Users can read own trips"
ON trips FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Użytkownik może tworzyć wycieczki
CREATE POLICY "Users can create own trips"
ON trips FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Użytkownik może aktualizować tylko swoje wycieczki
CREATE POLICY "Users can update own trips"
ON trips FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Użytkownik może usuwać tylko swoje wycieczki
CREATE POLICY "Users can delete own trips"
ON trips FOR DELETE
USING (auth.uid() = user_id);
```

**Zalety RLS:**

- Dodatkowa warstwa bezpieczeństwa na poziomie bazy danych
- Nawet jeśli backend ma błąd, baza nie pozwoli na nieautoryzowany dostęp
- Automatyczne filtrowanie wyników zapytań

**Uwaga:**
Po włączeniu RLS, wszystkie zapytania do `trips` muszą być wykonywane z kontekstem zalogowanego użytkownika (token w headerze lub sesja).

---

### 3.4 Konfiguracja Supabase

**Zmienne środowiskowe:**
Plik `.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

**Konfiguracja w Supabase Dashboard:**

1. **Authentication → Providers:**
   - Włączenie "Email" provider
   - Wyłączenie innych providerów (Google, GitHub) - nie w MVP

2. **Authentication → Email Templates:**
   - Dostosowanie szablonów emaili (opcjonalnie)
   - Confirm signup
   - Reset password

3. **Authentication → URL Configuration:**
   - **Site URL:** `https://yourdomain.com` (produkcja) lub `http://localhost:3000` (dev)
   - **Redirect URLs:** Dodanie `http://localhost:3000/reset-password` i `https://yourdomain.com/reset-password`

4. **Authentication → Settings:**
   - **Enable email confirmations:** Wyłączone dla MVP (opcjonalnie)
   - **Minimum password length:** 6 znaków (domyślnie)

5. **Database → Tables → trips:**
   - Włączenie RLS (opcjonalnie, ale rekomendowane)
   - Dodanie policies (jak w sekcji 3.3)

---

### 3.5 Bezpieczeństwo

**Best Practices:**

1. **Cookies:**
   - `httpOnly: true` - zapobiega dostępowi przez JavaScript (XSS)
   - `secure: true` - tylko HTTPS (produkcja)
   - `sameSite: 'lax'` - ochrona przed CSRF

2. **Hasła:**
   - Minimum 6 znaków (Supabase default)
   - Supabase automatycznie hashuje hasła (bcrypt)

3. **Tokeny:**
   - JWT z czasem wygaśnięcia (domyślnie 1h dla access token)
   - Refresh token do odnawiania sesji (domyślnie 30 dni)

4. **Błędy:**
   - Nie ujawnianie szczegółów technicznych w odpowiedziach API
   - Logowanie błędów tylko po stronie serwera
   - Ogólne komunikaty dla użytkownika ("Wystąpił błąd")

5. **Rate Limiting:**
   - Supabase ma wbudowane rate limiting dla auth endpoints
   - Opcjonalnie: dodatkowe rate limiting w middleware Astro

6. **Email Enumeration Prevention:**
   - Endpoint `/api/auth/forgot-password` zawsze zwraca sukces, nawet jeśli email nie istnieje
   - Zapobiega sprawdzaniu czy email jest zarejestrowany

---

## 4. PODSUMOWANIE I KOLEJNE KROKI

### 4.1 Struktura Plików do Utworzenia

**Nowe strony Astro:**

- `src/pages/login.astro`
- `src/pages/register.astro`
- `src/pages/forgot-password.astro`
- `src/pages/reset-password.astro`

**Nowe komponenty React:**

- `src/components/auth/LoginForm.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/components/auth/ForgotPasswordForm.tsx`
- `src/components/auth/ResetPasswordForm.tsx`
- `src/components/auth/UserMenu.tsx`

**Nowe endpointy API:**

- `src/pages/api/auth/register.ts`
- `src/pages/api/auth/login.ts`
- `src/pages/api/auth/logout.ts`
- `src/pages/api/auth/forgot-password.ts`
- `src/pages/api/auth/reset-password.ts`

**Nowe schematy i typy:**

- `src/lib/schemas/authSchema.ts`
- Rozszerzenie `src/types.ts`
- Rozszerzenie `src/env.d.ts`

**Modyfikacje istniejących plików:**

- `src/middleware/index.ts` - dodanie auth guards
- `src/layouts/Layout.astro` - dodanie UserMenu
- `src/pages/index.astro` - redirect logic
- `src/pages/trips.astro` - auth check
- `src/pages/trips/[id].astro` - auth check
- `src/pages/trips/[id]/edit.astro` - auth check
- `src/lib/services/tripService.ts` - dodanie `userId` do funkcji
- Wszystkie endpointy w `src/pages/api/trips/*` - auth checks

---

### 4.2 Kolejność Implementacji (Rekomendowana)

1. **Faza 1: Podstawy**
   - Utworzenie schematów Zod (`authSchema.ts`)
   - Rozszerzenie typów (`types.ts`, `env.d.ts`)
   - Aktualizacja middleware (podstawowa wersja bez redirectów)

2. **Faza 2: Rejestracja i Logowanie**
   - Endpoint `POST /api/auth/register`
   - Endpoint `POST /api/auth/login`
   - Strona `register.astro` + `RegisterForm.tsx`
   - Strona `login.astro` + `LoginForm.tsx`
   - Testowanie flow rejestracji i logowania

3. **Faza 3: Wylogowanie i UserMenu**
   - Endpoint `POST /api/auth/logout`
   - Komponent `UserMenu.tsx`
   - Aktualizacja `Layout.astro`
   - Testowanie flow wylogowania

4. **Faza 4: Zabezpieczenie Tras**
   - Aktualizacja middleware z redirectami
   - Dodanie auth checks do stron `/trips/*`
   - Aktualizacja `tripService.ts` (dodanie `userId`)
   - Aktualizacja endpointów API `/api/trips/*`
   - Testowanie dostępu do chronionych zasobów

5. **Faza 5: Odzyskiwanie Hasła (zgodnie z PRD US-001)**
   - Endpoint `POST /api/auth/forgot-password`
   - Endpoint `POST /api/auth/reset-password`
   - Strona `forgot-password.astro` + `ForgotPasswordForm.tsx`
   - Strona `reset-password.astro` + `ResetPasswordForm.tsx`
   - Konfiguracja Supabase (email templates, redirect URLs)
   - Testowanie flow resetowania hasła
   - **UWAGA:** PRD (US-001, linia 112) wymaga: "Odzyskiwanie hasła powinno być możliwe" - jest to część MVP

6. **Faza 6: RLS (Opcjonalne)**
   - Utworzenie migracji SQL dla RLS
   - Testowanie policies
   - Weryfikacja bezpieczeństwa

7. **Faza 7: Testy i Refinement**
   - Testy E2E dla flow autentykacji
   - Testy jednostkowe dla schematów Zod
   - Poprawki UX (komunikaty, loading states)
   - Dokumentacja

---

### 4.3 Kluczowe Decyzje Architektoniczne

1. **SSR vs. CSR:**
   - **Decyzja:** SSR dla wszystkich stron (już skonfigurowane w `astro.config.mjs`)
   - **Uzasadnienie:** Bezpieczeństwo (sprawdzenie sesji na serwerze), SEO, szybsze initial load

2. **Sesje w Cookies vs. localStorage:**
   - **Decyzja:** Cookies z `httpOnly`
   - **Uzasadnienie:** Bezpieczeństwo (XSS protection), kompatybilność z SSR

3. **Automatyczne logowanie po rejestracji:**
   - **Decyzja:** Przekierowanie na `/login` z komunikatem
   - **Uzasadnienie:** Prostota implementacji MVP, możliwość dodania email confirmation w przyszłości

4. **RLS w Supabase:**
   - **Decyzja:** Opcjonalne, ale rekomendowane
   - **Uzasadnienie:** Dodatkowa warstwa bezpieczeństwa, ale wymaga dodatkowej konfiguracji

5. **Walidacja hasła:**
   - **Decyzja:** Minimum 6 znaków, brak dodatkowych wymagań
   - **Uzasadnienie:** MVP, zgodność z wymaganiami PRD (brak walidacji siły hasła)

6. **Email confirmation:**
   - **Decyzja:** Wyłączone dla MVP
   - **Uzasadnienie:** Uproszczenie flow, szybsze testowanie

---

### 4.4 Potencjalne Wyzwania i Rozwiązania

**Wyzwanie 1: Zarządzanie sesjami w Astro SSR**

- **Problem:** Supabase domyślnie używa localStorage (CSR)
- **Rozwiązanie:** Manualne zarządzanie tokenami w cookies, użycie `setSession()` w middleware

**Wyzwanie 2: Refresh token rotation**

- **Problem:** Access token wygasa po 1h
- **Rozwiązanie:** Middleware sprawdza ważność tokenu i automatycznie odnawia przez refresh token

**Wyzwanie 3: Synchronizacja user_id w tripService**

- **Problem:** Aktualne funkcje używają placeholder user_id
- **Rozwiązanie:** Dodanie parametru `userId` do wszystkich funkcji, przekazywanie z sesji

**Wyzwanie 4: Testowanie flow resetowania hasła**

- **Problem:** Wymaga konfiguracji emaili w Supabase
- **Rozwiązanie:** Użycie Supabase local development lub testowego projektu

**Wyzwanie 5: Migracja istniejących danych**

- **Problem:** Tabela `trips` ma już rekordy z placeholder user_id
- **Rozwiązanie:** Migracja SQL do usunięcia lub przypisania do testowego użytkownika

---

### 4.5 Metryki Sukcesu Implementacji

**Funkcjonalne:**

- ✅ Użytkownik może się zarejestrować
- ✅ Użytkownik może się zalogować
- ✅ Użytkownik może się wylogować
- ✅ Użytkownik może zresetować hasło
- ✅ Niezalogowany użytkownik nie ma dostępu do `/trips`
- ✅ Zalogowany użytkownik widzi tylko swoje wycieczki
- ✅ Zalogowany użytkownik nie może edytować/usuwać cudzych wycieczek

**Techniczne:**

- ✅ Wszystkie endpointy auth działają poprawnie
- ✅ Walidacja Zod działa na wszystkich endpointach
- ✅ Middleware poprawnie przekierowuje użytkowników
- ✅ Sesje są bezpiecznie przechowywane w cookies
- ✅ Brak błędów w konsoli przeglądarki i serwera

**UX:**

- ✅ Komunikaty błędów są zrozumiałe
- ✅ Loading states są widoczne podczas operacji
- ✅ Formularze są responsywne
- ✅ Nawigacja między stronami auth jest intuicyjna

---

---

## 5. ROZWIĄZANIE SPRZECZNOŚCI W PRD

Podczas analizy PRD (.prod.md) i przygotowania tej specyfikacji zidentyfikowano następujące sprzeczności, które zostały rozwiązane:

### 5.1 Potwierdzenie hasła przy rejestracji

**Wyjaśnienie:**
PRD (US-001) jednoznacznie wymaga: "Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła"

**Implementacja:**
Formularz rejestracji zawiera pole `confirmPassword`, które musi być identyczne z polem `password`. Walidacja odbywa się zarówno po stronie klienta (React), jak i serwera (Zod schema).

### 5.2 UserMenu w prawym górnym rogu

**Wyjaśnienie:**
PRD (US-001) wymaga: "Po zalogowaniu, w prawym górnym rogu w głównym @Layout.astro wyświetla się email użytkownika oraz przycisk 'Wyloguj'."

**Implementacja:**
Komponent `UserMenu` wyświetla:

- Email zalogowanego użytkownika
- Przycisk "Wyloguj"
- Renderowany tylko dla zalogowanych użytkowników (warunek w Layout.astro)

### 5.3 Pierwsza strona projektu (root `/`)

**Wyjaśnienie:**
PRD (US-001) wymaga: "Strona główna `/` (root, np. `http://localhost:3000/`) jest pierwszą stroną, którą widzi użytkownik"

**Implementacja:**

- **Dla niezalogowanych:** Strona główna `/` wyświetla panel z opcjami logowania i rejestracji (przyciski/linki do `/login` i `/register`)
- **Dla zalogowanych:** Automatyczne przekierowanie do `/trips`

To zapewnia, że niezalogowani użytkownicy widzą przyjazny interfejs z wyborem akcji, zamiast być od razu przekierowywani na `/login`.

### 5.4 Odzyskiwanie hasła w MVP

**Wyjaśnienie:**
PRD (US-001) wymaga: "Odzyskiwanie hasła jest możliwe poprzez dedykowane strony `/forgot-password` i `/reset-password`"

**Implementacja:**
Pełna funkcjonalność odzyskiwania hasła jest **częścią MVP**:

- Strona `/forgot-password` z formularzem do wysłania linku resetującego
- Strona `/reset-password` z formularzem do ustawienia nowego hasła
- Integracja z Supabase Auth (resetPasswordForEmail, updateUser)
- Konfiguracja email templates w Supabase Dashboard
- Implementacja w Fazie 5 planu wdrożenia

### 5.5 Hamburger menu na mobile

**Wyjaśnienie:**
PRD jednoznacznie określa: "Co NIE wchodzi w zakres MVP: Hamburger menu na mobile"

**Implementacja:**
Hamburger menu **NIE jest** implementowane w MVP. Nawigacja na mobile będzie uproszczona:

- Przycisk "Wyloguj" + email w prawym górnym rogu (zawsze widoczny)
- Brak dodatkowego menu mobilnego
- Responsywność zapewniona przez Tailwind CSS

**Uwaga:** Jeśli `.ai/ui-plan.md` wspomina o hamburger menu, należy traktować to jako dokumentację przyszłych funkcjonalności (poza MVP).

---

## KONIEC SPECYFIKACJI

Ta specyfikacja stanowi kompletny plan implementacji modułu autentykacji dla aplikacji Tripbook. Wszystkie elementy są zgodne z wymaganiami z PRD (US-001) oraz stackiem technologicznym (Astro 5, React 19, TypeScript, Supabase). Zidentyfikowane sprzeczności zostały rozwiązane z priorytetem dla bezpośrednich wymagań funkcjonalnych (User Stories) nad ogólnymi ograniczeniami MVP.
