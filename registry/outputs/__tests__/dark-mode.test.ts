/**
 * Tests for dark-mode.ts theme detection utilities.
 *
 * These tests verify:
 * 1. Pure detection functions work correctly
 * 2. Multiple theme patterns are detected
 * 3. Priority order is correct (document > system)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { documentHasDarkMode, isDarkMode, prefersDarkMode } from "../dark-mode";

// Mock matchMedia globally since jsdom doesn't implement it
function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("prefersDarkMode", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when system prefers dark mode", () => {
    mockMatchMedia(true);
    expect(prefersDarkMode()).toBe(true);
  });

  it("returns false when system prefers light mode", () => {
    mockMatchMedia(false);
    expect(prefersDarkMode()).toBe(false);
  });
});

describe("documentHasDarkMode", () => {
  afterEach(() => {
    // Clean up after each test
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.style.colorScheme = "";
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-mode");
  });

  it("returns true when html has class 'dark'", () => {
    document.documentElement.classList.add("dark");
    expect(documentHasDarkMode()).toBe(true);
  });

  it("returns false when html has no dark indicators", () => {
    expect(documentHasDarkMode()).toBe(false);
  });

  it("returns true when color-scheme is dark", () => {
    document.documentElement.style.colorScheme = "dark";
    expect(documentHasDarkMode()).toBe(true);
  });

  it("returns true when data-theme is dark", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    expect(documentHasDarkMode()).toBe(true);
  });

  it("returns true when data-mode is dark", () => {
    document.documentElement.setAttribute("data-mode", "dark");
    expect(documentHasDarkMode()).toBe(true);
  });

  it("returns false when data-theme is light", () => {
    document.documentElement.setAttribute("data-theme", "light");
    expect(documentHasDarkMode()).toBe(false);
  });
});

describe("isDarkMode", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.style.colorScheme = "";
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-mode");
  });

  it("returns true when document has dark class", () => {
    document.documentElement.classList.add("dark");
    expect(isDarkMode()).toBe(true);
  });

  it("returns false when document has light class", () => {
    document.documentElement.classList.add("light");
    expect(isDarkMode()).toBe(false);
  });

  it("returns false when color-scheme is light", () => {
    document.documentElement.style.colorScheme = "light";
    expect(isDarkMode()).toBe(false);
  });

  it("prioritizes document state over system preference", () => {
    // System prefers dark
    mockMatchMedia(true);

    // But document has explicit light class
    document.documentElement.classList.add("light");

    // Document state wins
    expect(isDarkMode()).toBe(false);
  });

  it("falls back to system preference when no document state", () => {
    mockMatchMedia(true);
    expect(isDarkMode()).toBe(true);
  });

  it("returns false when system prefers light and no document state", () => {
    mockMatchMedia(false);
    expect(isDarkMode()).toBe(false);
  });
});

// Note: useDarkMode hook tests would require @testing-library/react-hooks
// or a React testing environment. The hook is tested indirectly through
// component tests in markdown-output.test.tsx if needed.
