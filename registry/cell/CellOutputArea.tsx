"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { lazy, Suspense } from "react";

// Lazy load media router for better bundle splitting
const MediaRouter = lazy(() =>
  import("../outputs/media-router").then((m) => ({ default: m.MediaRouter })),
);

/**
 * Media metadata type matching MediaRouter's expected format
 */
type MediaMetadata = {
  [mimeType: string]:
    | {
        width?: number;
        height?: number;
        [key: string]: unknown;
      }
    | undefined;
};

/**
 * Jupyter output types following the Jupyter message spec
 */
export interface JupyterOutput {
  /**
   * Type of output: execute_result, display_data, stream, or error
   */
  output_type: "execute_result" | "display_data" | "stream" | "error";
  /**
   * Output data as MIME bundle (for execute_result and display_data)
   */
  data?: Record<string, unknown>;
  /**
   * Metadata for the output
   */
  metadata?: Record<string, unknown>;
  /**
   * Execution count (for execute_result)
   */
  execution_count?: number | null;
  /**
   * Stream name: stdout or stderr (for stream outputs)
   */
  name?: "stdout" | "stderr";
  /**
   * Text content (for stream outputs)
   */
  text?: string | string[];
  /**
   * Error name (for error outputs)
   */
  ename?: string;
  /**
   * Error value (for error outputs)
   */
  evalue?: string;
  /**
   * Traceback lines (for error outputs)
   */
  traceback?: string[];
}

export interface CellOutputAreaProps {
  /**
   * Array of Jupyter outputs to render
   */
  outputs: JupyterOutput[];
  /**
   * Whether the output area is collapsed
   */
  collapsed?: boolean;
  /**
   * Callback when collapse state is toggled
   */
  onToggleCollapse?: () => void;
  /**
   * Maximum height in pixels before scrolling
   */
  maxHeight?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Default loading spinner for lazy-loaded MediaRouter
 */
function OutputLoading() {
  return (
    <div className="flex items-center justify-center py-4 text-muted-foreground">
      <svg
        className="h-5 w-5 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
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
    </div>
  );
}

/**
 * Render a single output based on its type
 */
function OutputItem({ output }: { output: JupyterOutput }) {
  // Handle stream outputs
  if (output.output_type === "stream" && output.text) {
    const text = Array.isArray(output.text)
      ? output.text.join("")
      : output.text;
    const isError = output.name === "stderr";
    const textColor = isError ? "text-red-600" : "text-foreground";

    return (
      <div className={cn("font-mono text-sm whitespace-pre-wrap", textColor)}>
        {text}
      </div>
    );
  }

  // Handle error outputs
  if (output.output_type === "error") {
    return (
      <div className="border-l-2 border-red-500 pl-4 py-2 text-red-600">
        {output.ename && output.evalue && (
          <div className="font-semibold">
            {output.ename}: {output.evalue}
          </div>
        )}
        {output.traceback && (
          <div className="mt-2 font-mono text-xs whitespace-pre-wrap opacity-80">
            {output.traceback.join("\n")}
          </div>
        )}
      </div>
    );
  }

  // Handle display_data and execute_result outputs with MIME data
  if (
    (output.output_type === "display_data" ||
      output.output_type === "execute_result") &&
    output.data
  ) {
    return (
      <Suspense fallback={<OutputLoading />}>
        <MediaRouter
          data={output.data}
          metadata={output.metadata as MediaMetadata | undefined}
          className="output-item"
        />
      </Suspense>
    );
  }

  // Fallback for unknown output types
  return (
    <div className="py-2 text-sm text-muted-foreground">
      Unknown output type: {output.output_type}
    </div>
  );
}

/**
 * Generate a stable key for an output based on its content and position.
 * While not perfect, this provides better stability than just index.
 */
function generateOutputKey(output: JupyterOutput, index: number): string {
  // Create a hash-like key based on output type and index
  const typePrefix = output.output_type;
  
  // Add additional discriminators when available
  if (output.output_type === "execute_result" && output.execution_count) {
    return `${typePrefix}-${output.execution_count}`;
  }
  if (output.output_type === "stream" && output.name) {
    return `${typePrefix}-${output.name}-${index}`;
  }
  if (output.output_type === "error" && output.ename) {
    return `${typePrefix}-${output.ename}-${index}`;
  }
  
  // Fallback to type + index
  return `${typePrefix}-${index}`;
}

/**
 * CellOutputArea component for rendering notebook cell outputs.
 *
 * Wraps multiple cell outputs with proper spacing, collapse/expand functionality,
 * and scroll behavior for large outputs. Uses MediaRouter to render individual
 * outputs based on their MIME types.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CellOutputArea outputs={cell.outputs} />
 *
 * // With collapse control
 * <CellOutputArea
 *   outputs={cell.outputs}
 *   collapsed={isCollapsed}
 *   onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
 * />
 *
 * // With max height for scrolling
 * <CellOutputArea
 *   outputs={cell.outputs}
 *   maxHeight={400}
 * />
 * ```
 */
export const CellOutputArea: React.FC<CellOutputAreaProps> = ({
  outputs,
  collapsed = false,
  onToggleCollapse,
  maxHeight,
  className,
}) => {
  // Don't render if no outputs
  if (!outputs || outputs.length === 0) {
    return null;
  }

  const hasToggle = onToggleCollapse !== undefined;

  return (
    <div
      className={cn(
        "cell-output-area border-t border-border bg-muted/30 px-4",
        className,
      )}
    >
      {/* Collapse toggle header */}
      {hasToggle && (
        <div
          className="flex items-center gap-1 py-2 cursor-pointer hover:text-foreground text-muted-foreground"
          onClick={onToggleCollapse}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleCollapse();
            }
          }}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand outputs" : "Collapse outputs"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span className="text-xs font-medium">
            {collapsed ? "Show" : "Hide"} {outputs.length} output
            {outputs.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Output items */}
      {!collapsed && (
        <div
          className={cn("py-3 space-y-3", maxHeight && "overflow-auto")}
          style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
        >
          {outputs.map((output, index) => (
            <div key={generateOutputKey(output, index)} className="output-wrapper">
              <OutputItem output={output} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
