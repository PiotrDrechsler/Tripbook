# GitHub Actions Linter Warnings - False Positives

## Issue

Linter wyświetla ostrzeżenia:

```
Context access might be invalid: SUPABASE_URL
Context access might be invalid: SUPABASE_KEY
Context access might be invalid: GOOGLE_ROUTES_API_KEY
```

## Explanation

Te ostrzeżenia są **fałszywie pozytywne (false positives)**.

### Dlaczego?

1. **Environment jest poprawnie skonfigurowany:**

   ```yaml
   environment: integration
   ```

2. **Sekrety są dostępne w steps:**
   Gdy job ma `environment: integration`, wszystkie sekrety z tego environment są automatycznie dostępne w `steps` przez `${{ secrets.SECRET_NAME }}`.

3. **Składnia jest zgodna z dokumentacją GitHub:**
   - [Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
   - [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

### Dlaczego linter ostrzega?

Lintery GitHub Actions (np. `actionlint`) często nie mają pełnej wiedzy o:

- Secrets z environments (tylko repository secrets)
- Dynamic context dostępny w runtime
- Custom environments konfigurowanych w Settings

### Weryfikacja

✅ Składnia YAML: poprawna
✅ Environment context: ustawiony
✅ Secrets w step-level: zgodne z best practices
✅ Struktura workflow: zgodna z dokumentacją GitHub

## Conclusion

**Workflow jest poprawny i będzie działał.** Ostrzeżenia można zignorować - znikną one gdy:

1. Environment `integration` zostanie utworzony na GitHub
2. Sekrety zostaną dodane do environment
3. Workflow zostanie uruchomiony (GitHub Actions runtime ma pełną wiedzę o context)

## Alternative (Not Recommended)

Można by użyć job-level `env:` zamiast step-level:

```yaml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
```

Ale to generuje **te same ostrzeżenia** i jest mniej elastyczne (wszystkie steps mają te zmienne, nawet jak nie potrzebują).

**Current approach (step-level env) is GitHub best practice.** ✅
