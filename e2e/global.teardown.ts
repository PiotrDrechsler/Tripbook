import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../src/db/database.types";

/**
 * Global teardown for E2E tests
 * Runs once after all tests to clean up test data from Supabase
 */
teardown("cleanup test data", async () => {
  // Get Supabase credentials from environment
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;

  if (!supabaseUrl || !supabaseKey) {
    // eslint-disable-next-line no-console
    console.warn("⚠️  Skipping teardown: SUPABASE_URL or SUPABASE_KEY not set");
    return;
  }

  if (!testUserId) {
    // eslint-disable-next-line no-console
    console.warn("⚠️  Skipping teardown: E2E_USERNAME_ID not set");
    return;
  }

  // eslint-disable-next-line no-console
  console.log("🧹 Starting E2E teardown: Cleaning up test data...");

  // Create Supabase admin client
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  try {
    // Delete all trips created by the test user
    const { error, count } = await supabase.from("trips").delete().eq("user_id", testUserId);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Failed to delete test trips:", error.message);
      throw new Error(`Failed to clean up test data: ${error.message}`);
    }

    // eslint-disable-next-line no-console
    console.log(`✅ Teardown complete: Deleted ${count || 0} test trip(s)`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Teardown failed:", error);
    throw error;
  }
});
