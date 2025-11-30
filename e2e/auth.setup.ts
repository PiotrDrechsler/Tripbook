import { test as setup } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

/**
 * Global setup for authentication
 * Runs once before all tests to create an authenticated session
 */
setup("authenticate", async ({ page }) => {
  // Get credentials from environment
  const email = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test file");
  }

  // eslint-disable-next-line no-console
  console.log(`Attempting to login with email: ${email}`);

  // Collect console errors
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // Navigate to login page
  await page.goto("/login");

  // Wait for login form to be visible
  await page.waitForSelector("input#email");

  // Fill in login form
  await page.fill("input#email", email);
  await page.fill("input#password", password);

  // Click login button and wait for navigation
  await Promise.all([
    page.waitForURL("**/trips", { timeout: 10000 }),
    page.click('button[type="submit"]:has-text("Zaloguj się")'),
  ]);

  // Wait for page to fully load
  await page.waitForLoadState("networkidle");

  // Wait a bit for any client-side hydration
  await page.waitForTimeout(2000);

  // Log any console errors
  if (consoleErrors.length > 0) {
    // eslint-disable-next-line no-console
    console.error("Console errors during auth:", consoleErrors);
  }

  // Check what's on the page
  const pageContent = await page.textContent("body");
  // eslint-disable-next-line no-console
  console.log("Page content preview:", pageContent?.substring(0, 200));

  // Verify we're logged in by checking for add trip button or text
  const addButtonVisible = await page
    .getByRole("button", { name: "Dodaj trasę" })
    .isVisible()
    .catch(() => false);
  const tripsTitleVisible = await page
    .getByText("Moje wycieczki")
    .isVisible()
    .catch(() => false);

  if (!addButtonVisible && !tripsTitleVisible) {
    throw new Error(
      `Failed to verify login - neither "Dodaj trasę" button nor "Moje wycieczki" title found. Console errors: ${consoleErrors.join(", ")}`
    );
  }

  // eslint-disable-next-line no-console
  console.log("✓ Successfully logged in");

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
