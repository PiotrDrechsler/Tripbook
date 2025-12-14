# Cloudflare Deployment - GitHub Secrets Setup

## Wymagane sekrety dla deployment do Cloudflare Pages

### Gdzie dodać sekrety?

Sekrety dla deploymentu muszą być w **Repository secrets** (nie environment secrets):

1. Idź do swojego repo na GitHub
2. Kliknij **Settings** (górne menu)
3. W lewym menu kliknij **Secrets and variables** → **Actions**
4. Kliknij **New repository secret**

---

## Sekrety do dodania

### 1. CLOUDFLARE_API_TOKEN

**Jak zdobyć:**

1. Idź do [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Kliknij na swoje konto (prawy górny róg) → **My Profile**
3. W lewym menu kliknij **API Tokens**
4. Kliknij **Create Token**
5. Użyj template **Edit Cloudflare Workers** lub stwórz custom token z:
   - **Permissions:**
     - Account → Cloudflare Pages → Edit
   - **Account Resources:**
     - Include → Twoje konto
6. Kliknij **Continue to summary** → **Create Token**
7. **Skopiuj token** (pokaże się tylko raz!)

**W GitHub:**

- Name: `CLOUDFLARE_API_TOKEN`
- Value: [wklej token z Cloudflare]

---

### 2. CLOUDFLARE_ACCOUNT_ID

**Jak zdobyć:**

1. Idź do [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Wybierz swoje konto
3. W prawym sidebar zobaczysz **Account ID**
4. Skopiuj ten ID (format: `1234567890abcdef`)

**W GitHub:**

- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: [wklej Account ID]

---

### 3. SUPABASE_URL (jeśli jeszcze nie dodany)

**Jak zdobyć:**

1. Idź do [Supabase Dashboard](https://app.supabase.com/)
2. Wybierz swój projekt
3. Idź do **Settings** → **API**
4. Skopiuj **Project URL** (np. `https://xxxxx.supabase.co`)

**W GitHub:**

- Name: `SUPABASE_URL`
- Value: [wklej URL]

---

### 4. SUPABASE_KEY (jeśli jeszcze nie dodany)

**Jak zdobyć:**

1. W tym samym miejscu co powyżej (Supabase → Settings → API)
2. Skopiuj **anon/public** key (długi token)

**W GitHub:**

- Name: `SUPABASE_KEY`
- Value: [wklej klucz]

---

### 5. GOOGLE_ROUTES_API_KEY (jeśli jeszcze nie dodany)

**Jak zdobyć:**

1. Idź do [Google Cloud Console](https://console.cloud.google.com/)
2. Wybierz swój projekt (lub stwórz nowy)
3. Idź do **APIs & Services** → **Credentials**
4. Skopiuj swój API key dla Routes API

**W GitHub:**

- Name: `GOOGLE_ROUTES_API_KEY`
- Value: [wklej klucz]

---

## Utworzenie projektu na Cloudflare Pages (jeśli nie masz)

### Opcja A: Ręcznie przez Cloudflare Dashboard

1. Idź do [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. W lewym menu kliknij **Workers & Pages**
3. Kliknij **Create application** → **Pages**
4. Kliknij **Create using direct upload**
5. Nazwij projekt: `tripbook` (lub inna nazwa - zapamiętaj ją!)
6. Kliknij **Create project**

### Opcja B: Automatycznie przez Wrangler (przy pierwszym deployu)

Wrangler utworzy projekt automatycznie podczas pierwszego deploymentu, jeśli projekt o podanej nazwie nie istnieje.

---

## Weryfikacja

Po dodaniu wszystkich sekretów w **Repository secrets** powinieneś widzieć:

✅ CLOUDFLARE_API_TOKEN  
✅ CLOUDFLARE_ACCOUNT_ID  
✅ SUPABASE_URL  
✅ SUPABASE_KEY  
✅ GOOGLE_ROUTES_API_KEY

---

## Troubleshooting

### Błąd: "Unknown arguments: compatibility-date"

**Przyczyna:** Starsza wersja Wrangler nie wspiera tej flagi

**Rozwiązanie:** Flaga została usunięta z workflow - komenda teraz wygląda tak:

```
pages deploy dist --project-name=tripbook
```

### Błąd: "project-name is empty"

**Przyczyna:** Secret `CLOUDFLARE_PROJECT_NAME` nie jest ustawiony

**Rozwiązanie:** Nazwa projektu jest teraz hardcoded w workflow jako `tripbook`. Jeśli chcesz inną nazwę, edytuj `.github/workflows/master.yml` i zmień `tripbook` na swoją nazwę.

### Błąd: "Unauthorized" lub "Invalid API Token"

**Przyczyna:** Token nie ma odpowiednich uprawnień

**Rozwiązanie:**

1. Sprawdź czy token ma uprawnienia **Cloudflare Pages → Edit**
2. Sprawdź czy token nie wygasł
3. Wygeneruj nowy token i zaktualizuj secret w GitHub

### Błąd: "Project not found"

**Przyczyna:** Projekt o nazwie `tripbook` nie istnieje na Cloudflare

**Rozwiązanie:**

1. Utwórz projekt ręcznie (patrz "Opcja A" powyżej)
2. Lub wrangler utworzy go automatycznie przy pierwszym deployu

---

## Nazwa projektu

Aktualnie workflow używa nazwy: **`tripbook`**

Jeśli chcesz użyć innej nazwy:

1. Utwórz projekt na Cloudflare z wybraną nazwą
2. Edytuj `.github/workflows/master.yml`
3. Znajdź linię: `command: pages deploy dist --project-name=tripbook`
4. Zmień `tripbook` na swoją nazwę
