import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../error-boundary";

// Component that throws an error when shouldThrow is true
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>Child content</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary fallback={() => <div>Error fallback</div>}>
        <div>Child content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders fallback when an error occurs", () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={(error) => <div>Error: {error.message}</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Error: Test error")).toBeInTheDocument();
    spy.mockRestore();
  });

  it("calls onError when an error occurs", () => {
    const onError = vi.fn();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={() => <div>Fallback</div>} onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
    spy.mockRestore();
  });

  it("resets error state when resetErrorBoundary is called", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary
        fallback={(error, reset) => <button onClick={reset}>Retry</button>}
      >
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Retry")).toBeInTheDocument();

    // Rerender with non-throwing component, then trigger reset
    rerender(
      <ErrorBoundary
        fallback={(error, reset) => <button onClick={reset}>Retry</button>}
      >
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByText("Retry"));
    expect(screen.getByText("Child content")).toBeInTheDocument();

    spy.mockRestore();
  });

  it("resets error state when resetKeys change", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary resetKeys={["key1"]} fallback={() => <div>Fallback</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Fallback")).toBeInTheDocument();

    // Change resetKeys and provide non-throwing component
    rerender(
      <ErrorBoundary resetKeys={["key2"]} fallback={() => <div>Fallback</div>}>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();

    spy.mockRestore();
  });

  it("passes error and reset function to fallback", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary
        fallback={(error, reset) => (
          <div>
            <span data-testid="error-message">{error.message}</span>
            <button data-testid="reset-btn" onClick={reset}>
              Reset
            </button>
          </div>
        )}
      >
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("error-message")).toHaveTextContent("Test error");
    expect(screen.getByTestId("reset-btn")).toBeInTheDocument();

    spy.mockRestore();
  });
});
