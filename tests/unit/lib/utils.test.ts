import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

/**
 * Unit tests for utility functions
 */
describe("Utils", () => {
  describe("cn (className utility)", () => {
    it("should merge class names", () => {
      const result = cn("foo", "bar");
      expect(result).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base", isActive && "active");
      expect(result).toBe("base active");
    });

    it("should handle falsy values", () => {
      const shouldHide = false;
      const result = cn("base", shouldHide && "hidden", null, undefined);
      expect(result).toBe("base");
    });

    it("should merge tailwind classes correctly", () => {
      const result = cn("px-2 py-1", "px-4");
      // Should prefer the last px-* class
      expect(result).toContain("px-4");
      expect(result).toContain("py-1");
    });
  });
});
