# 📝 Rejestracja Użytkowników - Implementacja

## ✅ Zaimplementowane Komponenty

### **1. Endpoint API**

**Plik:** `src/pages/api/auth/register.ts`

- `POST /api/auth/register`
- Walidacja Zod (email, hasło, potwierdzenie hasła)
- Integracja z `supabase.auth.signUp()`
- Mapowanie błędów Supabase na polskie komunikaty
- Status 201 (Created) dla sukcesu
- Status 409 (Conflict) dla istniejącego użytkownika

### **2. Komponent React**

**Plik:** `src/components/auth/RegisterForm.tsx`

- Formularz z polami: email, hasło, potwierdzenie hasła
- Walidacja po stronie klienta
- Wywołanie API `/api/auth/register`
- Ekran sukcesu z informacją o potwierdzeniu emaila
- Automatyczne przekierowanie do `/login` po 3 sekundach

### **3. Strona Rejestracji**

**Plik:** `src/pages/register.astro`

- Per-page auth check (defense in depth)
- Przekierowanie zalogowanych do `/trips`
- Spójna z `login.astro`

### **4. Komunikat w LoginForm**

**Plik:** `src/components/auth/LoginForm.tsx`

- Dodano `registration_success` message
- Informacja o potwierdzeniu konta przez email

---

## 📧 **Ważne: Potwierdzenie Emaila w Supabase**

### **Zachowanie Domyślne Supabase**

Po wywołaniu `supabase.auth.signUp()`:

1. **Supabase tworzy użytkownika** w bazie danych
2. **Wysyła email z linkiem potwierdzającym** na podany adres
3. **Użytkownik musi kliknąć link** w emailu, aby aktywować konto
4. **Dopiero po potwierdzeniu** można się zalogować

### **Co Widzą Użytkownicy**

#### **Po Udanej Rejestracji:**

```
✓ Konto zostało utworzone!

Na Twój adres email został wysłany link potwierdzający.

Sprawdź swoją skrzynkę pocztową (w tym folder SPAM)
i kliknij w link, aby aktywować konto.

Przekierowywanie do logowania...
```

#### **Próba Logowania Przed Potwierdzeniem:**

```
❌ Email nie został potwierdzony.
   Sprawdź swoją skrzynkę pocztową.
```

(Obsługiwane w endpoint `/api/auth/login`)

---

## 🔧 Konfiguracja Supabase Dashboard

### **1. Email Templates**

**Sprawdź/Edytuj w:** `Authentication → Email Templates → Confirm signup`

**Domyślny szablon:**

```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

**Możesz go spolszczyć:**

```html
<h2>Potwierdź swoją rejestrację</h2>
<p>Kliknij w link poniżej, aby aktywować konto:</p>
<p><a href="{{ .ConfirmationURL }}">Potwierdź email</a></p>
```

### **2. Email Provider Settings**

**Domyślnie:** Supabase używa własnego serwera email (limit: 4 emaile/godzinę)

**Dla produkcji:** Skonfiguruj własny SMTP (np. SendGrid, Mailgun)

**Sprawdź w:** `Project Settings → Auth → SMTP Settings`

### **3. Email Confirmation Setting**

**Sprawdź w:** `Authentication → Providers → Email`

**Opcja:** "Confirm email"

- ☑️ **Zaznaczone** (domyślnie) - wymaga potwierdzenia
- ☐ **Odznaczone** - brak potwierdzenia (tylko dla dev!)

**Dla MVP:** Zostaw **zaznaczone** (bezpieczniejsze)

---

## 🧪 Testowanie Flow Rejestracji

### **Scenariusz 1: Pełny Flow z Potwierdzeniem Emaila**

**Krok 1:** Otwórz stronę rejestracji

```
http://localhost:3000/register
```

**Krok 2:** Wypełnij formularz

```
Email: test-new@tripbook.pl
Hasło: test123456
Potwierdzenie: test123456
```

**Krok 3:** Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**

- ✅ Ekran sukcesu z informacją o emailu
- ✅ Automatyczne przekierowanie do `/login` po 3 sekundach

**Krok 4:** Sprawdź email na `test-new@tripbook.pl`

**Oczekiwany email:**

```
Temat: Confirm your signup
Treść: Link do potwierdzenia konta
```

**Uwaga:** Jeśli używasz lokalnego Supabase lub dev projektu, email może nie zostać wysłany. Wtedy:

- Sprawdź Supabase Dashboard → Authentication → Users
- Użytkownik będzie miał status "Waiting for verification"
- Możesz ręcznie potwierdzić: Edit User → Email Confirmed ✓

**Krok 5:** Kliknij link w emailu

**Oczekiwany rezultat:**

- ✅ Przekierowanie do aplikacji
- ✅ Status użytkownika zmienia się na "Confirmed"

**Krok 6:** Zaloguj się

```
http://localhost:3000/login
Email: test-new@tripbook.pl
Hasło: test123456
```

**Oczekiwany rezultat:**

- ✅ Pomyślne logowanie
- ✅ Przekierowanie do `/trips`

---

### **Scenariusz 2: Próba Logowania Przed Potwierdzeniem**

**Krok 1-3:** Zarejestruj się (jak wyżej)

**Krok 4:** **NIE** klikaj linku w emailu

**Krok 5:** Spróbuj się zalogować

```
http://localhost:3000/login
Email: test-new@tripbook.pl
Hasło: test123456
```

**Oczekiwany rezultat:**

- ❌ Błąd: "Email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową."
- ✅ Brak możliwości zalogowania
- ✅ Komunikat o konieczności potwierdzenia

---

### **Scenariusz 3: Email Już Istnieje**

**Krok 1:** Zarejestruj użytkownika (test@tripbook.pl)

**Krok 2:** Spróbuj zarejestrować ponownie z tym samym emailem

**Oczekiwany rezultat:**

- ❌ Status: 409 Conflict
- ❌ Komunikat: "Użytkownik z tym adresem email już istnieje"
- ✅ Brak duplikacji użytkowników

---

### **Scenariusz 4: Walidacja Formularza**

**Test 1: Hasła się nie zgadzają**

```
Email: test@test.pl
Hasło: test123
Potwierdzenie: test456
```

**Oczekiwany błąd:** "Hasła nie są identyczne"

**Test 2: Hasło za krótkie**

```
Hasło: test
```

**Oczekiwany błąd:** "Hasło musi mieć minimum 6 znaków"

**Test 3: Nieprawidłowy email**

```
Email: invalid-email
```

**Oczekiwany błąd:** "Nieprawidłowy format email"

---

## 🔄 Flow Diagram

```
┌─────────────┐
│   Browser   │
│ /register   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Middleware Auth Check      │
│  Session exists?            │
└──────┬──────────────────────┘
       │
       ├─YES─► Redirect to /trips
       │
       ▼ NO
┌─────────────────────────────┐
│   register.astro            │
│  - Per-page check           │
│  - Render RegisterForm      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   RegisterForm.tsx          │
│  User fills form            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  POST /api/auth/register    │
│  - Validate with Zod        │
│  - signUp()                 │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Supabase Auth             │
│  - Create user              │
│  - Send confirmation email  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Success Screen            │
│  "Sprawdź email!"           │
│  Redirect to /login (3s)    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   User's Email              │
│  Click confirmation link    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Supabase Confirms         │
│  Email verified ✓           │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   User can login            │
│  /login with credentials    │
└─────────────────────────────┘
```

---

## 📊 Spójność z Logowaniem

### **Identyczne Podejście:**

| Aspekt             | Login                    | Register                    |
| ------------------ | ------------------------ | --------------------------- |
| **Endpoint**       | `POST /api/auth/login`   | `POST /api/auth/register`   |
| **Walidacja**      | Zod schema               | Zod schema                  |
| **Auth**           | `signInWithPassword()`   | `signUp()`                  |
| **Błędy**          | Polskie komunikaty       | Polskie komunikaty          |
| **Per-page check** | ✅ `login.astro`         | ✅ `register.astro`         |
| **Middleware**     | ✅ `/login` w authRoutes | ✅ `/register` w authRoutes |
| **Loading state**  | ✅ "Logowanie..."        | ✅ "Rejestracja..."         |
| **Redirect**       | `/trips`                 | `/login` (po 3s)            |

### **Różnice:**

| Aspekt          | Login                | Register                         |
| --------------- | -------------------- | -------------------------------- |
| **Pola**        | email, password      | email, password, confirmPassword |
| **Success**     | Redirect natychmiast | Ekran sukcesu + delay            |
| **Email**       | -                    | Wysyłany link potwierdzający     |
| **Query param** | message z URL        | -                                |

---

## 🔒 Bezpieczeństwo

### **Zabezpieczenia Zaimplementowane:**

1. ✅ **Walidacja Zod** - server-side
2. ✅ **Client-side validation** - lepsze UX
3. ✅ **Password confirmation** - zmniejsza ryzyko błędu
4. ✅ **Email confirmation** - weryfikacja własności emaila
5. ✅ **Duplicate check** - Supabase automatycznie
6. ✅ **Auth check** - zalogowani nie widzą formularza
7. ✅ **HTTPS cookies** - bezpieczne przechowywanie sesji

### **Supabase Built-in Protection:**

- ✅ Password hashing (bcrypt)
- ✅ Rate limiting (max 4 signup/h na darmowym planie)
- ✅ Email verification required
- ✅ SQL injection protection
- ✅ CSRF protection

---

## 🐛 Troubleshooting

### **Problem: Email nie przychodzi**

**Możliwe przyczyny:**

1. Limit Supabase (4 emaile/godzinę)
2. Email w folderze SPAM
3. Nieprawidłowa konfiguracja SMTP

**Rozwiązanie:**

```
1. Supabase Dashboard → Authentication → Users
2. Znajdź użytkownika
3. Check "Email Confirmed At" - czy puste?
4. Jeśli tak: Edit User → Email Confirmed ✓ → Save
```

### **Problem: "User already registered"**

**Przyczyna:** Email już istnieje w bazie

**Rozwiązanie:**

- Użyj innego emaila
- LUB usuń starego użytkownika w Dashboard

### **Problem: Link potwierdzający nie działa**

**Przyczyna:** Redirect URL nieprawidłowy

**Rozwiązanie:**

```
1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL: http://localhost:3000 (dev) lub https://twoja-domena.com (prod)
3. Redirect URLs: Dodaj dozwolone URLe
```

---

## 📝 Pliki Utworzone/Zmodyfikowane

### **Nowe:**

```
src/pages/api/auth/register.ts    ✨ Endpoint rejestracji
```

### **Zmodyfikowane:**

```
src/components/auth/RegisterForm.tsx  ✏️ API integration + email info
src/pages/register.astro              ✏️ Auth check
src/components/auth/LoginForm.tsx     ✏️ +registration_success message
```

---

## ✅ Checklist Implementacji

- [x] Endpoint `POST /api/auth/register`
- [x] Walidacja Zod (email, password, confirmPassword)
- [x] RegisterForm z API integration
- [x] Ekran sukcesu z informacją o emailu
- [x] register.astro z auth check
- [x] Komunikat "registration_success" w LoginForm
- [x] Spójność z login flow
- [x] Dokumentacja
- [x] Brak błędów lintowania

---

**Status:** ✅ Rejestracja zaimplementowana zgodnie z best practices!
**Data:** 2024-12-15

**Następny krok:** Testowanie z prawdziwym emailem! 📧
