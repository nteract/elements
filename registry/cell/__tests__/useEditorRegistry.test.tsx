/**
 * Tests for useEditorRegistry hook and EditorRegistryProvider.
 *
 * These tests verify the cross-cell navigation context.
 */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  type EditorRef,
  EditorRegistryProvider,
  useEditorRegistry,
  useEditorRegistryOptional,
} from "../useEditorRegistry";

describe("useEditorRegistry", () => {
  it("throws when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useEditorRegistry());
    }).toThrow("useEditorRegistry must be used within EditorRegistryProvider");

    consoleSpy.mockRestore();
  });

  it("provides register and unregister functions", () => {
    const { result } = renderHook(() => useEditorRegistry(), {
      wrapper: EditorRegistryProvider,
    });

    expect(result.current.registerEditor).toBeDefined();
    expect(result.current.unregisterEditor).toBeDefined();
    expect(result.current.focusCell).toBeDefined();
  });

  it("registers and focuses an editor", () => {
    const mockFocus = vi.fn();
    const mockSetCursor = vi.fn();
    const mockEditor: EditorRef = {
      focus: mockFocus,
      setCursorPosition: mockSetCursor,
    };

    const { result } = renderHook(() => useEditorRegistry(), {
      wrapper: EditorRegistryProvider,
    });

    act(() => {
      result.current.registerEditor("cell-1", mockEditor);
    });

    act(() => {
      result.current.focusCell("cell-1", "start");
    });

    expect(mockSetCursor).toHaveBeenCalledWith("start");
    expect(mockFocus).toHaveBeenCalled();
  });

  it("focuses with end cursor position", () => {
    const mockFocus = vi.fn();
    const mockSetCursor = vi.fn();
    const mockEditor: EditorRef = {
      focus: mockFocus,
      setCursorPosition: mockSetCursor,
    };

    const { result } = renderHook(() => useEditorRegistry(), {
      wrapper: EditorRegistryProvider,
    });

    act(() => {
      result.current.registerEditor("cell-1", mockEditor);
    });

    act(() => {
      result.current.focusCell("cell-1", "end");
    });

    expect(mockSetCursor).toHaveBeenCalledWith("end");
    expect(mockFocus).toHaveBeenCalled();
  });

  it("does nothing when focusing unregistered cell", () => {
    const { result } = renderHook(() => useEditorRegistry(), {
      wrapper: EditorRegistryProvider,
    });

    // Should not throw
    act(() => {
      result.current.focusCell("nonexistent", "start");
    });
  });

  it("unregisters editor correctly", () => {
    const mockFocus = vi.fn();
    const mockSetCursor = vi.fn();
    const mockEditor: EditorRef = {
      focus: mockFocus,
      setCursorPosition: mockSetCursor,
    };

    const { result } = renderHook(() => useEditorRegistry(), {
      wrapper: EditorRegistryProvider,
    });

    act(() => {
      result.current.registerEditor("cell-1", mockEditor);
    });

    act(() => {
      result.current.unregisterEditor("cell-1");
    });

    act(() => {
      result.current.focusCell("cell-1", "start");
    });

    // Should not be called after unregister
    expect(mockFocus).not.toHaveBeenCalled();
    expect(mockSetCursor).not.toHaveBeenCalled();
  });

  it("handles multiple editors", () => {
    const mockEditor1: EditorRef = {
      focus: vi.fn(),
      setCursorPosition: vi.fn(),
    };
    const mockEditor2: EditorRef = {
      focus: vi.fn(),
      setCursorPosition: vi.fn(),
    };

    const { result } = renderHook(() => useEditorRegistry(), {
      wrapper: EditorRegistryProvider,
    });

    act(() => {
      result.current.registerEditor("cell-1", mockEditor1);
      result.current.registerEditor("cell-2", mockEditor2);
    });

    act(() => {
      result.current.focusCell("cell-2", "start");
    });

    expect(mockEditor1.focus).not.toHaveBeenCalled();
    expect(mockEditor2.focus).toHaveBeenCalled();
  });

  it("replaces editor when re-registered", () => {
    const mockEditor1: EditorRef = {
      focus: vi.fn(),
      setCursorPosition: vi.fn(),
    };
    const mockEditor2: EditorRef = {
      focus: vi.fn(),
      setCursorPosition: vi.fn(),
    };

    const { result } = renderHook(() => useEditorRegistry(), {
      wrapper: EditorRegistryProvider,
    });

    act(() => {
      result.current.registerEditor("cell-1", mockEditor1);
    });

    act(() => {
      result.current.registerEditor("cell-1", mockEditor2);
    });

    act(() => {
      result.current.focusCell("cell-1", "start");
    });

    expect(mockEditor1.focus).not.toHaveBeenCalled();
    expect(mockEditor2.focus).toHaveBeenCalled();
  });
});

describe("useEditorRegistryOptional", () => {
  it("returns null when used outside provider", () => {
    const { result } = renderHook(() => useEditorRegistryOptional());
    expect(result.current).toBeNull();
  });

  it("returns context when used inside provider", () => {
    const { result } = renderHook(() => useEditorRegistryOptional(), {
      wrapper: EditorRegistryProvider,
    });

    expect(result.current).not.toBeNull();
    expect(result.current?.registerEditor).toBeDefined();
    expect(result.current?.unregisterEditor).toBeDefined();
    expect(result.current?.focusCell).toBeDefined();
  });
});
