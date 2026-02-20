"use client";

import { useState } from "react";
import { CodeCell, type CodeCellData } from "@/registry/cell/CodeCell";
import type { JupyterOutput } from "@/registry/cell/OutputArea";
import {
  EditorRegistryProvider,
  useEditorRegistry,
} from "@/registry/cell/useEditorRegistry";

const SAMPLE_CODE = `import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.title("Sine Wave")
plt.show()`;

const SAMPLE_OUTPUTS: JupyterOutput[] = [
  {
    output_type: "execute_result",
    data: {
      "text/plain": "<Figure size 640x480 with 1 Axes>",
    },
    execution_count: 1,
  },
];

/**
 * Basic demo showing a single CodeCell
 */
export function CodeCellBasicDemo() {
  const [cell, setCell] = useState<CodeCellData>({
    id: "demo-1",
    source: SAMPLE_CODE,
    outputs: [],
    execution_count: null,
  });
  const [isFocused, setIsFocused] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    // Simulate execution
    setTimeout(() => {
      setCell((prev) => ({
        ...prev,
        outputs: SAMPLE_OUTPUTS,
        execution_count: (prev.execution_count ?? 0) + 1,
      }));
      setIsExecuting(false);
    }, 1000);
  };

  return (
    <div>
      <CodeCell
        cell={cell}
        language="python"
        isFocused={isFocused}
        isExecuting={isExecuting}
        onFocus={() => setIsFocused(true)}
        onUpdateSource={(source) => setCell((prev) => ({ ...prev, source }))}
        onExecute={handleExecute}
        onInterrupt={() => setIsExecuting(false)}
        onDelete={() => alert("Delete clicked")}
      />
    </div>
  );
}

/**
 * Demo showing cell with outputs
 */
export function CodeCellWithOutputDemo() {
  const [cell, setCell] = useState<CodeCellData>({
    id: "demo-output",
    source: 'print("Hello, World!")',
    outputs: [
      {
        output_type: "stream",
        name: "stdout",
        text: "Hello, World!\n",
      },
    ],
    execution_count: 1,
  });
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      <CodeCell
        cell={cell}
        language="python"
        isFocused={isFocused}
        onFocus={() => setIsFocused(true)}
        onUpdateSource={(source) => setCell((prev) => ({ ...prev, source }))}
        onExecute={() => {}}
      />
    </div>
  );
}

/**
 * Multi-cell demo with keyboard navigation
 */
function MultiCellContent() {
  const [cells, setCells] = useState<CodeCellData[]>([
    {
      id: "cell-1",
      source: "# First cell\nx = 1",
      outputs: [],
      execution_count: null,
    },
    {
      id: "cell-2",
      source: "# Second cell\ny = x + 1",
      outputs: [],
      execution_count: null,
    },
    {
      id: "cell-3",
      source: "# Third cell\nprint(y)",
      outputs: [],
      execution_count: null,
    },
  ]);
  const [focusedId, setFocusedId] = useState<string | null>("cell-1");
  const [executingId, setExecutingId] = useState<string | null>(null);
  const { focusCell } = useEditorRegistry();

  const updateSource = (id: string, source: string) => {
    setCells((prev) => prev.map((c) => (c.id === id ? { ...c, source } : c)));
  };

  const executeCell = (id: string) => {
    setExecutingId(id);
    setTimeout(() => {
      setCells((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                execution_count: (c.execution_count ?? 0) + 1,
                outputs: [
                  {
                    output_type: "stream" as const,
                    name: "stdout" as const,
                    text: `Executed cell ${id}\n`,
                  },
                ],
              }
            : c,
        ),
      );
      setExecutingId(null);
    }, 500);
  };

  const deleteCell = (id: string) => {
    if (cells.length <= 1) return;
    const idx = cells.findIndex((c) => c.id === id);
    setCells((prev) => prev.filter((c) => c.id !== id));
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
    const newCell: CodeCellData = {
      id: newId,
      source: "",
      outputs: [],
      execution_count: null,
    };
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
        <CodeCell
          key={cell.id}
          cell={cell}
          language="python"
          isFocused={focusedId === cell.id}
          isExecuting={executingId === cell.id}
          onFocus={() => setFocusedId(cell.id)}
          onUpdateSource={(source) => updateSource(cell.id, source)}
          onExecute={() => executeCell(cell.id)}
          onInterrupt={() => setExecutingId(null)}
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

export function CodeCellMultiDemo() {
  return (
    <EditorRegistryProvider>
      <MultiCellContent />
    </EditorRegistryProvider>
  );
}
