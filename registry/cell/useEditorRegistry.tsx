"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
} from "react";

/**
 * Interface for editor imperative handles.
 * Cells register their editors with these methods for cross-cell navigation.
 */
export interface EditorRef {
  /**
   * Focus the editor
   */
  focus: () => void;
  /**
   * Set cursor position to start or end of content
   */
  setCursorPosition: (position: "start" | "end") => void;
}

interface EditorRegistryContextType {
  /**
   * Register an editor for a cell
   */
  registerEditor: (cellId: string, ref: EditorRef) => void;
  /**
   * Unregister an editor when cell unmounts or exits edit mode
   */
  unregisterEditor: (cellId: string) => void;
  /**
   * Focus a cell's editor by ID with cursor position
   */
  focusCell: (cellId: string, cursorPosition: "start" | "end") => void;
}

const EditorRegistryContext = createContext<EditorRegistryContextType | null>(
  null,
);

/**
 * Provider for cross-cell editor navigation.
 *
 * Maintains a registry of editor refs by cell ID, enabling cells to
 * focus each other during keyboard navigation.
 *
 * @example
 * ```tsx
 * function Notebook() {
 *   return (
 *     <EditorRegistryProvider>
 *       {cells.map(cell => <Cell key={cell.id} cell={cell} />)}
 *     </EditorRegistryProvider>
 *   );
 * }
 * ```
 */
export function EditorRegistryProvider({ children }: { children: ReactNode }) {
  const editorsRef = useRef<Map<string, EditorRef>>(new Map());

  const registerEditor = useCallback((cellId: string, ref: EditorRef) => {
    editorsRef.current.set(cellId, ref);
  }, []);

  const unregisterEditor = useCallback((cellId: string) => {
    editorsRef.current.delete(cellId);
  }, []);

  const focusCell = useCallback(
    (cellId: string, cursorPosition: "start" | "end") => {
      const editor = editorsRef.current.get(cellId);
      if (editor) {
        editor.setCursorPosition(cursorPosition);
        editor.focus();
        // Scroll the cell into view
        const cellElement = document.querySelector(
          `[data-cell-id="${cellId}"]`,
        );
        if (cellElement) {
          cellElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    },
    [],
  );

  return (
    <EditorRegistryContext.Provider
      value={{ registerEditor, unregisterEditor, focusCell }}
    >
      {children}
    </EditorRegistryContext.Provider>
  );
}

/**
 * Hook to access the editor registry for cross-cell navigation.
 *
 * @example
 * ```tsx
 * function Cell({ cell }) {
 *   const { registerEditor, unregisterEditor } = useEditorRegistry();
 *   const editorRef = useRef();
 *
 *   useEffect(() => {
 *     if (editorRef.current) {
 *       registerEditor(cell.id, {
 *         focus: () => editorRef.current?.focus(),
 *         setCursorPosition: (pos) => editorRef.current?.setCursorPosition(pos),
 *       });
 *     }
 *     return () => unregisterEditor(cell.id);
 *   }, [cell.id]);
 *
 *   return <CodeMirrorEditor ref={editorRef} ... />;
 * }
 * ```
 *
 * @throws Error if used outside EditorRegistryProvider
 */
export function useEditorRegistry() {
  const context = useContext(EditorRegistryContext);
  if (!context) {
    throw new Error(
      "useEditorRegistry must be used within EditorRegistryProvider",
    );
  }
  return context;
}

/**
 * Optional hook that returns null if not in a registry context.
 * Useful for cells that can work standalone or within a notebook.
 */
export function useEditorRegistryOptional() {
  return useContext(EditorRegistryContext);
}
