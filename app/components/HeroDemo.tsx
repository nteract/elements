"use client";

/**
 * Hero demo for the Getting Started page.
 * Shows a mini notebook with markdown cells and editable HTML code cells.
 */

import { useState } from "react";
import { CellBetweener } from "@/registry/cell/CellBetweener";
import { CellContainer } from "@/registry/cell/CellContainer";
import type { CellType } from "@/registry/cell/CellTypeButton";
import { CompactExecutionButton } from "@/registry/cell/CompactExecutionButton";
import { CodeMirrorEditor } from "@/registry/editor/codemirror-editor";

interface Cell {
  id: string;
  type: CellType;
  source: string;
}

const INITIAL_CELLS: Cell[] = [
  {
    id: "hero-md-1",
    type: "markdown",
    source: `# Welcome to nteract elements

A design system for building notebook interfaces with React.`,
  },
  {
    id: "hero-code-1",
    type: "code",
    source: `<div style="display:flex;gap:8px;flex-wrap:wrap">
  <span style="background:#dbeafe;color:#1e40af;padding:4px 12px;border-radius:6px;font-weight:500">Cells</span>
  <span style="background:#dcfce7;color:#166534;padding:4px 12px;border-radius:6px;font-weight:500">Outputs</span>
  <span style="background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:6px;font-weight:500">Widgets</span>
  <span style="background:#f3e8ff;color:#6b21a8;padding:4px 12px;border-radius:6px;font-weight:500">Editor</span>
</div>`,
  },
  {
    id: "hero-md-2",
    type: "markdown",
    source: `Edit the code above and click **[▶]:** to see it render.`,
  },
];

/** Simple markdown renderer for hero demo (no iframe needed) */
function SimpleMarkdown({ source }: { source: string }) {
  // Very basic markdown parsing for the hero demo
  const lines = source.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-xl font-bold mb-2">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-lg font-semibold mb-2">
          {line.slice(3)}
        </h2>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      // Handle **bold** and basic text
      const parts = line.split(/(\*\*[^*]+\*\*|\`[^`]+\`)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={j} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });
      elements.push(
        <p key={i} className="text-muted-foreground">
          {rendered}
        </p>
      );
    }
  }

  return <div className="py-2">{elements}</div>;
}

export function HeroDemo() {
  const [cells, setCells] = useState<Cell[]>(INITIAL_CELLS);
  const [focusedId, setFocusedId] = useState<string | null>("hero-code-1");
  const [executionStates, setExecutionStates] = useState<
    Record<string, "idle" | "running" | "completed">
  >({});
  const [executionCounts, setExecutionCounts] = useState<
    Record<string, number | null>
  >({});
  const [globalCounter, setGlobalCounter] = useState(0);

  const updateSource = (id: string, source: string) => {
    setCells((prev) =>
      prev.map((c) => (c.id === id ? { ...c, source } : c))
    );
  };

  const handleExecute = (cellId: string) => {
    setExecutionStates((prev) => ({ ...prev, [cellId]: "running" }));
    setTimeout(() => {
      setExecutionStates((prev) => ({ ...prev, [cellId]: "completed" }));
      setGlobalCounter((prev) => {
        const newCount = prev + 1;
        setExecutionCounts((counts) => ({ ...counts, [cellId]: newCount }));
        return newCount;
      });
    }, 300);
  };

  return (
    <div>
      {cells.map((cell, index) => {
        const isFocused = focusedId === cell.id;
        const executionState = executionStates[cell.id] || "idle";
        const executionCount = executionCounts[cell.id] ?? null;
        const isExecuting = executionState === "running";
        const nextCellType = cells[index + 1]?.type ?? cell.type;

        if (cell.type === "markdown") {
          return (
            <div key={cell.id}>
              <CellContainer
                id={cell.id}
                cellType="markdown"
                isFocused={isFocused}
                onFocus={() => setFocusedId(cell.id)}
              >
                <SimpleMarkdown source={cell.source} />
              </CellContainer>
              {index < cells.length - 1 && (
                <CellBetweener cellType={nextCellType} />
              )}
            </div>
          );
        }

        // Code cell with CodeMirror editor
        return (
          <div key={cell.id}>
            <CellContainer
              id={cell.id}
              cellType="code"
              isFocused={isFocused}
              onFocus={() => setFocusedId(cell.id)}
              gutterContent={
                <CompactExecutionButton
                  count={executionCount}
                  isExecuting={isExecuting}
                  onExecute={() => handleExecute(cell.id)}
                  onInterrupt={() =>
                    setExecutionStates((prev) => ({
                      ...prev,
                      [cell.id]: "idle",
                    }))
                  }
                />
              }
            >
              <CodeMirrorEditor
                value={cell.source}
                language="html"
                onValueChange={(source) => updateSource(cell.id, source)}
                placeholder="Enter HTML..."
                className="min-h-[2rem]"
                lineWrapping
              />
              {executionState === "completed" && (
                <div
                  className="border-t border-border/40 pt-3 mt-2"
                  dangerouslySetInnerHTML={{ __html: cell.source }}
                />
              )}
            </CellContainer>
            {index < cells.length - 1 && (
              <CellBetweener cellType={nextCellType} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default HeroDemo;
