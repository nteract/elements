"use client";

import { useState, useEffect } from "react";

/**
 * Static mockup of a progress widget for documentation purposes.
 *
 * The actual @jupyter-widgets/html-manager library has bundler compatibility
 * issues with Turbopack, so we show a static representation for the docs.
 * Real usage requires webpack or a compatible bundler.
 */
function MockProgressWidget({ value, max }: { value: number; max: number }) {
  const percentage = (value / max) * 100;

  return (
    <div className="flex items-center gap-3 font-sans text-sm">
      <span className="text-muted-foreground">Loading:</span>
      <div className="relative h-4 flex-1 overflow-hidden rounded bg-muted">
        <div
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="tabular-nums text-muted-foreground">
        {value}/{max}
      </span>
    </div>
  );
}

/**
 * Demo showing the widget output component states.
 */
function WidgetReplayDemo() {
  const [value, setValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const max = 10;

  const play = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setValue(0);
  };

  useEffect(() => {
    if (!isPlaying) return;

    if (value < max) {
      const timer = setTimeout(() => {
        setValue((v) => v + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying, value, max]);

  const reset = () => {
    setValue(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={play}
          disabled={isPlaying}
          className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
        >
          {isPlaying ? "Playing..." : "Play Progress"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80"
        >
          Reset
        </button>
        <span className="text-xs text-muted-foreground">
          Step: {value}/{max}
        </span>
      </div>

      <div className="rounded border border-border bg-card p-4">
        <MockProgressWidget value={value} max={max} />
      </div>

      <p className="text-xs text-muted-foreground">
        This is a static mockup. Actual ipywidgets render with the HTMLManager
        when connected to a Jupyter kernel.
      </p>
    </div>
  );
}

/**
 * Shows the "not configured" state when no WidgetProvider is present.
 */
function NotConfiguredDemo() {
  return (
    <div className="rounded border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
      <div className="font-medium">Widget: 5d3a9b27b8cd4da880f2442d9d7fc047</div>
      <div className="mt-1 text-xs">
        To display this widget, wrap your application with a{" "}
        <code className="rounded bg-muted px-1 font-mono">WidgetProvider</code>.
      </div>
    </div>
  );
}

/**
 * Shows the loading state.
 */
function LoadingDemo() {
  return (
    <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
      <svg
        className="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>Loading widget...</span>
    </div>
  );
}

/**
 * Shows the error state.
 */
function ErrorDemo() {
  return (
    <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      Widget model not found: mock-slider-123
    </div>
  );
}

interface WidgetOutputDemoProps {
  variant?: "replay" | "no-provider" | "loading" | "error";
}

/**
 * Demo component for WidgetOutput showing different states.
 *
 * Note: This is a static mockup for documentation. The actual WidgetOutput
 * component uses @jupyter-widgets/html-manager which requires webpack.
 */
export function WidgetOutputDemo({
  variant = "replay",
}: WidgetOutputDemoProps) {
  switch (variant) {
    case "replay":
      return <WidgetReplayDemo />;
    case "no-provider":
      return <NotConfiguredDemo />;
    case "loading":
      return <LoadingDemo />;
    case "error":
      return <ErrorDemo />;
    default:
      return <WidgetReplayDemo />;
  }
}

/**
 * Interactive demo showing all widget states.
 */
export function WidgetOutputInteractiveDemo() {
  const [variant, setVariant] = useState<
    "replay" | "no-provider" | "loading" | "error"
  >("replay");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setVariant("replay")}
          className={`rounded px-3 py-1 text-sm ${
            variant === "replay"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Widget Demo
        </button>
        <button
          type="button"
          onClick={() => setVariant("no-provider")}
          className={`rounded px-3 py-1 text-sm ${
            variant === "no-provider"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          No Provider
        </button>
        <button
          type="button"
          onClick={() => setVariant("loading")}
          className={`rounded px-3 py-1 text-sm ${
            variant === "loading"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Loading
        </button>
        <button
          type="button"
          onClick={() => setVariant("error")}
          className={`rounded px-3 py-1 text-sm ${
            variant === "error"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Error
        </button>
      </div>
      <div className="rounded-lg border p-4">
        <WidgetOutputDemo variant={variant} />
      </div>
    </div>
  );
}
