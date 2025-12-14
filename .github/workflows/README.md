# GitHub Actions Workflows

## Pull Request CI (`pull-request.yml`)

Automatyczny workflow uruchamiany przy każdym Pull Requestie do brancha `master`.

### Struktura Workflow

```
lint (sekwencyjnie)
  ↓
├─ unit-test (równolegle)
└─ e2e-test (równolegle)
  ↓
status-comment (tylko po sukcesie wszystkich poprzednich)
```

### Jobs

#### 1. `lint` - Lintowanie kodu
- Sprawdza jakość kodu za pomocą ESLint
- Timeout: 10 minut
- Musi zakończyć się sukcesem przed uruchomieniem testów

#### 2. `unit-test` - Testy jednostkowe (równolegle z e2e)
- Uruchamia testy jednostkowe z Vitest
- Zbiera coverage (pokrycie kodu)
- Timeout: 15 minut
- Wymaga: `lint` ✅
- Artifacts: `unit-test-coverage/` (30 dni)

#### 3. `e2e-test` - Testy E2E (równolegle z unit)
- Uruchamia testy E2E z Playwright
- Używa przeglądarki Chromium (wg `playwright.config.ts`)
- Environment: `integration`
- Timeout: 30 minut
- Wymaga: `lint` ✅
- Artifacts: 
  - `e2e-test-results/` - wyniki testów i raporty
  - `e2e-test-coverage/` - pokrycie kodu (30 dni)

**Wymagane sekrety środowiska `integration`:**
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GOOGLE_ROUTES_API_KEY`

#### 4. `status-comment` - Komentarz statusu
- Dodaje/aktualizuje komentarz w PR z podsumowaniem
- Uruchamia się tylko gdy wszystkie poprzednie joby zakończą się sukcesem
- Wymaga: `lint` ✅, `unit-test` ✅, `e2e-test` ✅
- Timeout: 5 minut

### Wymagane Sekrety

Skonfiguruj w GitHub Settings → Environments → `integration`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
GOOGLE_ROUTES_API_KEY=your-api-key
```

### Konfiguracja Environment

1. Przejdź do **Settings** → **Environments**
2. Utwórz environment `integration`
3. Dodaj zmienne/sekrety wymienione powyżej
4. (Opcjonalnie) Dodaj protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches: `master` only

### Użyte GitHub Actions

| Action | Wersja | Opis |
|--------|--------|------|
| `actions/checkout` | v6 | Checkout repozytorium |
| `actions/setup-node` | v6 | Instalacja Node.js (wersja z `.nvmrc`) |
| `actions/upload-artifact` | v6 | Upload artifacts (coverage, raporty) |
| `actions/github-script` | v8 | Tworzenie komentarzy w PR |

### Przykładowy Komentarz w PR

```markdown
## 🎉 All checks passed!

### CI/CD Status Report

| Job | Status | Result |
|-----|--------|--------|
| Lint | ✅ | `success` |
| Unit Tests | ✅ | `success` |
| E2E Tests | ✅ | `success` |

---

✨ This PR is ready for review!

<details>
<summary>View Details</summary>

- **Workflow Run:** [#123](link)
- **Commit:** abc123
- **Triggered by:** @username

</details>
```

### Timeouts

- **Lint:** 10 minut
- **Unit Tests:** 15 minut
- **E2E Tests:** 30 minut
- **Status Comment:** 5 minut

### Artifacts Retention

Wszystkie artifacts są przechowywane przez **30 dni**.

### Troubleshooting

#### E2E testy się nie uruchamiają
- Sprawdź czy environment `integration` jest poprawnie skonfigurowany
- Zweryfikuj czy wszystkie sekrety są ustawione
- Sprawdź logi budowania aplikacji (`npm run build`)

#### Brak komentarza w PR
- Sprawdź czy workflow ma uprawnienia `pull-requests: write`
- Zweryfikuj czy poprzednie joby zakończyły się sukcesem

#### Problemy z cache
- GitHub automatycznie zarządza cache dla `npm ci`
- W razie problemów, usuń cache w Settings → Actions → Caches
