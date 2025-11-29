import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "@/components/trips/Spinner";

/**
 * Example component test
 * This demonstrates how to test React components using Testing Library
 */
describe("Spinner Component", () => {
  it("should render spinner with correct structure", () => {
    const { container } = render(<Spinner />);

    // Check if the spinner container exists
    const spinnerContainer = container.querySelector(".flex.items-center");
    expect(spinnerContainer).toBeInTheDocument();
  });

  it("should have spinning animation", () => {
    const { container } = render(<Spinner />);

    // Check if animated element exists
    const animatedElement = container.querySelector(".animate-spin");
    expect(animatedElement).toBeInTheDocument();
  });

  it("should have proper styling classes", () => {
    const { container } = render(<Spinner />);

    // Check for border styling
    const borderElements = container.querySelectorAll(".border-4");
    expect(borderElements.length).toBeGreaterThan(0);
  });
});
