# GitHub Environments Setup Guide

## Krok 1: Utworzenie Environment

1. Przejdź do swojego repozytorium na GitHub
2. Kliknij **Settings** (w górnym menu repozytorium)
3. W lewym menu wybierz **Environments**
4. Kliknij przycisk **New environment**
5. Nazwa environment: `integration`
6. Kliknij **Configure environment**

## Krok 2: Dodanie Sekretów

W sekcji **Environment secrets** dodaj następujące sekrety:

### SUPABASE_URL
1. Kliknij **Add secret**
2. Name: `SUPABASE_URL`
3. Value: Twój URL z Supabase (np. `https://xxxxx.supabase.co`)
4. Kliknij **Add secret**

### SUPABASE_KEY
1. Kliknij **Add secret**
2. Name: `SUPABASE_KEY`
3. Value: Twój anon/public key z Supabase
4. Kliknij **Add secret**

### GOOGLE_ROUTES_API_KEY
1. Kliknij **Add secret**
2. Name: `GOOGLE_ROUTES_API_KEY`
3. Value: Twój Google Routes API key
4. Kliknij **Add secret**

### E2E_USERNAME
1. Kliknij **Add secret**
2. Name: `E2E_USERNAME`
3. Value: Email testowego użytkownika do testów E2E (np. `test@example.com`)
4. Kliknij **Add secret**

### E2E_PASSWORD
1. Kliknij **Add secret**
2. Name: `E2E_PASSWORD`
3. Value: Hasło testowego użytkownika do testów E2E
4. Kliknij **Add secret**

## Krok 3: (Opcjonalnie) Konfiguracja Protection Rules

Możesz dodać dodatkowe zabezpieczenia:

### Required reviewers
- Kliknij **Required reviewers**
- Dodaj użytkowników, którzy muszą zatwierdzić deployment do tego environment

### Wait timer
- Ustaw czas oczekiwania przed uruchomieniem jobów w tym environment
- Przydatne dla production environments

### Deployment branches
- **Selected branches** → dodaj `master`
- To ograniczy environment tylko do brancha master

## Krok 4: Weryfikacja

Po skonfigurowaniu, sprawdź czy wszystko działa:

1. Utwórz Pull Request do brancha `master`
2. Workflow `Pull Request CI` powinien się automatycznie uruchomić
3. Sprawdź zakładkę **Actions** w repozytorium
4. Zweryfikuj czy wszystkie joby się wykonały:
   - ✅ Lint
   - ✅ Unit Tests (coverage uploaded)
   - ✅ E2E Tests (results uploaded)
   - ✅ Status Comment (komentarz w PR)

## Troubleshooting

### "Resource not accessible by integration" error
- Sprawdź uprawnienia workflow w Settings → Actions → General
- Upewnij się że włączone jest: **Read and write permissions**

### E2E testy nie mają dostępu do sekretów
- Zweryfikuj czy sekrety są dodane w environment `integration`, nie w repository secrets
- Sprawdź czy nazwa environment w workflow (`environment: integration`) jest dokładnie taka sama

### Brak komentarza w PR
- Sprawdź czy w Settings → Actions → General → Workflow permissions
- Zaznacz: **Allow GitHub Actions to create and approve pull requests**

## Gdzie Znaleźć Wartości Sekretów?

### Supabase
1. Przejdź do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt
3. Settings → API
4. **Project URL** → skopiuj do `SUPABASE_URL`
5. **Project API keys** → `anon` `public` → skopiuj do `SUPABASE_KEY`

### Google Routes API
1. Przejdź do [Google Cloud Console](https://console.cloud.google.com)
2. Wybierz swój projekt
3. APIs & Services → Credentials
4. Znajdź swój API key dla Routes API
5. Skopiuj do `GOOGLE_ROUTES_API_KEY`

### E2E Test Credentials
1. Utwórz testowego użytkownika w swojej Supabase bazie danych (lub użyj istniejącego)
2. Email użytkownika → skopiuj do `E2E_USERNAME`
3. Hasło użytkownika → skopiuj do `E2E_PASSWORD`

**Uwaga:** To powinien być dedykowany użytkownik testowy, NIE twoje główne konto!

## Bezpieczeństwo

⚠️ **NIGDY** nie commituj sekretów do repozytorium!

✅ Używaj GitHub Secrets dla wrażliwych danych
✅ Environments zapewniają dodatkową warstwę bezpieczeństwa
✅ Możesz ograniczyć dostęp do environments przez required reviewers
✅ Logi GitHub Actions automatycznie maskują sekrety

## Dodatkowe Zasoby

- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
