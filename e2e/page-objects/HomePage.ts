import { BasePage } from "./BasePage";

/**
 * Page Object Model for the Home Page
 */
export class HomePage extends BasePage {
  async goto() {
    await this.page.goto("/");
  }

  async getWelcomeMessage() {
    return this.page.locator("h1").textContent();
  }

  async isLoaded() {
    await this.page.waitForLoadState("domcontentloaded");
    return this.page.locator("body").isVisible();
  }
}
