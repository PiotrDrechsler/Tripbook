import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment configuration
    environment: "jsdom",

    // Global setup
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exit: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/**/*.types.ts", "src/test/**", "src/env.d.ts", "src/db/database.types.ts"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // Include test files
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/unit/**/*.{test,spec}.{ts,tsx}"],

    // Exclude patterns
    exclude: ["node_modules", "dist", ".astro", "e2e"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
