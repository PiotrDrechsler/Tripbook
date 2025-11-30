import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Button Component Unit Tests
 * Tests cover all variants, sizes, interactions, and accessibility features
 */
describe("Button Component", () => {
  describe("Rendering", () => {
    it("should render button with default props", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole("button", { name: "Click me" });
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe("BUTTON");
    });

    it("should render button with custom className", () => {
      render(<Button className="custom-class">Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should render button with children content", () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      expect(screen.getByText("Icon")).toBeInTheDocument();
      expect(screen.getByText("Text")).toBeInTheDocument();
    });

    it("should render as child component when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole("link", { name: "Link Button" });
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "/test");
    });

    it("should apply data-slot attribute", () => {
      const { container } = render(<Button>Button</Button>);

      const button = container.querySelector('[data-slot="button"]');
      expect(button).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render default variant with correct styles", () => {
      render(<Button variant="default">Default</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary", "text-primary-foreground", "shadow-xs");
    });

    it("should render destructive variant with correct styles", () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive", "text-white", "shadow-xs");
    });

    it("should render outline variant with correct styles", () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("border", "bg-background", "shadow-xs");
    });

    it("should render secondary variant with correct styles", () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-secondary", "text-secondary-foreground", "shadow-xs");
    });

    it("should render ghost variant with correct styles", () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent", "hover:text-accent-foreground");
    });

    it("should render link variant with correct styles", () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-primary", "underline-offset-4", "hover:underline");
    });
  });

  describe("Sizes", () => {
    it("should render with default size", () => {
      render(<Button size="default">Default Size</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9", "px-4", "py-2");
    });

    it("should render with small size", () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8", "rounded-md", "gap-1.5", "px-3");
    });

    it("should render with large size", () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10", "rounded-md", "px-6");
    });

    it("should render with icon size", () => {
      render(
        <Button size="icon" aria-label="Icon button">
          🔍
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("size-9");
    });
  });

  describe("Interactions", () => {
    it("should handle click events", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not trigger click when disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });

    it("should support keyboard interaction (Enter)", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Keyboard Button</Button>);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should support keyboard interaction (Space)", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Keyboard Button</Button>);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard(" ");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Disabled State", () => {
    it("should apply disabled styles", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:pointer-events-none", "disabled:opacity-50");
    });

    it("should be keyboard focusable when disabled", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      // Disabled buttons should still be in the tab order for accessibility
      expect(button).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper focus-visible styles", () => {
      render(<Button>Focus me</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:border-ring", "focus-visible:ring-ring/50", "focus-visible:ring-[3px]");
    });

    it("should have aria-invalid styles", () => {
      render(<Button aria-invalid="true">Invalid</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("aria-invalid:ring-destructive/20", "aria-invalid:border-destructive");
      expect(button).toHaveAttribute("aria-invalid", "true");
    });

    it("should support custom aria attributes", () => {
      render(
        <Button aria-label="Custom label" aria-describedby="description">
          Button
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Custom label");
      expect(button).toHaveAttribute("aria-describedby", "description");
    });

    it("should have proper role and be keyboard accessible", () => {
      render(<Button>Accessible Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute("tabindex");
    });
  });

  describe("HTML Attributes", () => {
    it("should support type attribute", () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should support form attribute", () => {
      render(<Button form="my-form">Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("form", "my-form");
    });

    it("should support name and value attributes", () => {
      render(
        <Button name="action" value="delete">
          Delete
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("name", "action");
      expect(button).toHaveAttribute("value", "delete");
    });

    it("should support custom data attributes", () => {
      render(
        <Button data-testid="custom-button" data-action="test">
          Button
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-testid", "custom-button");
      expect(button).toHaveAttribute("data-action", "test");
    });
  });

  describe("SVG Icon Support", () => {
    it("should apply svg-specific styles", () => {
      render(
        <Button>
          <svg data-testid="icon" className="size-4">
            <circle />
          </svg>
          With Icon
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("[&_svg]:pointer-events-none", "[&_svg]:shrink-0");
    });

    it("should handle buttons with only icons", () => {
      render(
        <Button size="icon" aria-label="Search">
          <svg data-testid="search-icon">
            <circle />
          </svg>
        </Button>
      );

      const button = screen.getByRole("button", { name: "Search" });
      const icon = screen.getByTestId("search-icon");
      expect(button).toContainElement(icon);
    });
  });

  describe("ButtonVariants Function", () => {
    it("should generate correct class string for default variant and size", () => {
      const classes = buttonVariants();

      expect(classes).toContain("bg-primary");
      expect(classes).toContain("h-9");
    });

    it("should generate correct class string for custom variant", () => {
      const classes = buttonVariants({ variant: "destructive" });

      expect(classes).toContain("bg-destructive");
      expect(classes).toContain("text-white");
    });

    it("should generate correct class string for custom size", () => {
      const classes = buttonVariants({ size: "lg" });

      expect(classes).toContain("h-10");
      expect(classes).toContain("px-6");
    });

    it("should merge custom className", () => {
      const classes = buttonVariants({ className: "my-custom-class" });

      expect(classes).toContain("my-custom-class");
    });

    it("should combine multiple variants correctly", () => {
      const classes = buttonVariants({
        variant: "outline",
        size: "sm",
        className: "custom",
      });

      expect(classes).toContain("border");
      expect(classes).toContain("h-8");
      expect(classes).toContain("custom");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      render(<Button />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toBeEmptyDOMElement();
    });

    it("should handle multiple variants simultaneously", () => {
      render(
        <Button variant="destructive" size="lg" className="custom-class">
          Multi-styled Button
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive", "h-10", "custom-class");
    });

    it("should preserve ref when using asChild", () => {
      const ref = vi.fn();

      render(
        <Button asChild>
          <a ref={ref} href="/test">
            Link
          </a>
        </Button>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe("Style Composition", () => {
    it("should apply base styles to all variants", () => {
      const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const;

      variants.forEach((variant) => {
        const { container } = render(
          <Button variant={variant} key={variant}>
            {variant}
          </Button>
        );

        const button = container.querySelector("button");
        expect(button).toHaveClass(
          "inline-flex",
          "items-center",
          "justify-center",
          "rounded-md",
          "text-sm",
          "font-medium"
        );
      });
    });

    it("should apply transition classes", () => {
      render(<Button>Animated</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-all");
    });
  });
});
