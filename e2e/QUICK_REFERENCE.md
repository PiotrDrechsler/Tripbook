# Page Object Model - Quick Reference

## 🚀 Quick Start

```typescript
import { test, expect } from "./fixtures";

test("create trip", async ({ tripsPage, createTripModal }) => {
  await tripsPage.goto();
  await tripsPage.clickAddTrip();

  await createTripModal.createTrip({
    name: "Test Trip",
    mapUrl: "https://mapy.cz/s/hokakucoto",
  });
});
```

## 📋 Cheat Sheet

### TripsPage

```typescript
// Navigation
await tripsPage.goto();

// Actions
await tripsPage.clickAddTrip();
await tripsPage.selectTripByName("Trip Name");
await tripsPage.sortByDate();
await tripsPage.sortByDistance();
await tripsPage.sortByDuration();
await tripsPage.goToNextPage();
await tripsPage.goToPreviousPage();

// Queries
await tripsPage.isLoaded();
await tripsPage.hasEmptyState();
await tripsPage.hasPagination();
const trip = tripsPage.getTripByName("Trip Name");
const trips = await tripsPage.getTripItems();
```

### CreateTripModal

```typescript
// Wait for modal
await createTripModal.waitForModal();
await createTripModal.isOpen();

// Fill form
await createTripModal.fillName("Trip Name");
await createTripModal.fillDescription("Description");
await createTripModal.fillMapUrl("https://mapy.cz/s/hokakucoto");
await createTripModal.fillDate("2025-12-15");

// Coordinates
await createTripModal.waitForCoordinatesSuccess();
await createTripModal.isCoordinatesLoading();
await createTripModal.hasCoordinatesSuccess();
await createTripModal.hasCoordinatesError();

// Validation
await createTripModal.hasNameError();
const error = await createTripModal.getNameError();

// Actions
await createTripModal.submit();
await createTripModal.cancel();
await createTripModal.close();
await createTripModal.waitForClose();

// High-level
await createTripModal.createTrip({
  name: "Trip",
  description: "Desc",
  mapUrl: "https://mapy.cz/s/hokakucoto",
  date: "2025-12-15",
});
```

## 🎯 Common Patterns

### Pattern 1: Create Trip

```typescript
test("create trip", async ({ tripsPage, createTripModal }) => {
  await tripsPage.goto();
  await tripsPage.clickAddTrip();
  await createTripModal.createTrip({
    name: "My Trip",
    mapUrl: "https://mapy.cz/s/hokakucoto",
  });
  await expect(tripsPage.getTripByName("My Trip")).toBeVisible();
});
```

### Pattern 2: Validation Test

```typescript
test("validate field", async ({ tripsPage, createTripModal }) => {
  await tripsPage.goto();
  await tripsPage.clickAddTrip();
  await createTripModal.fillName("A".repeat(101));
  await createTripModal.submit();
  await expect(createTripModal.nameError).toBeVisible();
});
```

### Pattern 3: Close Modal

```typescript
test("close modal", async ({ tripsPage, createTripModal }) => {
  await tripsPage.goto();
  await tripsPage.clickAddTrip();
  await createTripModal.fillName("Test");
  await createTripModal.cancel();
  await createTripModal.waitForClose();
});
```

### Pattern 4: Coordinates Extraction

```typescript
test("extract coordinates", async ({ tripsPage, createTripModal }) => {
  await tripsPage.goto();
  await tripsPage.clickAddTrip();
  await createTripModal.fillMapUrl("https://mapy.cz/s/hokakucoto");
  await createTripModal.waitForCoordinatesSuccess();
  await expect(createTripModal.coordinatesSuccess).toBeVisible();
});
```

## 📦 Test Data

```typescript
import { validTripData, invalidTripData, generateRandomTripName, generateTripData } from "./fixtures/trip-data";

// Use predefined data
await createTripModal.createTrip(validTripData.complete);

// Generate random data
const tripName = generateRandomTripName();
const tripData = generateTripData({ name: "Custom" });

// Use invalid data
await createTripModal.fillWithInvalidData(invalidTripData.nameTooLong);
```

## 🔍 Locators Reference

### data-testid values:

**Buttons:**

- `add-trip-button`
- `submit-trip-button`
- `cancel-trip-button`

**Inputs:**

- `trip-name-input`
- `trip-description-input`
- `trip-map-url-input`
- `trip-date-input`

**Errors:**

- `trip-name-error`
- `trip-description-error`
- `trip-map-url-error`
- `trip-date-error`
- `form-error`

**Coordinates:**

- `coordinates-loading`
- `coordinates-error`
- `coordinates-success`

**Containers:**

- `create-trip-modal`
- `create-trip-form`

## 🎨 Assertions

```typescript
// Visibility
await expect(createTripModal.modal).toBeVisible();
await expect(createTripModal.modal).not.toBeVisible();

// Text content
await expect(createTripModal.modalTitle).toHaveText("Dodaj nową trasę");

// Attributes
await expect(createTripModal.nameInput).toHaveAttribute("required");
await expect(createTripModal.submitButton).toBeDisabled();

// Count
await expect(tripsPage.page.getByRole("button")).toHaveCount(5);

// Text contains
const error = await createTripModal.getNameError();
expect(error).toContain("100 znaków");
```

## 🐛 Debugging Tips

```bash
# Run with headed browser
npx playwright test --headed

# Debug specific test
npx playwright test create-trip --debug

# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## 📚 Resources

- [Full Documentation](./README.md)
- [Page Objects README](./page-objects/README.md)
- [Playwright Docs](https://playwright.dev/)
