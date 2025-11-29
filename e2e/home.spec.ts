import { test, expect } from "../fixtures";
import { HomePage } from "../page-objects/HomePage";

/**
 * Example E2E test for the home page
 */
test.describe("Home Page", () => {
  test("should load the home page successfully", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await expect(page).toHaveTitle(/Tripbook/i);
  });

  test("should display welcome message", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    const isLoaded = await homePage.isLoaded();

    expect(isLoaded).toBe(true);
  });

  test("should have navigation menu", async ({ page }) => {
    await page.goto("/");

    // Check if navigation elements exist
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should be responsive", async ({ page }) => {
    await page.goto("/");

    // Test different viewport sizes
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(page.locator("body")).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop
    await expect(page.locator("body")).toBeVisible();
  });
});
