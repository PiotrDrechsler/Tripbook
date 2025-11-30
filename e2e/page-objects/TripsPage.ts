import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for the Trips List Page
 * Represents /trips route
 */
export class TripsPage extends BasePage {
  // Locators
  readonly pageTitle: Locator;
  readonly addTripButton: Locator;
  readonly tripsList: Locator;
  readonly emptyState: Locator;
  readonly sortByDateButton: Locator;
  readonly sortByDistanceButton: Locator;
  readonly sortByDurationButton: Locator;
  readonly paginationInfo: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.pageTitle = page.getByRole("heading", { name: "Moje wycieczki" });
    this.addTripButton = page.getByTestId("add-trip-button");
    this.tripsList = page
      .locator('[class*="grid"]')
      .filter({ hasText: /Utworzono:/ })
      .first();
    this.emptyState = page.locator("text=Brak wycieczek");

    // Sort buttons
    this.sortByDateButton = page.getByRole("button", { name: /Data utworzenia/ });
    this.sortByDistanceButton = page.getByRole("button", { name: /Odległość/ });
    this.sortByDurationButton = page.getByRole("button", { name: /Czas dojazdu/ });

    // Pagination
    this.paginationInfo = page.locator("text=/Strona \\d+ z \\d+/");
    this.previousPageButton = page.getByRole("button", { name: "Poprzednia" });
    this.nextPageButton = page.getByRole("button", { name: "Następna" });
  }

  /**
   * Navigate to trips page
   */
  async goto() {
    await this.page.goto("/trips");
    await this.waitForPageLoad();
  }

  /**
   * Click "Add Trip" button to open create modal
   */
  async clickAddTrip() {
    await this.addTripButton.click();
  }

  /**
   * Check if page is loaded
   */
  async isLoaded() {
    await this.pageTitle.waitFor({ state: "visible" });
    return this.pageTitle.isVisible();
  }

  /**
   * Check if empty state is visible
   */
  async hasEmptyState() {
    return this.emptyState.isVisible();
  }

  /**
   * Get all trip items
   */
  async getTripItems() {
    return this.page.locator('[role="button"][href^="/trips/"]').all();
  }

  /**
   * Get trip item by name
   */
  getTripByName(name: string) {
    return this.page.locator(`[role="button"][href^="/trips/"]`, { hasText: name });
  }

  /**
   * Click on a trip by name
   */
  async selectTripByName(name: string) {
    await this.getTripByName(name).click();
  }

  /**
   * Sort trips by date
   */
  async sortByDate() {
    await this.sortByDateButton.click();
  }

  /**
   * Sort trips by distance
   */
  async sortByDistance() {
    await this.sortByDistanceButton.click();
  }

  /**
   * Sort trips by duration
   */
  async sortByDuration() {
    await this.sortByDurationButton.click();
  }

  /**
   * Go to next page
   */
  async goToNextPage() {
    await this.nextPageButton.click();
  }

  /**
   * Go to previous page
   */
  async goToPreviousPage() {
    await this.previousPageButton.click();
  }

  /**
   * Check if pagination is visible
   */
  async hasPagination() {
    return this.paginationInfo.isVisible();
  }
}
