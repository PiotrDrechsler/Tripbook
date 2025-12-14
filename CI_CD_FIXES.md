# CI/CD Fixes - Naprawione Błędy

## Data: 14 grudnia 2025

## Naprawione Problemy

### 1. ❌ Node.js Version Issue (Unit Tests)
**Błąd:**
```
Error: No such built-in module: node:inspector/promises
```

**Przyczyna:** 
- Projekt używał Node.js 18
- Nowe wersje `@supabase/supabase-js` i `vitest` wymagają Node.js 20+

**Rozwiązanie:**
- Zaktualizowano `.nvmrc` z `18` na `20`
- Wszystkie GitHub Actions będą teraz używać Node.js 20

### 2. ❌ Missing E2E Test Credentials
**Błąd:**
```
Error: E2E_USERNAME and E2E_PASSWORD must be set in .env.test file
```

**Przyczyna:**
- E2E testy wymagają zmiennych środowiskowych `E2E_USERNAME` i `E2E_PASSWORD`
- Te sekrety nie były przekazywane z GitHub Secrets do workflow

**Rozwiązanie:**
- Zaktualizowano `.github/workflows/pull-request.yml`
- Dodano przekazywanie sekretów `E2E_USERNAME` i `E2E_PASSWORD` do testów E2E

## Zmiany w Plikach

### 1. `.nvmrc`
```diff
- 18
+ 20
```

### 2. `.github/workflows/pull-request.yml`
```diff
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
          GOOGLE_ROUTES_API_KEY: ${{ secrets.GOOGLE_ROUTES_API_KEY }}
+         E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
+         E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
          CI: true
```

### 3. `.github/GITHUB_SETUP.md`
- Dodano sekcję konfiguracji `E2E_USERNAME` i `E2E_PASSWORD`
- Dodano instrukcje jak stworzyć testowego użytkownika

## Co Musisz Teraz Zrobić?

### Krok 1: Zaktualizuj Node.js lokalnie
```bash
# Jeśli używasz nvm
nvm install 20
nvm use 20

# Sprawdź wersję
node --version  # powinno być v20.x.x
```

### Krok 2: Przeinstaluj zależności
```bash
# Usuń stare zależności
rm -rf node_modules package-lock.json

# Zainstaluj ponownie z Node.js 20
npm install
```

### Krok 3: Dodaj Sekrety E2E w GitHub

1. Przejdź do GitHub → Twoje Repozytorium → **Settings**
2. W lewym menu: **Environments**
3. Wybierz environment `integration`
4. Dodaj dwa nowe sekrety:

#### E2E_USERNAME
- Kliknij **Add secret**
- Name: `E2E_USERNAME`
- Value: Email testowego użytkownika (np. `test@tripbook.com`)
- Kliknij **Add secret**

#### E2E_PASSWORD
- Kliknij **Add secret**
- Name: `E2E_PASSWORD`
- Value: Hasło testowego użytkownika (np. silne hasło)
- Kliknij **Add secret**

### Krok 4: Stwórz Testowego Użytkownika w Supabase

Jeśli nie masz jeszcze testowego użytkownika:

1. Przejdź do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt
3. Authentication → Users → **Add user**
4. Dodaj email i hasło
5. Te same dane użyj w sekretach GitHub (krok 3)

### Krok 5: Przetestuj Lokalnie
```bash
# Upewnij się że masz .env.test z prawidłowymi danymi
npm run test:coverage  # Unit tests
npm run test:e2e      # E2E tests
```

### Krok 6: Commit i Push
```bash
git add .
git commit -m "fix: upgrade to Node.js 20 and add E2E credentials to CI/CD"
git push
```

### Krok 7: Sprawdź GitHub Actions
- Przejdź do zakładki **Actions** w GitHub
- Workflow powinien się uruchomić automatycznie
- Wszystkie testy powinny przejść ✅

## Podsumowanie Sekretów GitHub

Po wykonaniu wszystkich kroków, powinieneś mieć następujące sekrety w environment `integration`:

| Secret Name | Opis | Gdzie znaleźć |
|-------------|------|---------------|
| `SUPABASE_URL` | URL projektu Supabase | Supabase Dashboard → Settings → API |
| `SUPABASE_KEY` | Anon/Public key | Supabase Dashboard → Settings → API |
| `GOOGLE_ROUTES_API_KEY` | API key Google Routes | Google Cloud Console |
| `E2E_USERNAME` | Email testowego użytkownika | Supabase Auth lub własny |
| `E2E_PASSWORD` | Hasło testowego użytkownika | Supabase Auth lub własny |

## Sprawdź czy wszystko działa

Po wykonaniu wszystkich kroków:

✅ Unit tests powinny przejść (Node.js 20+)  
✅ E2E tests powinny przejść (credentials dostępne)  
✅ Lint powinien przejść  
✅ Bot powinien dodać komentarz do PR z wynikami  

## Dodatkowe Zasoby

- Szczegółowy guide: `.github/GITHUB_SETUP.md`
- Dokumentacja Node.js 20: https://nodejs.org/en/blog/release/v20.0.0
- GitHub Actions Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets

## Potrzebujesz Pomocy?

Jeśli nadal masz problemy:
1. Sprawdź logi w GitHub Actions (zakładka Actions)
2. Upewnij się że wszystkie 5 sekretów jest dodane w environment `integration`
3. Sprawdź czy Node.js 20 jest zainstalowany lokalnie (`node --version`)
