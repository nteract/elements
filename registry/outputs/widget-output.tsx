"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useWidget } from "@/lib/widget-context";

/**
 * Widget view data from Jupyter's application/vnd.jupyter.widget-view+json MIME type.
 */
interface WidgetViewData {
  /**
   * The model ID of the widget to display.
   */
  model_id: string;
  /**
   * Version of the widget protocol (e.g., "2.0.0" or "1.0.0").
   */
  version_major?: number;
  version_minor?: number;
}

interface WidgetOutputProps {
  /**
   * Widget view data containing the model_id.
   * This is the content of the application/vnd.jupyter.widget-view+json MIME type.
   */
  data: WidgetViewData | unknown;
  /**
   * Optional metadata for the widget output.
   */
  metadata?: Record<string, unknown>;
  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * Type guard to check if data is a valid widget view.
 */
function isWidgetViewData(data: unknown): data is WidgetViewData {
  return (
    typeof data === "object" &&
    data !== null &&
    "model_id" in data &&
    typeof (data as WidgetViewData).model_id === "string"
  );
}

/**
 * Loading state component for widgets.
 */
function WidgetLoading() {
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
 * Error state component for widgets.
 */
function WidgetError({ message }: { message: string }) {
  return (
    <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  );
}

/**
 * Fallback component when widget context is not available.
 */
function WidgetNotConfigured({ modelId }: { modelId: string }) {
  return (
    <div className="rounded border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
      <div className="font-medium">Widget: {modelId}</div>
      <div className="mt-1 text-xs">
        To display this widget, wrap your application with a{" "}
        <code className="rounded bg-muted px-1 font-mono">WidgetProvider</code>.
      </div>
    </div>
  );
}

/**
 * WidgetOutput component for rendering Jupyter widgets.
 *
 * This component handles the `application/vnd.jupyter.widget-view+json` MIME type,
 * rendering ipywidgets and anywidgets using the HTMLManager.
 *
 * Requires a WidgetProvider ancestor to function. If no provider is found,
 * displays a placeholder with the model ID.
 *
 * @example
 * ```tsx
 * // Used automatically by MediaRouter when widget MIME type is present
 * <MediaRouter
 *   data={{
 *     "application/vnd.jupyter.widget-view+json": { model_id: "abc123" },
 *     "text/plain": "<IPython.widgets.IntSlider>"
 *   }}
 * />
 *
 * // Or directly
 * <WidgetOutput data={{ model_id: "abc123" }} />
 * ```
 */
export function WidgetOutput({ data, className = "" }: WidgetOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetContext = useWidget();
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Extract model ID and validation
  const isValid = isWidgetViewData(data);
  const modelId = isValid ? data.model_id : null;
  const hasContext = widgetContext !== null;
  const manager = widgetContext?.manager;
  const getModel = widgetContext?.getModel;

  useEffect(() => {
    // Skip if invalid data, no context, or missing dependencies
    if (!isValid || !hasContext || !modelId || !manager || !getModel) {
      return;
    }

    const container = containerRef.current;
    const htmlManager = manager.current;

    if (!container || !htmlManager) {
      return;
    }

    // Capture for closure
    const fetchModel = getModel;
    const widgetModelId = modelId;

    let mounted = true;
    let view: { el: HTMLElement; remove?: () => void } | null = null;

    async function renderWidget() {
      try {
        setState("loading");

        // Get the widget model
        const model = await fetchModel(widgetModelId);
        if (!mounted || !model) {
          if (mounted) {
            setState("error");
            setErrorMessage(`Widget model not found: ${widgetModelId}`);
          }
          return;
        }

        // Create a view for the model
        const createdView = await htmlManager?.create_view(model as never, {});
        if (!mounted) {
          // Clean up if unmounted during async operation
          if (createdView?.remove) {
            createdView.remove();
          }
          return;
        }

        view = createdView as { el: HTMLElement; remove?: () => void };

        // Clear container and append widget view
        if (container) {
          container.innerHTML = "";
          if (view?.el) {
            container.appendChild(view.el);
          }
        }

        setState("ready");
      } catch (err) {
        if (mounted) {
          setState("error");
          setErrorMessage(
            err instanceof Error ? err.message : "Failed to render widget",
          );
        }
      }
    }

    renderWidget();

    return () => {
      mounted = false;
      // Clean up the view if it exists
      if (view?.remove) {
        view.remove();
      }
    };
  }, [isValid, hasContext, modelId, manager, getModel]);

  // Validate data
  if (!isValid) {
    return (
      <WidgetError message="Invalid widget data: missing or invalid model_id" />
    );
  }

  // Show placeholder if no widget context
  // Note: modelId is guaranteed to be a string here since we return early if !isValid
  if (!hasContext) {
    return <WidgetNotConfigured modelId={modelId as string} />;
  }

  return (
    <div
      ref={containerRef}
      data-slot="widget-output"
      data-model-id={modelId}
      className={cn("not-prose py-2", className)}
    >
      {state === "loading" && <WidgetLoading />}
      {state === "error" && <WidgetError message={errorMessage} />}
      {/* When ready, the widget view is appended to the container via useEffect */}
    </div>
  );
}

/**
 * Custom renderer function for use with MediaRouter.
 *
 * @example
 * ```tsx
 * import { MediaRouter } from "@/registry/outputs/media-router";
 * import { widgetRenderer } from "@/registry/outputs/widget-output";
 *
 * <MediaRouter
 *   data={output.data}
 *   renderers={{
 *     "application/vnd.jupyter.widget-view+json": widgetRenderer,
 *   }}
 * />
 * ```
 */
export function widgetRenderer({
  data,
  className,
}: {
  data: unknown;
  metadata: Record<string, unknown>;
  mimeType: string;
  className?: string;
}) {
  return <WidgetOutput data={data} className={className} />;
}
