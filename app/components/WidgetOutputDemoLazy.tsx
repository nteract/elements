"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-loaded wrapper for WidgetOutputDemo.
 *
 * The @jupyter-widgets/html-manager library accesses `document` at module load time,
 * so we must use dynamic import with ssr: false to prevent SSR errors.
 */
export const WidgetOutputDemo = dynamic(
  () =>
    import("./WidgetOutputDemo").then((mod) => ({
      default: mod.WidgetOutputDemo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
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
        <span>Loading widget demo...</span>
      </div>
    ),
  },
);

export const WidgetOutputInteractiveDemo = dynamic(
  () =>
    import("./WidgetOutputDemo").then((mod) => ({
      default: mod.WidgetOutputInteractiveDemo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
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
        <span>Loading widget demo...</span>
      </div>
    ),
  },
);
