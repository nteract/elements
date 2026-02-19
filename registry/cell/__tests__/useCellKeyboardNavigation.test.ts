/**
 * Tests for useCellKeyboardNavigation hook.
 *
 * These tests verify the CodeMirror keybindings for cell navigation.
 */

import { describe, expect, it, vi } from "vitest";
import { useCellKeyboardNavigation } from "../useCellKeyboardNavigation";

// Mock EditorView for testing keybindings
function createMockView(cursorPos: number, docLength: number) {
  return {
    state: {
      selection: {
        main: { from: cursorPos },
      },
      doc: { length: docLength },
    },
  } as Parameters<
    NonNullable<ReturnType<typeof useCellKeyboardNavigation>[0]["run"]>
  >[0];
}

describe("useCellKeyboardNavigation", () => {
  describe("ArrowUp", () => {
    it("calls onFocusPrevious when cursor is at start", () => {
      const onFocusPrevious = vi.fn();
      const onFocusNext = vi.fn();

      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious,
        onFocusNext,
      });

      const arrowUp = keyMap.find((k) => k.key === "ArrowUp");
      expect(arrowUp).toBeDefined();

      const view = createMockView(0, 100);
      const result = arrowUp!.run!(view);

      expect(result).toBe(true);
      expect(onFocusPrevious).toHaveBeenCalledWith("end");
    });

    it("does not call onFocusPrevious when cursor is not at start", () => {
      const onFocusPrevious = vi.fn();
      const onFocusNext = vi.fn();

      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious,
        onFocusNext,
      });

      const arrowUp = keyMap.find((k) => k.key === "ArrowUp");
      const view = createMockView(50, 100);
      const result = arrowUp!.run!(view);

      expect(result).toBe(false);
      expect(onFocusPrevious).not.toHaveBeenCalled();
    });
  });

  describe("ArrowDown", () => {
    it("calls onFocusNext when cursor is at end", () => {
      const onFocusPrevious = vi.fn();
      const onFocusNext = vi.fn();

      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious,
        onFocusNext,
      });

      const arrowDown = keyMap.find((k) => k.key === "ArrowDown");
      expect(arrowDown).toBeDefined();

      const view = createMockView(100, 100);
      const result = arrowDown!.run!(view);

      expect(result).toBe(true);
      expect(onFocusNext).toHaveBeenCalledWith("start");
    });

    it("does not call onFocusNext when cursor is not at end", () => {
      const onFocusPrevious = vi.fn();
      const onFocusNext = vi.fn();

      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious,
        onFocusNext,
      });

      const arrowDown = keyMap.find((k) => k.key === "ArrowDown");
      const view = createMockView(50, 100);
      const result = arrowDown!.run!(view);

      expect(result).toBe(false);
      expect(onFocusNext).not.toHaveBeenCalled();
    });
  });

  describe("Backspace", () => {
    it("deletes cell when cursor at start of empty document", () => {
      const onFocusPrevious = vi.fn();
      const onFocusNext = vi.fn();
      const onDelete = vi.fn();

      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious,
        onFocusNext,
        onDelete,
      });

      const backspace = keyMap.find((k) => k.key === "Backspace");
      expect(backspace).toBeDefined();

      const view = createMockView(0, 0);
      const result = backspace!.run!(view);

      expect(result).toBe(true);
      expect(onFocusPrevious).toHaveBeenCalledWith("end");
      expect(onDelete).toHaveBeenCalled();
    });

    it("does not delete when document has content", () => {
      const onFocusPrevious = vi.fn();
      const onFocusNext = vi.fn();
      const onDelete = vi.fn();

      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious,
        onFocusNext,
        onDelete,
      });

      const backspace = keyMap.find((k) => k.key === "Backspace");
      const view = createMockView(0, 10);
      const result = backspace!.run!(view);

      expect(result).toBe(false);
      expect(onDelete).not.toHaveBeenCalled();
    });

    it("is not included when onDelete is not provided", () => {
      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious: vi.fn(),
        onFocusNext: vi.fn(),
      });

      const backspace = keyMap.find((k) => k.key === "Backspace");
      expect(backspace).toBeUndefined();
    });
  });

  describe("Shift-Enter", () => {
    it("executes and moves to next cell", () => {
      const onFocusPrevious = vi.fn();
      const onFocusNext = vi.fn();
      const onExecute = vi.fn();

      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious,
        onFocusNext,
        onExecute,
      });

      const shiftEnter = keyMap.find((k) => k.key === "Shift-Enter");
      expect(shiftEnter).toBeDefined();

      const view = createMockView(0, 100);
      const result = shiftEnter!.run!(view);

      expect(result).toBe(true);
      expect(onExecute).toHaveBeenCalled();
      expect(onFocusNext).toHaveBeenCalledWith("start");
    });

    it("is not included when onExecute is not provided", () => {
      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious: vi.fn(),
        onFocusNext: vi.fn(),
      });

      const shiftEnter = keyMap.find((k) => k.key === "Shift-Enter");
      expect(shiftEnter).toBeUndefined();
    });
  });

  describe("Mod-Enter", () => {
    it("executes without moving", () => {
      const onFocusPrevious = vi.fn();
      const onFocusNext = vi.fn();
      const onExecute = vi.fn();

      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious,
        onFocusNext,
        onExecute,
      });

      const modEnter = keyMap.find((k) => k.key === "Mod-Enter");
      expect(modEnter).toBeDefined();

      const view = createMockView(0, 100);
      const result = modEnter!.run!(view);

      expect(result).toBe(true);
      expect(onExecute).toHaveBeenCalled();
      expect(onFocusNext).not.toHaveBeenCalled();
    });
  });

  describe("Alt-Enter", () => {
    it("calls onExecuteAndInsert", () => {
      const onFocusPrevious = vi.fn();
      const onFocusNext = vi.fn();
      const onExecuteAndInsert = vi.fn();

      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious,
        onFocusNext,
        onExecuteAndInsert,
      });

      const altEnter = keyMap.find((k) => k.key === "Alt-Enter");
      expect(altEnter).toBeDefined();

      const view = createMockView(0, 100);
      const result = altEnter!.run!(view);

      expect(result).toBe(true);
      expect(onExecuteAndInsert).toHaveBeenCalled();
    });

    it("is not included when onExecuteAndInsert is not provided", () => {
      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious: vi.fn(),
        onFocusNext: vi.fn(),
      });

      const altEnter = keyMap.find((k) => k.key === "Alt-Enter");
      expect(altEnter).toBeUndefined();
    });
  });

  describe("Mod-Shift-f", () => {
    it("calls onFormat", () => {
      const onFocusPrevious = vi.fn();
      const onFocusNext = vi.fn();
      const onFormat = vi.fn();

      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious,
        onFocusNext,
        onFormat,
      });

      const format = keyMap.find((k) => k.key === "Mod-Shift-f");
      expect(format).toBeDefined();

      const view = createMockView(0, 100);
      const result = format!.run!(view);

      expect(result).toBe(true);
      expect(onFormat).toHaveBeenCalled();
    });

    it("is not included when onFormat is not provided", () => {
      const keyMap = useCellKeyboardNavigation({
        onFocusPrevious: vi.fn(),
        onFocusNext: vi.fn(),
      });

      const format = keyMap.find((k) => k.key === "Mod-Shift-f");
      expect(format).toBeUndefined();
    });
  });
});
