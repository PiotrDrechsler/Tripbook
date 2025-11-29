/**
 * Page Object Model fixtures for Playwright tests
 * Automatically initializes page objects for each test
 */

/* eslint-disable react-hooks/rules-of-hooks */
// Note: Playwright's "use" parameter is not a React hook

import { test as base } from "@playwright/test";
import { TripsPage } from "../page-objects/TripsPage";
import { CreateTripModal } from "../page-objects/CreateTripModal";
import { HomePage } from "../page-objects/HomePage";

// Define fixture types
interface PageObjectFixtures {
  homePage: HomePage;
  tripsPage: TripsPage;
  createTripModal: CreateTripModal;
}

// Extend basic test with Page Object fixtures
export const test = base.extend<PageObjectFixtures>({
  // Home Page fixture
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  // Trips Page fixture
  tripsPage: async ({ page }, use) => {
    const tripsPage = new TripsPage(page);
    await use(tripsPage);
  },

  // Create Trip Modal fixture
  createTripModal: async ({ page }, use) => {
    const createTripModal = new CreateTripModal(page);
    await use(createTripModal);
  },
});

export { expect } from "@playwright/test";
