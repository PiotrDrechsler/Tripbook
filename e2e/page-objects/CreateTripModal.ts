import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for the Create Trip Modal
 * This modal appears when clicking "Add Trip" button
 */
export class CreateTripModal {
  readonly page: Page;

  // Modal container
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly closeButton: Locator;

  // Form locators
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly mapUrlInput: Locator;
  readonly dateInput: Locator;

  // Validation and feedback
  readonly nameError: Locator;
  readonly descriptionError: Locator;
  readonly mapUrlError: Locator;
  readonly dateError: Locator;
  readonly formError: Locator;

  // Coordinates extraction feedback
  readonly coordinatesLoading: Locator;
  readonly coordinatesError: Locator;
  readonly coordinatesSuccess: Locator;

  // Action buttons
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Modal container
    this.modal = page.getByTestId("create-trip-modal");
    this.modalTitle = page.getByRole("heading", { name: "Dodaj nową trasę" });
    this.closeButton = page.getByRole("button", { name: "Close" });

    // Form
    this.form = page.getByTestId("create-trip-form");
    this.nameInput = page.getByTestId("trip-name-input");
    this.descriptionInput = page.getByTestId("trip-description-input");
    this.mapUrlInput = page.getByTestId("trip-map-url-input");
    this.dateInput = page.getByTestId("trip-date-input");

    // Validation errors
    this.nameError = page.getByTestId("trip-name-error");
    this.descriptionError = page.getByTestId("trip-description-error");
    this.mapUrlError = page.getByTestId("trip-map-url-error");
    this.dateError = page.getByTestId("trip-date-error");
    this.formError = page.getByTestId("form-error");

    // Coordinates feedback
    this.coordinatesLoading = page.getByTestId("coordinates-loading");
    this.coordinatesError = page.getByTestId("coordinates-error");
    this.coordinatesSuccess = page.getByTestId("coordinates-success");

    // Action buttons
    this.submitButton = page.getByTestId("submit-trip-button");
    this.cancelButton = page.getByTestId("cancel-trip-button");
  }

  /**
   * Wait for modal to be visible
   */
  async waitForModal() {
    await this.modal.waitFor({ state: "visible" });
  }

  /**
   * Check if modal is open
   */
  async isOpen() {
    return this.modal.isVisible();
  }

  /**
   * Fill trip name
   */
  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  /**
   * Fill trip description
   */
  async fillDescription(description: string) {
    await this.descriptionInput.fill(description);
  }

  /**
   * Fill map URL
   */
  async fillMapUrl(url: string) {
    await this.mapUrlInput.fill(url);
  }

  /**
   * Fill trip date
   * @param date - Date in YYYY-MM-DD format
   */
  async fillDate(date: string) {
    await this.dateInput.fill(date);
  }

  /**
   * Wait for coordinates to be extracted successfully
   */
  async waitForCoordinatesSuccess() {
    await this.coordinatesSuccess.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Check if coordinates loading indicator is visible
   */
  async isCoordinatesLoading() {
    return this.coordinatesLoading.isVisible();
  }

  /**
   * Check if coordinates extraction was successful
   */
  async hasCoordinatesSuccess() {
    return this.coordinatesSuccess.isVisible();
  }

  /**
   * Check if coordinates extraction failed
   */
  async hasCoordinatesError() {
    return this.coordinatesError.isVisible();
  }

  /**
   * Get coordinates error message
   */
  async getCoordinatesErrorMessage() {
    return this.coordinatesError.textContent();
  }

  /**
   * Get name validation error
   */
  async getNameError() {
    return this.nameError.textContent();
  }

  /**
   * Get description validation error
   */
  async getDescriptionError() {
    return this.descriptionError.textContent();
  }

  /**
   * Get map URL validation error
   */
  async getMapUrlError() {
    return this.mapUrlError.textContent();
  }

  /**
   * Get date validation error
   */
  async getDateError() {
    return this.dateError.textContent();
  }

  /**
   * Get general form error
   */
  async getFormError() {
    return this.formError.textContent();
  }

  /**
   * Check if name error is visible
   */
  async hasNameError() {
    return this.nameError.isVisible();
  }

  /**
   * Check if description error is visible
   */
  async hasDescriptionError() {
    return this.descriptionError.isVisible();
  }

  /**
   * Check if map URL error is visible
   */
  async hasMapUrlError() {
    return this.mapUrlError.isVisible();
  }

  /**
   * Check if date error is visible
   */
  async hasDateError() {
    return this.dateError.isVisible();
  }

  /**
   * Check if general form error is visible
   */
  async hasFormError() {
    return this.formError.isVisible();
  }

  /**
   * Submit the form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Cancel and close the modal
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Close modal using X button
   */
  async close() {
    await this.closeButton.click();
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitDisabled() {
    return this.submitButton.isDisabled();
  }

  /**
   * Check if form is submitting
   */
  async isSubmitting() {
    const text = await this.submitButton.textContent();
    return text?.includes("Zapisywanie...");
  }

  /**
   * Wait for modal to close
   */
  async waitForClose() {
    await this.modal.waitFor({ state: "hidden", timeout: 5000 });
  }

  /**
   * Fill complete form and submit
   * @param data - Trip data to fill
   */
  async createTrip(data: { name: string; description?: string; mapUrl: string; date?: string }) {
    await this.waitForModal();
    await this.fillName(data.name);

    if (data.description) {
      await this.fillDescription(data.description);
    }

    await this.fillMapUrl(data.mapUrl);

    // Wait for coordinates to be extracted
    await this.waitForCoordinatesSuccess();

    if (data.date) {
      await this.fillDate(data.date);
    }

    await this.submit();
  }

  /**
   * Fill form with invalid data (for validation testing)
   */
  async fillWithInvalidData(data: { name?: string; description?: string; mapUrl?: string; date?: string }) {
    if (data.name !== undefined) {
      await this.fillName(data.name);
    }
    if (data.description !== undefined) {
      await this.fillDescription(data.description);
    }
    if (data.mapUrl !== undefined) {
      await this.fillMapUrl(data.mapUrl);
    }
    if (data.date !== undefined) {
      await this.fillDate(data.date);
    }
  }
}
