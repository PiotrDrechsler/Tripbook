import { test, expect } from "@playwright/test";

/**
 * Basic smoke tests to verify the application is running
 */
test.describe("Smoke Tests", () => {
  test("should load the application", async ({ page }) => {
    await page.goto("/");

    // Check if the page loads without errors
    await expect(page).toHaveURL(/\//);
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have no console errors on homepage", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Allow some time for any async errors
    await page.waitForTimeout(1000);

    // We might want to filter out known errors
    // For now, just check there are no critical errors
    const criticalErrors = consoleErrors.filter(
      (err) => !err.includes("favicon") // Ignore favicon errors
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("should have correct meta tags", async ({ page }) => {
    await page.goto("/");

    // Check for basic meta tags
    const metaViewport = page.locator('meta[name="viewport"]');
    await expect(metaViewport).toHaveAttribute("content", /width=device-width/);
  });
});
