import { describe, it, expect } from "vitest";
import { decimalToDMS, formatCoordinatesDMS, formatCoordinatesDecimal } from "@/lib/utils/coordinates";

/**
 * Unit tests for coordinates utility functions
 */
describe("Coordinates Utils", () => {
  describe("decimalToDMS", () => {
    it("should convert positive latitude to DMS", () => {
      const result = decimalToDMS(49.264556, true);
      expect(result).toBe("49°15'52.4\"N");
    });

    it("should convert negative latitude to DMS", () => {
      const result = decimalToDMS(-49.264556, true);
      expect(result).toBe("49°15'52.4\"S");
    });

    it("should convert positive longitude to DMS", () => {
      const result = decimalToDMS(19.864528, false);
      expect(result).toBe("19°51'52.3\"E");
    });

    it("should convert negative longitude to DMS", () => {
      const result = decimalToDMS(-19.864528, false);
      expect(result).toBe("19°51'52.3\"W");
    });
  });

  describe("formatCoordinatesDMS", () => {
    it("should format coordinates in DMS format", () => {
      const result = formatCoordinatesDMS(49.264556, 19.864528);
      expect(result).toBe("49°15'52.4\"N 19°51'52.3\"E");
    });

    it("should handle negative coordinates", () => {
      const result = formatCoordinatesDMS(-49.264556, -19.864528);
      expect(result).toBe("49°15'52.4\"S 19°51'52.3\"W");
    });
  });

  describe("formatCoordinatesDecimal", () => {
    it("should format coordinates to decimal string", () => {
      const result = formatCoordinatesDecimal(50.0755, 14.4378);
      expect(result).toBe("50.0755, 14.4378");
    });

    it("should handle negative coordinates", () => {
      const result = formatCoordinatesDecimal(-50.0755, -14.4378);
      expect(result).toBe("-50.0755, -14.4378");
    });

    it("should respect precision parameter", () => {
      const result = formatCoordinatesDecimal(50.075512345, 14.437812345, 2);
      expect(result).toBe("50.08, 14.44");
    });

    it("should use default precision of 4", () => {
      const result = formatCoordinatesDecimal(50.075512345, 14.437812345);
      expect(result).toBe("50.0755, 14.4378");
    });
  });
});
