# GitHub Secrets Setup - Krok po kroku

## ⚠️ WAŻNE: Wszystkie sekrety muszą być w "Environment secrets", NIE w "Environment variables"!

### Krok 1: Przejdź do GitHub Environments

1. Otwórz swoje repozytorium na GitHub
2. Kliknij **Settings** (górne menu)
3. W lewym menu kliknij **Environments**
4. Kliknij na environment **integration**

### Krok 2: Usuń błędne zmienne (jeśli istnieją)

W sekcji **Environment variables** (DOLNA sekcja):

- Jeśli widzisz `E2E_USERNAME` - kliknij ikonę kosza i usuń
- Jeśli widzisz `E2E_PASSWORD` - kliknij ikonę kosza i usuń

**Zmienne muszą być w "Environment secrets", nie w "Environment variables"!**

### Krok 3: Dodaj WSZYSTKIE sekrety w "Environment secrets"

W sekcji **Environment secrets** (GÓRNA sekcja), dodaj 5 sekretów:

#### 1. SUPABASE_URL

- Kliknij **Add environment secret**
- Name: `SUPABASE_URL`
- Value: Twój ZDALNY URL Supabase (np. `https://xxxxx.supabase.co`)
  - **NIE UŻYWAJ** `http://127.0.0.1:54321` - to jest tylko dla lokalnych testów!
  - Znajdziesz w [Supabase Dashboard](https://app.supabase.com) → Twój projekt → Settings → API → Project URL
- Kliknij **Add secret**

#### 2. SUPABASE_KEY

- Kliknij **Add environment secret**
- Name: `SUPABASE_KEY`
- Value: Twój anon/public key z Supabase
  - Znajdziesz w [Supabase Dashboard](https://app.supabase.com) → Twój projekt → Settings → API → Project API keys → `anon` `public`
- Kliknij **Add secret**

#### 3. GOOGLE_ROUTES_API_KEY

- Kliknij **Add environment secret**
- Name: `GOOGLE_ROUTES_API_KEY`
- Value: Twój Google Routes API key
  - Znajdziesz w [Google Cloud Console](https://console.cloud.google.com)
- Kliknij **Add secret**

#### 4. E2E_USERNAME

- Kliknij **Add environment secret**
- Name: `E2E_USERNAME`
- Value: Email testowego użytkownika (np. `pdrech@gmail.com`)
- Kliknij **Add secret**

#### 5. E2E_PASSWORD

- Kliknij **Add environment secret**
- Name: `E2E_PASSWORD`
- Value: Hasło testowego użytkownika (np. `test123`)
- Kliknij **Add secret**

### Krok 4: Sprawdź użytkownika w Supabase

1. Przejdź do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt
3. Kliknij **Authentication** → **Users**
4. Sprawdź czy użytkownik z emailem `pdrech@gmail.com` istnieje
5. Jeśli nie - kliknij **Add user** i dodaj:
   - Email: `pdrech@gmail.com`
   - Password: `test123`
   - Auto Confirm User: ✅ (zaznacz!)

### Krok 5: Weryfikacja

Po dodaniu wszystkich sekretów powinieneś widzieć w **Environment secrets**:

✅ SUPABASE_URL  
✅ SUPABASE_KEY  
✅ GOOGLE_ROUTES_API_KEY  
✅ E2E_USERNAME  
✅ E2E_PASSWORD

A w **Environment variables** powinno być **PUSTE** (lub możesz tam mieć inne zmienne, ale NIE te 5 powyżej).

### Krok 6: Uruchom workflow ponownie

1. Przejdź do zakładki **Actions**
2. Znajdź ostatni nieudany workflow
3. Kliknij **Re-run jobs** → **Re-run failed jobs**

## Troubleshooting

### Problem: "E2E_USERNAME and E2E_PASSWORD must be set"

**Przyczyna:** Sekrety są w "Environment variables" zamiast "Environment secrets"

**Rozwiązanie:**

1. Usuń z "Environment variables"
2. Dodaj do "Environment secrets" (patrz Krok 3)

### Problem: "connect ECONNREFUSED 127.0.0.1:54321"

**Przyczyna:** `SUPABASE_URL` wskazuje na lokalny Supabase

**Rozwiązanie:**

1. Sprawdź secret `SUPABASE_URL` w GitHub
2. Upewnij się że jest to URL zdalny (np. `https://xxxxx.supabase.co`)
3. NIE powinno być `http://127.0.0.1:54321`

### Problem: Testy nadal nie działają

1. Sprawdź czy wszystkie 5 sekretów są w **Environment secrets** (GÓRNA sekcja)
2. Sprawdź czy environment nazywa się dokładnie `integration` (małe litery)
3. Sprawdź czy użytkownik testowy istnieje w Supabase i jest potwierdzony

## ❓ Pytania?

Jeśli nadal masz problemy:

1. Zrób screenshot sekcji "Environment secrets" w GitHub
2. Sprawdź czy użytkownik istnieje w Supabase Authentication
3. Uruchom workflow ponownie po dodaniu sekretów
