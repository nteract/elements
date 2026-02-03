"use client";

import { lazy, Suspense, type ReactNode } from "react";

// Lazy load output components for better bundle splitting
const AnsiOutput = lazy(() =>
  import("./ansi-output").then((m) => ({ default: m.AnsiOutput })),
);
const MarkdownOutput = lazy(() =>
  import("./markdown-output").then((m) => ({ default: m.MarkdownOutput })),
);
const HtmlOutput = lazy(() =>
  import("./html-output").then((m) => ({ default: m.HtmlOutput })),
);
const ImageOutput = lazy(() =>
  import("./image-output").then((m) => ({ default: m.ImageOutput })),
);
const SvgOutput = lazy(() =>
  import("./svg-output").then((m) => ({ default: m.SvgOutput })),
);
const JsonOutput = lazy(() =>
  import("./json-output").then((m) => ({ default: m.JsonOutput })),
);

/**
 * MIME type priority order for rendering.
 * Higher priority types are preferred when multiple are available.
 */
const MIME_TYPE_PRIORITY = [
  // Rich formats first
  "application/vnd.jupyter.widget-view+json",
  "application/vnd.plotly.v1+json",
  "application/vnd.vegalite.v5+json",
  "application/vnd.vegalite.v4+json",
  "application/vnd.vegalite.v3+json",
  "application/vnd.vega.v5+json",
  "application/vnd.vega.v4+json",
  "application/geo+json",
  // HTML and markdown
  "text/html",
  "text/markdown",
  // Images
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  // Structured data
  "application/json",
  // Plain text (fallback)
  "text/plain",
] as const;

type MimeType = (typeof MIME_TYPE_PRIORITY)[number] | string;

interface OutputData {
  [mimeType: string]: unknown;
}

interface OutputMetadata {
  [mimeType: string]:
    | {
        width?: number;
        height?: number;
        [key: string]: unknown;
      }
    | undefined;
}

interface OutputRouterProps {
  /**
   * Output data object mapping MIME types to content.
   * e.g., { "text/plain": "Hello", "text/html": "<b>Hello</b>" }
   */
  data: OutputData;
  /**
   * Output metadata object mapping MIME types to their metadata.
   * e.g., { "image/png": { width: 400, height: 300 } }
   * Used for image dimensions, JSON display settings, etc.
   */
  metadata?: OutputMetadata;
  /**
   * Whether to allow unsafe HTML rendering (requires iframe).
   * Applies to text/html MIME type.
   */
  unsafe?: boolean;
  /**
   * Custom fallback component when no supported MIME type is found.
   */
  fallback?: ReactNode;
  /**
   * Loading component shown while lazy-loading output components.
   */
  loading?: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Select the best MIME type from available data based on priority.
 */
function selectMimeType(data: OutputData): MimeType | null {
  const availableTypes = Object.keys(data);

  // Check priority list first
  for (const mimeType of MIME_TYPE_PRIORITY) {
    if (availableTypes.includes(mimeType) && data[mimeType] != null) {
      return mimeType;
    }
  }

  // Fall back to first available type
  const firstAvailable = availableTypes.find((type) => data[type] != null);
  return firstAvailable || null;
}

/**
 * Default loading spinner
 */
function DefaultLoading() {
  return (
    <div className="flex items-center justify-center py-4 text-gray-400">
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
 * OutputRouter component for rendering Jupyter outputs based on MIME type.
 *
 * Automatically selects the best available renderer for the output data,
 * following Jupyter's MIME type priority conventions.
 *
 * @example
 * ```tsx
 * <OutputRouter
 *   data={{
 *     "text/plain": "Hello, World!",
 *     "text/html": "<b>Hello, World!</b>"
 *   }}
 * />
 * ```
 */
export function OutputRouter({
  data,
  metadata = {},
  unsafe = false,
  fallback,
  loading,
  className = "",
}: OutputRouterProps) {
  const mimeType = selectMimeType(data);

  if (!mimeType) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="py-2 text-sm text-gray-500">No displayable output</div>
    );
  }

  const content = data[mimeType];
  const mimeMetadata = metadata[mimeType] || {};
  const loadingComponent = loading || <DefaultLoading />;

  const renderOutput = () => {
    // Text/Markdown
    if (mimeType === "text/markdown") {
      return (
        <MarkdownOutput
          content={String(content)}
          unsafe={unsafe}
          className={className}
        />
      );
    }

    // HTML
    if (mimeType === "text/html") {
      return (
        <HtmlOutput
          content={String(content)}
          unsafe={unsafe}
          className={className}
        />
      );
    }

    // Images
    if (mimeType.startsWith("image/") && mimeType !== "image/svg+xml") {
      const imageType = mimeType as
        | "image/png"
        | "image/jpeg"
        | "image/gif"
        | "image/webp";
      return (
        <ImageOutput
          data={String(content)}
          mediaType={imageType}
          width={mimeMetadata.width}
          height={mimeMetadata.height}
          className={className}
        />
      );
    }

    // SVG
    if (mimeType === "image/svg+xml") {
      return <SvgOutput data={String(content)} className={className} />;
    }

    // JSON and structured data
    if (
      mimeType === "application/json" ||
      mimeType.includes("+json") ||
      mimeType === "application/geo+json"
    ) {
      return (
        <JsonOutput
          data={content}
          collapsed={mimeMetadata.collapsed as boolean | number | undefined}
          className={className}
        />
      );
    }

    // Plain text (may contain ANSI)
    if (mimeType === "text/plain") {
      return <AnsiOutput className={className}>{String(content)}</AnsiOutput>;
    }

    // Unknown type - render as plain text
    return <AnsiOutput className={className}>{String(content)}</AnsiOutput>;
  };

  return <Suspense fallback={loadingComponent}>{renderOutput()}</Suspense>;
}

/**
 * Get the selected MIME type for debugging/display purposes.
 */
export function getSelectedMimeType(data: OutputData): string | null {
  return selectMimeType(data);
}

export default OutputRouter;
