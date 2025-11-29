/**
 * Page Object Model for common test fixtures and utilities
 */

import { test as base } from "@playwright/test";

// Extend basic test with custom fixtures
export const test = base.extend({
  // Add custom fixtures here as needed
});

export { expect } from "@playwright/test";
