"use client";

import { useEffect, useState } from "react";

interface IsolatedRendererBundle {
  rendererCode: string | undefined;
  rendererCss: string | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Module-level cache (shared across all hook instances)
let bundleCache: { js: string; css: string } | null = null;
let loadingPromise: Promise<{ js: string; css: string }> | null = null;

/**
 * Hook to load the isolated renderer bundle.
 * Caches the result so subsequent calls return immediately.
 *
 * @param basePath - Base path to fetch bundle from (default: "/isolated")
 */
export function useIsolatedRendererBundle(
  basePath = "/isolated",
): IsolatedRendererBundle {
  const [state, setState] = useState<IsolatedRendererBundle>(() => ({
    rendererCode: bundleCache?.js,
    rendererCss: bundleCache?.css,
    isLoading: !bundleCache,
    error: null,
  }));

  useEffect(() => {
    if (bundleCache) return;

    let cancelled = false;

    if (!loadingPromise) {
      loadingPromise = Promise.all([
        fetch(`${basePath}/isolated-renderer.js`).then((r) => {
          if (!r.ok)
            throw new Error(`Failed to fetch renderer JS: ${r.status}`);
          return r.text();
        }),
        fetch(`${basePath}/isolated-renderer.css`).then((r) => {
          if (!r.ok)
            throw new Error(`Failed to fetch renderer CSS: ${r.status}`);
          return r.text();
        }),
      ]).then(([js, css]) => {
        bundleCache = { js, css };
        return bundleCache;
      });
    }

    loadingPromise
      .then(({ js, css }) => {
        if (!cancelled) {
          setState({
            rendererCode: js,
            rendererCss: css,
            isLoading: false,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState((s) => ({ ...s, isLoading: false, error }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [basePath]);

  return state;
}
