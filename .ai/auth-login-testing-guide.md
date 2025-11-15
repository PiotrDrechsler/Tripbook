# 🧪 Przewodnik Testowania Logowania - Tripbook

## 🎯 Cel Testowania

Weryfikacja pełnej integracji logowania z backendem Astro i Supabase Auth, zgodnie z wymaganiami PRD (US-001).

---

## ⚙️ Przygotowanie Środowiska Testowego

### Krok 1: Weryfikacja Zmiennych Środowiskowych

Upewnij się, że masz plik `.env` w katalogu głównym projektu:

```bash
# .env
SUPABASE_URL=https://twoj-projekt.supabase.co
SUPABASE_KEY=twoj-anon-key
OPENROUTER_API_KEY=twoj-klucz
GOOGLE_ROUTES_API_KEY=twoj-klucz
```

**Sprawdzenie:**

```powershell
# W PowerShell w katalogu projektu
Get-Content .env
```

### Krok 2: Konfiguracja Supabase Dashboard

#### A. Wyłączenie Email Confirmation (zalecane dla MVP)

1. Otwórz [Supabase Dashboard](https://supabase.com/dashboard)
2. Wybierz swój projekt
3. Przejdź do: **Authentication** → **Providers**
4. Kliknij na **Email**
5. **Odznacz** checkbox: **"Confirm email"**
6. Kliknij **Save**

**Dlaczego to ważne?**

- Z włączonym email confirmation: użytkownicy muszą kliknąć link w emailu przed pierwszym logowaniem
- Z wyłączonym: natychmiastowy dostęp po utworzeniu konta (lepsze dla MVP i testowania)

#### B. Utworzenie Użytkownika Testowego

1. W Supabase Dashboard: **Authentication** → **Users**
2. Kliknij **Add User** → **Create new user**
3. Wypełnij formularz:
   - **Email**: `test@tripbook.pl`
   - **Password**: `test123456`
   - **Auto Confirm User**: ✅ **Zaznacz** (ważne!)
4. Kliknij **Create User**

**Weryfikacja:**

- Użytkownik powinien pojawić się na liście
- Kolumna "Email Confirmed At" powinna mieć datę (nie być pusta)

### Krok 3: Uruchomienie Serwera Deweloperskiego

```powershell
# W katalogu projektu
npm run dev
```

**Oczekiwany output:**

```
  🚀  astro  v5.13.7 started in XXms

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose
```

**Serwer powinien działać w tle.**

---

## 🧪 Scenariusze Testowe

### ✅ Test 1: Pomyślne Logowanie

**Cel:** Weryfikacja pełnego flow logowania z przekierowaniem

**Kroki:**

1. Otwórz przeglądarkę: `http://localhost:4321/login`
2. Wypełnij formularz:
   - Email: `test@tripbook.pl`
   - Hasło: `test123456`
3. Kliknij **"Zaloguj się"**

**Oczekiwany rezultat:**

- ✅ Przycisk zmienia się na "Logowanie..."
- ✅ Brak komunikatów błędów
- ✅ Automatyczne przekierowanie do: `http://localhost:4321/trips`
- ✅ Strona `/trips` się ładuje (nawet jeśli pusta lista)

**Weryfikacja w DevTools:**

```javascript
// Otwórz Console (F12)
// Sprawdź cookies:
document.cookie;

// Powinno zawierać coś w stylu:
// "sb-<project-id>-auth-token=..."
```

**Weryfikacja w terminalu serwera:**

- Brak błędów 500
- Możliwe logi: "Session: { ... }"

---

### ❌ Test 2: Nieprawidłowe Hasło

**Cel:** Weryfikacja obsługi błędów autentykacji

**Kroki:**

1. Otwórz: `http://localhost:4321/login`
2. Wypełnij formularz:
   - Email: `test@tripbook.pl`
   - Hasło: `wrongpassword123`
3. Kliknij **"Zaloguj się"**

**Oczekiwany rezultat:**

- ✅ Wyświetlenie czerwonego komunikatu: **"Nieprawidłowy email lub hasło"**
- ✅ Brak przekierowania (pozostajemy na `/login`)
- ✅ Formularz pozostaje aktywny (można spróbować ponownie)
- ✅ Przycisk wraca do stanu "Zaloguj się"

---

### ❌ Test 3: Nieistniejący Użytkownik

**Cel:** Weryfikacja obsługi nieistniejącego emaila

**Kroki:**

1. Otwórz: `http://localhost:4321/login`
2. Wypełnij formularz:
   - Email: `nieistniejacy@example.com`
   - Hasło: `anypassword`
3. Kliknij **"Zaloguj się"**

**Oczekiwany rezultat:**

- ✅ Wyświetlenie komunikatu: **"Nieprawidłowy email lub hasło"** lub **"Użytkownik o podanym adresie email nie istnieje"**
- ✅ Brak przekierowania

**Uwaga:** Komunikat może być ogólny ze względów bezpieczeństwa (zgodnie z opcją B).

---

### 🛡️ Test 4: Walidacja Po Stronie Klienta

**Cel:** Weryfikacja walidacji przed wysłaniem do API

#### Test 4a: Puste Pola

**Kroki:**

1. Otwórz: `http://localhost:4321/login`
2. Pozostaw oba pola puste
3. Kliknij **"Zaloguj się"**

**Oczekiwany rezultat:**

- ✅ Komunikat: **"Wszystkie pola są wymagane"**
- ✅ Brak wywołania API (sprawdź Network tab w DevTools)

#### Test 4b: Nieprawidłowy Format Email

**Kroki:**

1. Otwórz: `http://localhost:4321/login`
2. Wypełnij:
   - Email: `invalid-email-format`
   - Hasło: `test123`
3. Kliknij **"Zaloguj się"**

**Oczekiwany rezultat:**

- ✅ Komunikat: **"Nieprawidłowy format email"**
- ✅ Brak wywołania API

---

### 🔒 Test 5: Middleware - Ochrona Tras

**Cel:** Weryfikacja automatycznych przekierowań przez middleware

#### Test 5a: Dostęp do /trips Bez Logowania

**Kroki:**

1. **Wyloguj się** (jeśli jesteś zalogowany):
   - Otwórz DevTools → Application → Cookies
   - Usuń wszystkie cookies dla localhost:4321
   - Odśwież stronę
2. W pasku adresu wpisz: `http://localhost:4321/trips`
3. Naciśnij Enter

**Oczekiwany rezultat:**

- ✅ Automatyczne przekierowanie do: `http://localhost:4321/login?message=unauthorized`
- ✅ Wyświetlenie niebieskiego komunikatu: **"Musisz się zalogować, aby uzyskać dostęp."**

#### Test 5b: Dostęp do /login Gdy Zalogowany

**Kroki:**

1. Zaloguj się (Test 1)
2. W pasku adresu wpisz: `http://localhost:4321/login`
3. Naciśnij Enter

**Oczekiwany rezultat:**

- ✅ Automatyczne przekierowanie do: `http://localhost:4321/trips`
- ✅ Brak możliwości zobaczenia strony logowania

---

### 🔄 Test 6: Persistencja Sesji

**Cel:** Weryfikacja, że sesja przetrwa odświeżenie strony

**Kroki:**

1. Zaloguj się (Test 1)
2. Będąc na `/trips`, naciśnij **F5** (odśwież stronę)
3. Zamknij kartę i otwórz nową: `http://localhost:4321/trips`

**Oczekiwany rezultat:**

- ✅ Po odświeżeniu: pozostajemy na `/trips`, brak przekierowania do logowania
- ✅ Po otwarciu nowej karty: automatyczne załadowanie `/trips` (jeśli sesja aktywna)

**Weryfikacja:**

- Cookies `sb-*-auth-token` powinny być ustawione z `Max-Age` ~7 dni

---

### 📱 Test 7: Responsywność (Opcjonalnie)

**Cel:** Weryfikacja formularza na różnych rozdzielczościach

**Kroki:**

1. Otwórz: `http://localhost:4321/login`
2. Otwórz DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)
3. Przetestuj na:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

**Oczekiwany rezultat:**

- ✅ Formularz jest czytelny i użyteczny na wszystkich rozdzielczościach
- ✅ Przyciski są klikalne
- ✅ Tekst nie wychodzi poza kontener

---

## 🐛 Troubleshooting - Najczęstsze Problemy

### Problem 1: "Invalid login credentials" mimo poprawnych danych

**Możliwe przyczyny:**

1. ❌ Email confirmation jest włączony, ale użytkownik nie potwierdził emaila
2. ❌ Użytkownik nie ma zaznaczonego "Auto Confirm User"

**Rozwiązanie:**

```
1. Supabase Dashboard → Authentication → Users
2. Znajdź użytkownika test@tripbook.pl
3. Sprawdź kolumnę "Email Confirmed At"
4. Jeśli pusta:
   - Kliknij na użytkownika → Edit
   - Zaznacz "Email Confirmed" → Save
   LUB
   - Wyłącz email confirmation (Test Setup, Krok 2A)
```

### Problem 2: Redirect loop (pętla przekierowań)

**Objawy:**

- Strona ciągle się przeładowuje
- W pasku adresu migają różne URL

**Możliwe przyczyny:**

1. ❌ Middleware nie może odczytać sesji z cookies
2. ❌ Supabase URL/Key nieprawidłowe

**Rozwiązanie:**

```powershell
# 1. Sprawdź zmienne środowiskowe
Get-Content .env

# 2. Sprawdź logi serwera
# W terminalu gdzie działa npm run dev
# Powinny być logi middleware

# 3. Wyczyść cookies i spróbuj ponownie
# DevTools → Application → Cookies → Clear All
```

### Problem 3: Brak przekierowania po logowaniu

**Objawy:**

- Formularz pokazuje "Zalogowano pomyślnie"
- Ale nie ma przekierowania do `/trips`

**Możliwe przyczyny:**

1. ❌ JavaScript error w konsoli
2. ❌ Problem z `window.location.href`

**Rozwiązanie:**

```javascript
// Otwórz Console (F12)
// Sprawdź czy są błędy JavaScript

// Jeśli widzisz błąd związany z window.location:
// Sprawdź LoginForm.tsx, linia 58
```

### Problem 4: "Wystąpił błąd połączenia"

**Objawy:**

- Komunikat błędu: "Wystąpił błąd połączenia. Spróbuj ponownie."

**Możliwe przyczyny:**

1. ❌ Serwer deweloperski nie działa
2. ❌ Endpoint `/api/auth/login` nie istnieje
3. ❌ CORS problem

**Rozwiązanie:**

```powershell
# 1. Sprawdź czy serwer działa
# Otwórz: http://localhost:4321
# Powinno załadować się coś (nawet 404 to OK)

# 2. Sprawdź czy endpoint istnieje
# Sprawdź czy plik istnieje: src/pages/api/auth/login.ts

# 3. Sprawdź Network tab w DevTools
# Kliknij "Zaloguj się" i obserwuj zakładkę Network
# Powinno być żądanie POST do /api/auth/login
```

### Problem 5: TypeScript errors w IDE

**Objawy:**

- Czerwone podkreślenia w VS Code
- Błędy typu "Cannot find module"

**Rozwiązanie:**

```
1. VS Code: Ctrl+Shift+P
2. Wpisz: "TypeScript: Restart TS Server"
3. Enter
4. Poczekaj 5-10 sekund
5. Błędy powinny zniknąć
```

---

## 📊 Checklist Testowania

Zaznacz po wykonaniu każdego testu:

- [ ] **Test 1:** Pomyślne logowanie z przekierowaniem do `/trips`
- [ ] **Test 2:** Nieprawidłowe hasło - wyświetlenie błędu
- [ ] **Test 3:** Nieistniejący użytkownik - wyświetlenie błędu
- [ ] **Test 4a:** Walidacja - puste pola
- [ ] **Test 4b:** Walidacja - nieprawidłowy email
- [ ] **Test 5a:** Middleware - ochrona `/trips` bez logowania
- [ ] **Test 5b:** Middleware - przekierowanie z `/login` gdy zalogowany
- [ ] **Test 6:** Persistencja sesji po odświeżeniu
- [ ] **Test 7:** Responsywność (opcjonalnie)

**Status:** \_\_\_/9 testów przeszło pomyślnie

---

## 🎓 Dodatkowe Testy (Zaawansowane)

### Test API Bezpośrednio (curl/Postman)

```powershell
# Test 1: Poprawne dane
curl -X POST http://localhost:4321/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@tripbook.pl","password":"test123456"}'

# Oczekiwany output:
# {"message":"Zalogowano pomyślnie","user":{"id":"...","email":"test@tripbook.pl"}}

# Test 2: Nieprawidłowe dane
curl -X POST http://localhost:4321/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@tripbook.pl","password":"wrong"}'

# Oczekiwany output:
# {"error":"Unauthorized","message":"Nieprawidłowy email lub hasło"}
```

### Test Walidacji Zod

```powershell
# Test: Brak pola password
curl -X POST http://localhost:4321/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@tripbook.pl"}'

# Oczekiwany output:
# {"error":"Validation error","message":"Hasło jest wymagane","field":"password"}
```

---

## 📞 Pomoc i Wsparcie

Jeśli napotkasz problemy, które nie są opisane w tym przewodniku:

1. **Sprawdź logi serwera** w terminalu gdzie działa `npm run dev`
2. **Sprawdź Console w DevTools** (F12) w przeglądarce
3. **Sprawdź Network tab** w DevTools - czy żądania są wysyłane
4. **Sprawdź Supabase Dashboard** → Logs → API Logs

---

**Powodzenia w testowaniu! 🚀**

Jeśli wszystkie testy przeszły pomyślnie, możesz przejść do implementacji kolejnych komponentów auth (rejestracja, wylogowanie, reset hasła).
