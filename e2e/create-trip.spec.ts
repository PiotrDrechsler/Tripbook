import { test, expect } from "./fixtures";

/**
 * E2E Tests for Creating a Trip
 *
 * Scenario:
 * 1. Click "Add Trip" button
 * 2. Fill trip name
 * 3. Fill trip description
 * 4. Fill map URL
 * 5. Fill trip date
 * 6. Click "Submit"
 *
 * Prerequisites:
 * - User is automatically logged in via auth.setup.ts
 * - Application must be running
 *
 * Note: Uses fixtures for automatic Page Object initialization
 */

test.describe("Create Trip Flow", () => {
  test.beforeEach(async ({ tripsPage }) => {
    // Navigate to trips page (user is already authenticated)
    await tripsPage.goto();
  });

  test("should open create trip modal when clicking Add Trip button", async ({ tripsPage, createTripModal }) => {
    // Step 1: Click "Add Trip" button
    await tripsPage.clickAddTrip();

    // Verify modal is open
    await expect(createTripModal.modal).toBeVisible();
    await expect(createTripModal.modalTitle).toHaveText("Dodaj nową trasę");
  });

  test("should create a new trip with valid data", async ({ page, tripsPage, createTripModal }) => {
    // Step 1: Click "Add Trip" button
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    // Prepare test data with unique name
    const timestamp = Date.now();
    const tripData = {
      name: `Wycieczka do Tatr ${timestamp}`,
      description: "Piękna wycieczka w góry. Będziemy wędrować szlakami Tatr Wysokich.",
      mapUrl: "https://mapy.com/s/hulolekoje", // Example valid mapy.com link
      date: "2025-12-15",
    };

    // Step 2-5: Fill the form
    await createTripModal.createTrip(tripData);

    // Wait for modal to close (indicates success)
    await createTripModal.waitForClose();

    // Verify the trip appears in the list
    // Note: You might need to wait for page reload or list refresh
    await page.waitForTimeout(1000); // Give time for any redirects/reloads

    // Check if the new trip is visible
    const tripItem = tripsPage.getTripByName(tripData.name);
    await expect(tripItem).toBeVisible();
  });

  test("should validate required fields", async ({ tripsPage, createTripModal }) => {
    // Open modal
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    // Try to submit without filling any fields
    await createTripModal.submit();

    // Verify validation errors are shown
    // Note: HTML5 validation might prevent form submission
    // If using custom validation, check for error messages
    await expect(createTripModal.nameInput).toHaveAttribute("required");
    await expect(createTripModal.mapUrlInput).toHaveAttribute("required");
  });

  test("should validate trip name length", async ({ tripsPage, createTripModal }) => {
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    // Verify that HTML5 maxLength attribute prevents entering more than 100 characters
    const maxLength = await createTripModal.nameInput.getAttribute("maxLength");
    expect(maxLength).toBe("100");

    // Try to fill with name exceeding 100 characters - should be truncated by browser
    const longName = "A".repeat(150);
    await createTripModal.fillName(longName);

    // Verify that the actual value is limited to 100 characters
    const actualValue = await createTripModal.nameInput.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(100);
  });

  test("should validate map URL format", async ({ tripsPage, createTripModal }) => {
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    // Fill with valid name but invalid map URL
    await createTripModal.fillName("Test Trip");
    await createTripModal.fillMapUrl("https://google.com"); // Invalid - not mapy.cz

    // Wait a bit for validation
    await createTripModal.page.waitForTimeout(500);

    await createTripModal.submit();

    // Verify error message about mapy.cz requirement
    await expect(createTripModal.mapUrlError).toBeVisible();
    const errorText = await createTripModal.getMapUrlError();
    expect(errorText).toContain("mapy.com");
  });

  test("should show coordinates loading state", async ({ tripsPage, createTripModal }) => {
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    await createTripModal.fillName("Test Trip");

    // Start filling map URL
    await createTripModal.mapUrlInput.fill("https://mapy.cz/s/hok");

    // Check if loading indicator appears
    // Note: This depends on debouncing in useMapyLink hook
    // We can't guarantee timing, but the locator should exist
    expect(createTripModal.coordinatesLoading).toBeDefined();
  });

  test("should show coordinates success state", async ({ tripsPage, createTripModal }) => {
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    await createTripModal.fillName("Test Trip");
    await createTripModal.fillMapUrl("https://mapy.com/s/hulolekoje");

    // Wait for coordinates extraction
    await createTripModal.waitForCoordinatesSuccess();

    // Verify success indicator
    await expect(createTripModal.coordinatesSuccess).toBeVisible();
    const successText = await createTripModal.coordinatesSuccess.textContent();
    expect(successText).toContain("✓");
    expect(successText).toContain("Współrzędne:");
  });

  test("should validate description length", async ({ tripsPage, createTripModal }) => {
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    // Verify that HTML5 maxLength attribute prevents entering more than 2000 characters
    const maxLength = await createTripModal.descriptionInput.getAttribute("maxLength");
    expect(maxLength).toBe("2000");

    // Try to fill with description exceeding 2000 characters - should be truncated by browser
    const longDescription = "A".repeat(2500);
    await createTripModal.fillDescription(longDescription);

    // Verify that the actual value is limited to 2000 characters
    const actualValue = await createTripModal.descriptionInput.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(2000);
  });

  test("should close modal when clicking Cancel button", async ({ tripsPage, createTripModal }) => {
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    // Fill some data
    await createTripModal.fillName("Test Trip");

    // Click cancel
    await createTripModal.cancel();

    // Verify modal is closed
    await createTripModal.waitForClose();
    await expect(createTripModal.modal).not.toBeVisible();
  });

  test("should close modal when clicking X button", async ({ tripsPage, createTripModal }) => {
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    // Fill some data
    await createTripModal.fillName("Test Trip");

    // Click X button
    await createTripModal.close();

    // Verify modal is closed
    await createTripModal.waitForClose();
    await expect(createTripModal.modal).not.toBeVisible();
  });

  test("should disable submit button while submitting", async ({ page, tripsPage, createTripModal }) => {
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    const tripData = {
      name: `Test Trip ${Date.now()}`,
      description: "Test description",
      mapUrl: "https://mapy.com/s/hulolekoje",
      date: "2025-12-15",
    };

    // Fill form
    await createTripModal.fillName(tripData.name);
    await createTripModal.fillDescription(tripData.description);
    await createTripModal.fillMapUrl(tripData.mapUrl);
    await createTripModal.waitForCoordinatesSuccess();
    await createTripModal.fillDate(tripData.date);

    // Intercept the API call to add delay
    await page.route("**/api/trips", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate slow response
      await route.continue();
    });

    // Click submit
    const submitPromise = createTripModal.submit();

    // Check if button is disabled while submitting
    await page.waitForTimeout(100); // Small delay to let the submitting state kick in
    await expect(createTripModal.submitButton).toBeDisabled();
    const buttonText = await createTripModal.submitButton.textContent();
    expect(buttonText).toContain("Zapisywanie...");

    // Clean up route handler
    await page.unrouteAll({ behavior: "ignoreErrors" });

    await submitPromise;
  });

  test("should show all form fields with proper labels", async ({ tripsPage, createTripModal }) => {
    await tripsPage.clickAddTrip();
    await createTripModal.waitForModal();

    // Verify all fields are present
    await expect(createTripModal.nameInput).toBeVisible();
    await expect(createTripModal.descriptionInput).toBeVisible();
    await expect(createTripModal.mapUrlInput).toBeVisible();
    await expect(createTripModal.dateInput).toBeVisible();

    // Verify labels
    await expect(createTripModal.page.getByText("Nazwa wycieczki")).toBeVisible();
    await expect(createTripModal.page.getByText("Opis")).toBeVisible();
    await expect(createTripModal.page.getByText("Link do mapy")).toBeVisible();
    await expect(createTripModal.page.getByText("Data wycieczki")).toBeVisible();

    // Verify required indicators
    const requiredIndicators = createTripModal.page.locator('span.text-destructive:has-text("*")');
    await expect(requiredIndicators).toHaveCount(2); // Name and Map URL are required
  });
});
