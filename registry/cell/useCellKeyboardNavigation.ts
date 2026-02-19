import type { EditorView, KeyBinding } from "@codemirror/view";

interface UseCellKeyboardNavigationOptions {
  /**
   * Callback when user navigates to previous cell (ArrowUp at start of content)
   */
  onFocusPrevious: (cursorPosition: "start" | "end") => void;
  /**
   * Callback when user navigates to next cell (ArrowDown at end of content)
   */
  onFocusNext: (cursorPosition: "start" | "end") => void;
  /**
   * Callback to execute the cell (Shift+Enter, Mod+Enter, Ctrl+Enter)
   */
  onExecute?: () => void;
  /**
   * Callback to execute and insert a new cell (Alt+Enter)
   */
  onExecuteAndInsert?: () => void;
  /**
   * Callback to delete the cell (Backspace on empty cell)
   */
  onDelete?: () => void;
  /**
   * Callback to format the cell (Mod+Shift+F)
   */
  onFormat?: () => void;
}

/**
 * Hook that returns CodeMirror keybindings for cell navigation and actions.
 *
 * Provides standard notebook keyboard shortcuts:
 * - ArrowUp at start → focus previous cell
 * - ArrowDown at end → focus next cell
 * - Backspace on empty → delete cell
 * - Shift+Enter → execute and focus next
 * - Mod+Enter / Ctrl+Enter → execute
 * - Alt+Enter → execute and insert new cell
 * - Mod+Shift+F → format
 *
 * @example
 * ```tsx
 * const keyMap = useCellKeyboardNavigation({
 *   onFocusPrevious: (pos) => focusCell(prevCellId, pos),
 *   onFocusNext: (pos) => focusCell(nextCellId, pos),
 *   onExecute: () => executeCell(cellId),
 *   onDelete: () => deleteCell(cellId),
 * });
 *
 * <CodeMirrorEditor keyMap={keyMap} ... />
 * ```
 */
export function useCellKeyboardNavigation({
  onFocusPrevious,
  onFocusNext,
  onExecute,
  onExecuteAndInsert,
  onDelete,
  onFormat,
}: UseCellKeyboardNavigationOptions): KeyBinding[] {
  return [
    {
      key: "ArrowUp",
      run: (view) => {
        const { from } = view.state.selection.main;
        if (from === 0) {
          onFocusPrevious("end");
          return true;
        }
        return false;
      },
    },
    {
      key: "ArrowDown",
      run: (view) => {
        const { from } = view.state.selection.main;
        const docLength = view.state.doc.length;
        if (from === docLength) {
          onFocusNext("start");
          return true;
        }
        return false;
      },
    },
    ...(onDelete
      ? [
          {
            key: "Backspace",
            run: (view: EditorView) => {
              const { from } = view.state.selection.main;
              const docLength = view.state.doc.length;
              // Delete cell if cursor at start AND cell is empty
              if (from === 0 && docLength === 0) {
                onFocusPrevious("end");
                onDelete();
                return true;
              }
              return false;
            },
          },
        ]
      : []),
    ...(onExecute
      ? [
          {
            key: "Shift-Enter",
            run: () => {
              onExecute();
              onFocusNext("start");
              return true;
            },
          },
          {
            key: "Mod-Enter",
            run: () => {
              onExecute();
              return true;
            },
          },
          {
            key: "Ctrl-Enter",
            run: () => {
              onExecute();
              return true;
            },
          },
        ]
      : []),
    ...(onExecuteAndInsert
      ? [
          {
            key: "Alt-Enter",
            run: () => {
              onExecuteAndInsert();
              return true;
            },
          },
        ]
      : []),
    ...(onFormat
      ? [
          {
            key: "Mod-Shift-f",
            run: () => {
              onFormat();
              return true;
            },
          },
        ]
      : []),
  ];
}
