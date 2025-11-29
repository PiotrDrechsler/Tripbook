# E2E Tests

End-to-end tests using Playwright with Page Object Model pattern.

## 📁 Structure

```
e2e/
├── fixtures/
│   ├── index.ts          # Page Object fixtures
│   └── trip-data.ts      # Test data constants
├── page-objects/
│   ├── BasePage.ts       # Base class for all page objects
│   ├── HomePage.ts       # Home page POM
│   ├── TripsPage.ts      # Trips list page POM
│   ├── CreateTripModal.ts # Create trip modal POM
│   ├── index.ts          # Central export point
│   └── README.md         # Detailed POM documentation
├── *.spec.ts             # Test files
└── README.md             # This file
```

## 🚀 Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test create-trip

# Run E2E tests in UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Show test report
npm run test:e2e:report

# Generate and open HTML report
npx playwright show-report
```

## 🎯 Available Test Suites

### 1. Smoke Tests (`smoke.spec.ts`)

Basic tests to verify the application is running:

- Application loads without errors
- No console errors on homepage
- Meta tags are correct

### 2. Create Trip Flow (`create-trip.spec.ts`)

Complete scenario for creating a new trip:

- Opening create trip modal
- Form validation (required fields, length limits)
- Coordinates extraction from mapy.cz links
- Successful trip creation
- Modal closing behaviors

### 3. Home Page Tests (`home.spec.ts`)

Tests for the landing page

## 🏗️ Page Object Model (POM)

This project uses the Page Object Model pattern for maintainable and reusable E2E tests.

### Key Benefits:

- ✅ **Maintainability** - Changes in UI require updates in one place
- ✅ **Reusability** - Page objects can be shared across tests
- ✅ **Readability** - Tests read like user stories
- ✅ **Type Safety** - Full TypeScript support

### Available Page Objects:

#### BasePage

Base class with common functionality for all pages.

#### TripsPage

Represents the trips list page (`/trips`).

- Navigate to trips page
- Click "Add Trip" button
- Sort trips by date/distance/duration
- Pagination controls
- Select trips from list

#### CreateTripModal

Represents the create trip modal.

- Fill form fields (name, description, map URL, date)
- Submit/cancel actions
- Validation error handling
- Coordinates extraction feedback

### Using Page Objects with Fixtures

Tests automatically receive initialized page objects via fixtures:

```typescript
import { test, expect } from "./fixtures";

test("my test", async ({ tripsPage, createTripModal }) => {
  // Page objects are ready to use!
  await tripsPage.goto();
  await tripsPage.clickAddTrip();
  await createTripModal.fillName("Test Trip");
});
```

For detailed documentation, see [page-objects/README.md](./page-objects/README.md).

## 🧪 Test Data

Test data constants are available in `fixtures/trip-data.ts`:

```typescript
import { validTripData, generateRandomTripName } from "./fixtures/trip-data";

test("create trip", async ({ createTripModal }) => {
  await createTripModal.createTrip(validTripData.complete);
  // or
  const tripName = generateRandomTripName();
});
```

### Available Data:

- `validTripData` - Valid trip data for successful creation
- `invalidTripData` - Invalid data for validation tests
- `mapyLinks` - Valid and invalid mapy.cz URLs
- `dateFormats` - Date format examples
- `validationErrorMessages` - Expected error messages
- `coordinates` - Sample coordinate data
- `generateRandomTripName()` - Random trip name generator
- `generateTripData()` - Complete trip data generator

## 🔍 Data Test IDs

All critical UI elements have `data-testid` attributes for stable selectors:

### Action Buttons:

- `add-trip-button` - Open create trip modal
- `submit-trip-button` - Submit trip form
- `cancel-trip-button` - Cancel trip creation

### Form Inputs:

- `trip-name-input` - Trip name field
- `trip-description-input` - Trip description field
- `trip-map-url-input` - Map URL field
- `trip-date-input` - Trip date field

### Validation Errors:

- `trip-name-error` - Name validation error
- `trip-description-error` - Description validation error
- `trip-map-url-error` - Map URL validation error
- `trip-date-error` - Date validation error
- `form-error` - General form error

### Coordinate States:

- `coordinates-loading` - Loading coordinates
- `coordinates-error` - Coordinates extraction error
- `coordinates-success` - Coordinates extracted successfully

### Containers:

- `create-trip-modal` - Modal container
- `create-trip-form` - Form container

## 📝 Writing New Tests

### 1. Basic test with page objects:

```typescript
import { test, expect } from "./fixtures";

test("my new test", async ({ tripsPage, createTripModal }) => {
  // Navigate
  await tripsPage.goto();

  // Interact
  await tripsPage.clickAddTrip();
  await createTripModal.fillName("My Trip");
  await createTripModal.submit();

  // Assert
  await expect(tripsPage.getTripByName("My Trip")).toBeVisible();
});
```

### 2. Using test data:

```typescript
import { test, expect } from "./fixtures";
import { validTripData } from "./fixtures/trip-data";

test("create with valid data", async ({ tripsPage, createTripModal }) => {
  await tripsPage.goto();
  await tripsPage.clickAddTrip();
  await createTripModal.createTrip(validTripData.complete);
});
```

### 3. Testing validation:

```typescript
import { test, expect } from "./fixtures";
import { invalidTripData, validationErrorMessages } from "./fixtures/trip-data";

test("validate name length", async ({ tripsPage, createTripModal }) => {
  await tripsPage.goto();
  await tripsPage.clickAddTrip();

  await createTripModal.fillWithInvalidData(invalidTripData.nameTooLong);
  await createTripModal.submit();

  await expect(createTripModal.nameError).toBeVisible();
  const errorText = await createTripModal.getNameError();
  expect(errorText).toContain(validationErrorMessages.name.tooLong);
});
```

## 🎨 Best Practices

1. **Use Page Objects** - Don't write selectors in tests
2. **Use Fixtures** - Let Playwright inject page objects
3. **Use Test Data** - Import from `fixtures/trip-data.ts`
4. **Use data-testid** - Most stable selector strategy
5. **Wait Properly** - Page objects handle waits automatically
6. **Isolate Tests** - Each test should be independent
7. **Descriptive Names** - Test names should explain what they test
8. **Arrange-Act-Assert** - Follow AAA pattern

## 🐛 Debugging Tests

```bash
# Run in debug mode with Playwright Inspector
npx playwright test --debug

# Run specific test in debug mode
npx playwright test create-trip --debug

# Run with headed browser to see what's happening
npx playwright test --headed

# Generate trace for failed tests
npx playwright test --trace on
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

The report includes:

- Test results and timings
- Screenshots on failure
- Traces for debugging
- Browser console logs

## 🔧 Configuration

E2E test configuration is in `playwright.config.ts` at the project root.

Key settings:

- Base URL: `http://localhost:4321`
- Browsers: Chromium, Firefox, WebKit
- Retries: 2 (in CI), 0 (locally)
- Screenshots: On failure
- Traces: On first retry
- Video: On failure

## 📚 Further Reading

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Guide](./page-objects/README.md)
- [Test Plan](./../.ai/test-plan.md)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
