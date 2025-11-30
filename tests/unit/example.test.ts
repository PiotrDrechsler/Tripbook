import { describe, it, expect } from "vitest";

/**
 * Example unit test suite
 * This demonstrates basic Vitest testing patterns
 */
describe("Example Test Suite", () => {
  it("should pass a basic assertion", () => {
    expect(true).toBe(true);
  });

  it("should perform arithmetic operations", () => {
    const sum = 2 + 2;
    expect(sum).toBe(4);
  });

  it("should work with arrays", () => {
    const array = [1, 2, 3];
    expect(array).toHaveLength(3);
    expect(array).toContain(2);
  });

  it("should work with objects", () => {
    const user = { name: "John", age: 30 };
    expect(user).toHaveProperty("name");
    expect(user.name).toBe("John");
  });
});
