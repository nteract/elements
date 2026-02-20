"use client";

import { useState } from "react";
import { MarkdownCell } from "@/registry/cell/MarkdownCell";
import {
  EditorRegistryProvider,
  useEditorRegistry,
} from "@/registry/cell/useEditorRegistry";

const SAMPLE_MARKDOWN = `# Hello World

This is a **markdown cell** with:

- Rich text formatting
- Code blocks
- Math support

\`\`\`python
print("Hello from a code block!")
\`\`\`

Double-click to edit, press **Escape** to exit edit mode.
`;

/**
 * Basic demo showing a single MarkdownCell
 */
export function MarkdownCellBasicDemo() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      <MarkdownCell
        cell={{ id: "demo-1", source }}
        isFocused={isFocused}
        onFocus={() => setIsFocused(true)}
        onUpdateSource={setSource}
        onDelete={() => alert("Delete clicked")}
      />
    </div>
  );
}

/**
 * Demo showing empty cell starting in edit mode
 */
export function MarkdownCellEmptyDemo() {
  const [source, setSource] = useState("");
  const [isFocused, setIsFocused] = useState(true);

  return (
    <div>
      <MarkdownCell
        cell={{ id: "demo-empty", source }}
        isFocused={isFocused}
        onFocus={() => setIsFocused(true)}
        onUpdateSource={setSource}
      />
    </div>
  );
}

/**
 * Multi-cell demo with keyboard navigation
 */
function MultiCellContent() {
  const [cells, setCells] = useState([
    {
      id: "cell-1",
      source: "# First Cell\n\nThis is the first markdown cell.",
    },
    {
      id: "cell-2",
      source: "## Second Cell\n\nNavigate with **Arrow keys** at boundaries.",
    },
    {
      id: "cell-3",
      source: "### Third Cell\n\nPress `Shift+Enter` to move to next cell.",
    },
  ]);
  const [focusedId, setFocusedId] = useState<string | null>("cell-1");
  const { focusCell } = useEditorRegistry();

  const updateSource = (id: string, source: string) => {
    setCells((prev) => prev.map((c) => (c.id === id ? { ...c, source } : c)));
  };

  const deleteCell = (id: string) => {
    if (cells.length <= 1) return;
    const idx = cells.findIndex((c) => c.id === id);
    setCells((prev) => prev.filter((c) => c.id !== id));
    // Focus previous or next cell
    if (idx > 0) {
      setFocusedId(cells[idx - 1].id);
    } else if (cells.length > 1) {
      setFocusedId(cells[1].id);
    }
  };

  const handleFocusPrevious = (idx: number, pos: "start" | "end") => {
    if (idx > 0) {
      const prevId = cells[idx - 1].id;
      setFocusedId(prevId);
      focusCell(prevId, pos);
    }
  };

  const handleFocusNext = (idx: number, pos: "start" | "end") => {
    if (idx < cells.length - 1) {
      const nextId = cells[idx + 1].id;
      setFocusedId(nextId);
      focusCell(nextId, pos);
    }
  };

  const insertCellAfter = (idx: number) => {
    const newId = `cell-${Date.now()}`;
    const newCell = { id: newId, source: "" };
    setCells((prev) => [
      ...prev.slice(0, idx + 1),
      newCell,
      ...prev.slice(idx + 1),
    ]);
    setFocusedId(newId);
  };

  return (
    <div>
      {cells.map((cell, idx) => (
        <MarkdownCell
          key={cell.id}
          cell={cell}
          isFocused={focusedId === cell.id}
          onFocus={() => setFocusedId(cell.id)}
          onUpdateSource={(source) => updateSource(cell.id, source)}
          onDelete={() => deleteCell(cell.id)}
          onFocusPrevious={(pos) => handleFocusPrevious(idx, pos)}
          onFocusNext={(pos) => handleFocusNext(idx, pos)}
          onInsertCellAfter={() => insertCellAfter(idx)}
          isLastCell={idx === cells.length - 1}
        />
      ))}
    </div>
  );
}

export function MarkdownCellMultiDemo() {
  return (
    <EditorRegistryProvider>
      <MultiCellContent />
    </EditorRegistryProvider>
  );
}
