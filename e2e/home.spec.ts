import { test, expect } from "@playwright/test";

/**
 * Example E2E test for the home page
 */
test.describe("Home Page", () => {
  test("should load the home page successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Tripbook/i);
  });

  test("should display welcome message", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
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
