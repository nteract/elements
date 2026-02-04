import { Extension } from "@codemirror/state";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";

/**
 * Theme mode options
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Light theme - GitHub Light
 */
export const lightTheme: Extension = githubLight;

/**
 * Dark theme - GitHub Dark
 */
export const darkTheme: Extension = githubDark;

/**
 * Get the appropriate theme extension based on mode
 */
export function getTheme(mode: ThemeMode): Extension {
  if (mode === "light") {
    return lightTheme;
  }
  if (mode === "dark") {
    return darkTheme;
  }
  // System mode - detect from media query
  if (typeof window !== "undefined") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? darkTheme : lightTheme;
  }
  // SSR fallback
  return lightTheme;
}

/**
 * Check if the current environment prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Check if the document has a dark class (common pattern for site-level dark mode)
 * Works with Tailwind's dark mode class strategy
 */
export function documentHasDarkClass(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return document.documentElement.classList.contains("dark");
}

/**
 * Detect dark mode from either system preference or document class
 * Prioritizes document class (site-level toggle) over system preference
 */
export function isDarkMode(): boolean {
  // Check document class first (site-level dark mode toggle)
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) {
      return true;
    }
    // Also check for data-theme attribute (another common pattern)
    if (document.documentElement.getAttribute("data-theme") === "dark") {
      return true;
    }
  }
  // Fall back to system preference
  return prefersDarkMode();
}

/**
 * Get the current theme based on automatic detection
 * Checks document class, data-theme attribute, and system preference
 */
export function getAutoTheme(): Extension {
  return isDarkMode() ? darkTheme : lightTheme;
}
