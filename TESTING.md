# Testing Guide

This document describes the testing setup and best practices for the Tripbook project.

## Tech Stack

- **Unit/Integration Tests**: Vitest + Testing Library
- **E2E Tests**: Playwright

## Project Structure

```
├── tests/
│   ├── unit/              # Unit tests
│   │   ├── components/    # Component tests
│   │   ├── lib/          # Utility & service tests
│   │   └── hooks/        # React hooks tests
│   └── README.md
├── e2e/
│   ├── fixtures/         # Test fixtures & helpers
│   ├── page-objects/     # Page Object Model
│   ├── *.spec.ts        # E2E test files
│   └── README.md
├── src/test/
│   └── setup.ts         # Vitest global setup
├── vitest.config.ts     # Vitest configuration
└── playwright.config.ts # Playwright configuration
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode (recommended during development)
npm run test:unit:watch

# Run tests with UI
npm run test:unit:ui

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Show test report
npm run test:e2e:report

# Generate tests using codegen
npm run test:e2e:codegen
```

## Writing Tests

### Unit Tests

Create test files with `.test.ts` or `.spec.ts` extension:

```typescript
import { describe, it, expect } from "vitest";

describe("MyComponent", () => {
  it("should render correctly", () => {
    expect(true).toBe(true);
  });
});
```

### E2E Tests

Create test files in `e2e/` directory with `.spec.ts` extension:

```typescript
import { test, expect } from "@playwright/test";

test("should load homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Tripbook/);
});
```

#### Using Page Object Model

```typescript
import { test, expect } from "../fixtures";
import { HomePage } from "../page-objects/HomePage";

test("should navigate to trips", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  // ... test logic
});
```

## Best Practices

### Unit Tests (Vitest)

1. **Use descriptive test names** - Test names should clearly describe what is being tested
2. **Follow Arrange-Act-Assert pattern** - Structure tests clearly
3. **Mock external dependencies** - Use `vi.mock()` for external dependencies
4. **Test user behavior** - Use Testing Library to test from user's perspective
5. **Keep tests isolated** - Each test should be independent

### E2E Tests (Playwright)

1. **Use Page Object Model** - Encapsulate page logic in page objects
2. **Use locators wisely** - Prefer user-facing attributes (role, text) over CSS selectors
3. **Wait for elements** - Use Playwright's auto-waiting features
4. **Isolate tests** - Use browser contexts for test isolation
5. **Use fixtures** - Create reusable fixtures for common setup

## Coverage

Coverage reports are generated in the `coverage/` directory when running:

```bash
npm run test:coverage
```

Current coverage thresholds:

- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run unit tests
  run: npm run test:unit

- name: Run E2E tests
  run: npm run test:e2e
```

## Troubleshooting

### Vitest

- **Tests not found**: Check `include` patterns in `vitest.config.ts`
- **Import errors**: Verify path aliases in `vitest.config.ts` match `tsconfig.json`
- **DOM not available**: Ensure `environment: 'jsdom'` is set in config

### Playwright

- **Browser not installed**: Run `npx playwright install chromium`
- **Tests timeout**: Increase timeout in `playwright.config.ts`
- **Flaky tests**: Use proper waiting strategies and avoid arbitrary timeouts

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
