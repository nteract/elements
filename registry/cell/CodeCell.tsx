"use client";

import type { KeyBinding } from "@codemirror/view";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  CodeMirrorEditor,
  type CodeMirrorEditorRef,
} from "@/registry/editor/codemirror-editor";
import type { SupportedLanguage } from "@/registry/editor/languages";
import { CellContainer } from "./CellContainer";
import { CompactExecutionButton } from "./CompactExecutionButton";
import type { JupyterOutput } from "./OutputArea";
import { OutputArea } from "./OutputArea";
import { useCellKeyboardNavigation } from "./useCellKeyboardNavigation";
import { useEditorRegistryOptional } from "./useEditorRegistry";

/**
 * Code cell data shape (matches Jupyter nbformat)
 */
export interface CodeCellData {
  id: string;
  source: string;
  outputs: JupyterOutput[];
  execution_count: number | null;
}

interface CodeCellProps {
  /**
   * The cell data containing id, source, outputs, and execution count
   */
  cell: CodeCellData;
  /**
   * Programming language for syntax highlighting
   * @default "python"
   */
  language?: SupportedLanguage;
  /**
   * Whether this cell is focused
   */
  isFocused?: boolean;
  /**
   * Whether the cell is currently executing
   */
  isExecuting?: boolean;
  /**
   * Callback when cell is focused
   */
  onFocus?: () => void;
  /**
   * Callback when source content changes
   */
  onUpdateSource: (source: string) => void;
  /**
   * Callback to execute the cell
   */
  onExecute?: () => void;
  /**
   * Callback to interrupt execution
   */
  onInterrupt?: () => void;
  /**
   * Callback to delete the cell
   */
  onDelete?: () => void;
  /**
   * Callback to focus previous cell (for keyboard navigation)
   */
  onFocusPrevious?: (cursorPosition: "start" | "end") => void;
  /**
   * Callback to focus next cell (for keyboard navigation)
   */
  onFocusNext?: (cursorPosition: "start" | "end") => void;
  /**
   * Callback to insert a new cell after this one
   */
  onInsertCellAfter?: () => void;
  /**
   * Callback to format the cell code
   */
  onFormat?: () => void;
  /**
   * Whether this is the last cell (affects Enter behavior)
   */
  isLastCell?: boolean;
  /**
   * Additional CodeMirror extensions
   */
  extensions?: Parameters<typeof CodeMirrorEditor>[0]["extensions"];
  /**
   * Whether to use the React renderer bundle inside the iframe for outputs.
   * @default true
   */
  useReactRenderer?: boolean;
  /**
   * Inline renderer JavaScript bundle for the iframe.
   */
  rendererCode?: string;
  /**
   * Inline renderer CSS for the iframe.
   */
  rendererCss?: string;
  /**
   * Additional class name for the container
   */
  className?: string;
}

/**
 * CodeCell renders a code cell with editor and output area.
 *
 * Features:
 * - CodeMirror editor with language syntax highlighting
 * - Execution count display with play/interrupt button
 * - Output rendering via OutputArea (with isolation support)
 * - Keyboard shortcuts for execute, navigate, delete
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CodeCell
 *   cell={{ id: "1", source: "print('hi')", outputs: [], execution_count: null }}
 *   onUpdateSource={setSource}
 *   onExecute={() => runCell(id)}
 * />
 *
 * // With navigation (in a notebook)
 * <EditorRegistryProvider>
 *   {cells.map((cell, i) => (
 *     <CodeCell
 *       key={cell.id}
 *       cell={cell}
 *       isFocused={focusedId === cell.id}
 *       isExecuting={executingId === cell.id}
 *       onFocus={() => setFocusedId(cell.id)}
 *       onUpdateSource={(source) => updateCell(cell.id, source)}
 *       onExecute={() => executeCell(cell.id)}
 *       onInterrupt={() => interruptCell(cell.id)}
 *       onDelete={() => deleteCell(cell.id)}
 *       onFocusPrevious={(pos) => focusPrev(i, pos)}
 *       onFocusNext={(pos) => focusNext(i, pos)}
 *     />
 *   ))}
 * </EditorRegistryProvider>
 * ```
 */
export function CodeCell({
  cell,
  language = "python",
  isFocused = false,
  isExecuting = false,
  onFocus,
  onUpdateSource,
  onExecute,
  onInterrupt,
  onDelete,
  onFocusPrevious,
  onFocusNext,
  onInsertCellAfter,
  onFormat,
  isLastCell = false,
  extensions,
  useReactRenderer = true,
  rendererCode,
  rendererCss,
  className,
}: CodeCellProps) {
  const editorRef = useRef<CodeMirrorEditorRef>(null);

  // Optional editor registry for cross-cell navigation
  const registry = useEditorRegistryOptional();

  // Register editor with the registry for cross-cell navigation
  useEffect(() => {
    if (editorRef.current && registry) {
      registry.registerEditor(cell.id, {
        focus: () => editorRef.current?.focus(),
        setCursorPosition: (position) =>
          editorRef.current?.setCursorPosition(position),
      });
    }
    return () => registry?.unregisterEditor(cell.id);
  }, [cell.id, registry]);

  // Handle focus next, creating a new cell if at the end
  const handleFocusNextOrCreate = useCallback(
    (cursorPosition: "start" | "end") => {
      if (isLastCell && onInsertCellAfter) {
        onInsertCellAfter();
      } else if (onFocusNext) {
        onFocusNext(cursorPosition);
      }
    },
    [isLastCell, onFocusNext, onInsertCellAfter],
  );

  // Get keyboard navigation bindings
  const navigationKeyMap = useCellKeyboardNavigation({
    onFocusPrevious: onFocusPrevious ?? (() => {}),
    onFocusNext: handleFocusNextOrCreate,
    onExecute,
    onExecuteAndInsert: onInsertCellAfter
      ? () => {
          onExecute?.();
          onInsertCellAfter();
        }
      : undefined,
    onDelete,
    onFormat,
  });

  const keyMap: KeyBinding[] = useMemo(
    () => [...navigationKeyMap],
    [navigationKeyMap],
  );

  const handleExecute = useCallback(() => {
    onExecute?.();
  }, [onExecute]);

  const gutterContent = (
    <CompactExecutionButton
      count={cell.execution_count}
      isExecuting={isExecuting}
      onExecute={handleExecute}
      onInterrupt={onInterrupt}
    />
  );

  const rightGutterContent = onDelete ? (
    <button
      type="button"
      onClick={onDelete}
      className="flex items-center justify-center rounded p-1 text-muted-foreground/40 transition-colors hover:text-destructive"
      title="Delete cell"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  ) : undefined;

  return (
    <CellContainer
      id={cell.id}
      cellType="code"
      isFocused={isFocused}
      onFocus={onFocus}
      gutterContent={gutterContent}
      rightGutterContent={rightGutterContent}
      className={className}
      codeContent={
        <div>
          <CodeMirrorEditor
            ref={editorRef}
            value={cell.source}
            language={language}
            onValueChange={onUpdateSource}
            keyMap={keyMap}
            extensions={extensions}
            placeholder="Enter code..."
            className="min-h-[2rem]"
            autoFocus={isFocused}
          />
        </div>
      }
      outputContent={
        <OutputArea
          outputs={cell.outputs}
          preloadIframe
          useReactRenderer={useReactRenderer}
          rendererCode={rendererCode}
          rendererCss={rendererCss}
        />
      }
      hideOutput={cell.outputs.length === 0}
    />
  );
}
