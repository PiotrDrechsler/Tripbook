# Quick Start - Testing

This guide will help you quickly get started with testing in Tripbook.

## 🚀 Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode (recommended for development)
npm run test:unit:watch

# Run tests with UI interface
npm run test:unit:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# First, build the project
npm run build

# Run E2E tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui

# Generate test cases with Playwright
npm run test:e2e:codegen
```

## 📝 Writing Your First Test

### Unit Test Example

Create a file `src/lib/myFunction.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "./myFunction";

describe("myFunction", () => {
  it("should return expected value", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Component Test Example

Create a file `tests/unit/components/MyComponent.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render text', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Example

Create a file `e2e/my-feature.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("should navigate to homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Tripbook/);
});
```

## 🛠️ Test Structure

```
project/
├── tests/
│   └── unit/
│       ├── components/    # React component tests
│       ├── lib/          # Utility & service tests
│       └── example.test.ts
├── e2e/
│   ├── fixtures/         # Shared test fixtures
│   ├── page-objects/     # Page Object Models
│   └── *.spec.ts        # E2E test files
└── src/test/
    └── setup.ts         # Global test setup
```

## 📚 Next Steps

- Read [TESTING.md](TESTING.md) for detailed documentation
- Check out existing tests in `tests/` and `e2e/` directories
- Review Vitest docs: https://vitest.dev/
- Review Playwright docs: https://playwright.dev/

## 🐛 Debugging

### Unit Tests

```bash
# Run specific test file
npm run test:unit -- coordinates.test.ts

# Run tests matching pattern
npm run test:unit -- -t "should format"

# Debug in UI mode
npm run test:unit:ui
```

### E2E Tests

```bash
# Run specific test file
npm run test:e2e -- home.spec.ts

# Debug mode (step through tests)
npm run test:e2e:debug

# View last test run report
npm run test:e2e:report
```

## 💡 Tips

1. **Watch Mode**: Use `npm run test:unit:watch` during development
2. **Coverage**: Run `npm run test:coverage` before committing
3. **UI Mode**: Use UI modes for debugging complex tests
4. **Page Objects**: Always use Page Object Model for E2E tests
5. **Isolation**: Keep tests independent and isolated

Happy Testing! 🎉
