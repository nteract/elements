"use client";

import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CellBetweener } from "@/registry/cell/CellBetweener";
import { CellContainer } from "@/registry/cell/CellContainer";
import type { CellType } from "@/registry/cell/CellTypeButton";
import { CompactExecutionButton } from "@/registry/cell/CompactExecutionButton";
import { ExecutionCount } from "@/registry/cell/ExecutionCount";
import { PlayButton } from "@/registry/cell/PlayButton";

interface CellDemoProps {
  cellType?: CellType;
  initialExecutionState?: "idle" | "queued" | "running" | "completed" | "error";
  initialFocused?: boolean;
  showSource?: boolean;
  showOutput?: boolean;
}

export function CellDemo({
  cellType = "code",
  initialExecutionState = "idle",
  initialFocused = false,
  showSource = true,
  showOutput = true,
}: CellDemoProps) {
  const [isFocused, setIsFocused] = useState(initialFocused);
  const [executionState, setExecutionState] = useState<
    "idle" | "queued" | "running" | "completed" | "error"
  >(initialExecutionState);
  const [sourceVisible, setSourceVisible] = useState(true);
  const [executionCount, setExecutionCount] = useState<number | null>(null);

  const handleExecute = () => {
    setExecutionState("running");
    setTimeout(() => {
      setExecutionState("completed");
      setExecutionCount((prev) => (prev ?? 0) + 1);
    }, 800);
  };

  const handleInterrupt = () => {
    setExecutionState("idle");
  };

  const isExecuting = executionState === "running";

  const gutterContent =
    cellType === "code" ? (
      <>
        <PlayButton
          executionState={executionState}
          cellType={cellType}
          isFocused={isFocused}
          onExecute={handleExecute}
          onInterrupt={handleInterrupt}
          gutterMode
          focusedClass="text-gray-700 dark:text-gray-300"
        />
        <ExecutionCount count={executionCount} isExecuting={isExecuting} />
      </>
    ) : undefined;

  const rightGutterContent = (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => setSourceVisible(!sourceVisible)}
        title={sourceVisible ? "Hide source" : "Show source"}
      >
        {sourceVisible ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="More options"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => alert("Change to Markdown")}>
            Change to Markdown
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setExecutionState("idle")}
            disabled={executionState !== "completed"}
          >
            Clear outputs
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => alert("Delete cell")}
            className="text-destructive"
          >
            Delete cell
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <CellContainer
      id="demo-cell"
      cellType={cellType}
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      gutterContent={gutterContent}
      rightGutterContent={rightGutterContent}
    >
      {showSource && sourceVisible && (
        <div className="font-mono text-sm whitespace-pre">
          print("Hello from nteract!")
        </div>
      )}
      {showOutput && executionState === "completed" && (
        <div className="border-t border-border/40 pt-2 font-mono text-sm">
          Hello from nteract!
        </div>
      )}
    </CellContainer>
  );
}

/** Multiple cells demo showing focus behavior */
export function NotebookDemo() {
  const [focusedId, setFocusedId] = useState<string | null>("cell-1");
  const [executionStates, setExecutionStates] = useState<
    Record<string, "idle" | "queued" | "running" | "completed" | "error">
  >({});
  const [executionCounts, setExecutionCounts] = useState<
    Record<string, number | null>
  >({});
  // Global counter for sequential execution counts like real Jupyter
  const [, setGlobalCounter] = useState(0);

  const cells = [
    {
      id: "cell-1",
      type: "code" as CellType,
      content: 'x = 42\nprint(f"The answer is {x}")',
      output: "The answer is 42",
    },
    {
      id: "cell-2",
      type: "markdown" as CellType,
      content: "## Results\nThis cell shows markdown content.",
      output: null,
    },
    {
      id: "cell-3",
      type: "code" as CellType,
      content: "import pandas as pd\ndf = pd.DataFrame({'a': [1,2,3]})",
      output: null,
    },
  ];

  const handleExecute = (cellId: string) => {
    setExecutionStates((prev) => ({ ...prev, [cellId]: "running" }));
    setTimeout(() => {
      setExecutionStates((prev) => ({ ...prev, [cellId]: "completed" }));
      setGlobalCounter((prev) => {
        const newCount = prev + 1;
        setExecutionCounts((counts) => ({ ...counts, [cellId]: newCount }));
        return newCount;
      });
    }, 800);
  };

  return (
    <div>
      {cells.map((cell, index) => {
        const isFocused = focusedId === cell.id;
        const executionState = executionStates[cell.id] || "idle";
        const executionCount = executionCounts[cell.id] ?? null;
        const isExecuting = executionState === "running";

        const gutterContent =
          cell.type === "code" ? (
            <>
              <PlayButton
                executionState={executionState}
                cellType={cell.type}
                isFocused={isFocused}
                onExecute={() => handleExecute(cell.id)}
                onInterrupt={() =>
                  setExecutionStates((prev) => ({ ...prev, [cell.id]: "idle" }))
                }
                gutterMode
                focusedClass="text-gray-700 dark:text-gray-300"
              />
              <ExecutionCount
                count={executionCount}
                isExecuting={isExecuting}
              />
            </>
          ) : undefined;

        // Get the next cell type for betweener color continuity
        const nextCellType = cells[index + 1]?.type ?? cell.type;

        const rightGutterContent = (
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Toggle source"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="More options"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  Change to {cell.type === "code" ? "Markdown" : "Code"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Clear outputs</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Delete cell
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );

        return (
          <div key={cell.id}>
            <CellContainer
              id={cell.id}
              cellType={cell.type}
              isFocused={isFocused}
              onFocus={() => setFocusedId(cell.id)}
              gutterContent={gutterContent}
              rightGutterContent={rightGutterContent}
            >
              <div className="font-mono text-sm whitespace-pre">
                {cell.content}
              </div>
              {executionState === "completed" && cell.output && (
                <div className="border-t border-border/40 pt-2 font-mono text-sm">
                  {cell.output}
                </div>
              )}
            </CellContainer>
            {/* Betweener maintains ribbon continuity between cells */}
            {index < cells.length - 1 && (
              <CellBetweener cellType={nextCellType} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Minimal gutter cell demo - no header, just content */
export function GutterCellDemo({
  cellType = "code",
  initialExecutionState = "idle",
  initialFocused = false,
}: CellDemoProps) {
  const [isFocused, setIsFocused] = useState(initialFocused);
  const [executionState, setExecutionState] = useState<
    "idle" | "queued" | "running" | "completed" | "error"
  >(initialExecutionState);
  const [executionCount, setExecutionCount] = useState<number | null>(null);

  const handleExecute = () => {
    setExecutionState("running");
    setTimeout(() => {
      setExecutionState("completed");
      setExecutionCount((prev) => (prev ?? 0) + 1);
    }, 800);
  };

  const isExecuting = executionState === "running";

  const gutterContent =
    cellType === "code" ? (
      <>
        <PlayButton
          executionState={executionState}
          cellType={cellType}
          isFocused={isFocused}
          onExecute={handleExecute}
          onInterrupt={() => setExecutionState("idle")}
          gutterMode
          focusedClass="text-gray-700 dark:text-gray-300"
        />
        <ExecutionCount count={executionCount} isExecuting={isExecuting} />
      </>
    ) : undefined;

  const rightGutterContent = (
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Options">
      <MoreVertical className="h-3 w-3" />
    </Button>
  );

  return (
    <CellContainer
      id="demo-gutter-cell"
      cellType={cellType}
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      gutterContent={gutterContent}
      rightGutterContent={rightGutterContent}
    >
      <div className="font-mono text-sm">
        {cellType === "code" ? (
          <span className="whitespace-pre">print("Hello!")</span>
        ) : (
          <div className="prose prose-sm dark:prose-invert">
            <p className="text-foreground">
              This is a <strong>markdown</strong> cell.
            </p>
          </div>
        )}
      </div>
      {executionState === "completed" && (
        <div className="border-t border-border/40 pt-2 font-mono text-sm">
          Hello!
        </div>
      )}
    </CellContainer>
  );
}

/** Multiple cells demo with minimal gutter layout */
export function GutterNotebookDemo() {
  const [focusedId, setFocusedId] = useState<string | null>("gutter-cell-1");
  const [executionStates, setExecutionStates] = useState<
    Record<string, "idle" | "queued" | "running" | "completed" | "error">
  >({});
  const [executionCounts, setExecutionCounts] = useState<
    Record<string, number | null>
  >({});
  // Global counter for sequential execution counts like real Jupyter
  const [, setGlobalCounter] = useState(0);

  const cells = [
    {
      id: "gutter-cell-1",
      type: "code" as CellType,
      content: 'x = 42\nprint(f"The answer is {x}")',
      output: "The answer is 42",
    },
    {
      id: "gutter-cell-2",
      type: "markdown" as CellType,
      content: "## Results\nThis cell shows **markdown** content.",
      output: null,
    },
    {
      id: "gutter-cell-3",
      type: "code" as CellType,
      content: "import pandas as pd\ndf = pd.DataFrame({'a': [1,2,3]})",
      output: null,
    },
  ];

  const handleExecute = (cellId: string) => {
    setExecutionStates((prev) => ({ ...prev, [cellId]: "running" }));
    setTimeout(() => {
      setExecutionStates((prev) => ({ ...prev, [cellId]: "completed" }));
      setGlobalCounter((prev) => {
        const newCount = prev + 1;
        setExecutionCounts((counts) => ({ ...counts, [cellId]: newCount }));
        return newCount;
      });
    }, 800);
  };

  return (
    <div>
      {cells.map((cell, index) => {
        const isFocused = focusedId === cell.id;
        const executionState = executionStates[cell.id] || "idle";
        const executionCount = executionCounts[cell.id] ?? null;
        const isExecuting = executionState === "running";

        const gutterContent =
          cell.type === "code" ? (
            <>
              <PlayButton
                executionState={executionState}
                cellType={cell.type}
                isFocused={isFocused}
                onExecute={() => handleExecute(cell.id)}
                onInterrupt={() =>
                  setExecutionStates((prev) => ({ ...prev, [cell.id]: "idle" }))
                }
                gutterMode
                focusedClass="text-gray-700 dark:text-gray-300"
              />
              <ExecutionCount
                count={executionCount}
                isExecuting={isExecuting}
              />
            </>
          ) : undefined;

        // Get the next cell type for betweener color continuity
        const nextCellType = cells[index + 1]?.type ?? cell.type;

        const rightGutterContent = (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Options"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        );

        return (
          <div key={cell.id}>
            <CellContainer
              id={cell.id}
              cellType={cell.type}
              isFocused={isFocused}
              onFocus={() => setFocusedId(cell.id)}
              gutterContent={gutterContent}
              rightGutterContent={rightGutterContent}
            >
              <div className="whitespace-pre font-mono text-sm">
                {cell.content}
              </div>
              {executionState === "completed" && cell.output && (
                <div className="border-t border-border/40 pt-2 font-mono text-sm">
                  {cell.output}
                </div>
              )}
            </CellContainer>
            {/* Betweener maintains ribbon continuity between cells */}
            {index < cells.length - 1 && (
              <CellBetweener cellType={nextCellType} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Compact execution button demo - combines play + count into one element */
export function CompactCellDemo({
  cellType = "code",
  initialExecutionState = "idle",
  initialFocused = false,
}: CellDemoProps) {
  const [isFocused, setIsFocused] = useState(initialFocused);
  const [executionState, setExecutionState] = useState<
    "idle" | "queued" | "running" | "completed" | "error"
  >(initialExecutionState);
  const [executionCount, setExecutionCount] = useState<number | null>(null);

  const handleExecute = () => {
    setExecutionState("running");
    setTimeout(() => {
      setExecutionState("completed");
      setExecutionCount((prev) => (prev ?? 0) + 1);
    }, 800);
  };

  const isExecuting = executionState === "running";

  const gutterContent =
    cellType === "code" ? (
      <CompactExecutionButton
        count={executionCount}
        isExecuting={isExecuting}
        onExecute={handleExecute}
        onInterrupt={() => setExecutionState("idle")}
      />
    ) : undefined;

  const rightGutterContent = (
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Options">
      <MoreVertical className="h-3 w-3" />
    </Button>
  );

  return (
    <CellContainer
      id="demo-compact-cell"
      cellType={cellType}
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      gutterContent={gutterContent}
      rightGutterContent={rightGutterContent}
    >
      <div className="font-mono text-sm">
        {cellType === "code" ? (
          <span className="whitespace-pre">print("Hello, World!")</span>
        ) : (
          <div className="prose prose-sm dark:prose-invert">
            <p className="text-foreground">Markdown cell</p>
          </div>
        )}
      </div>
      {executionState === "completed" && (
        <div className="border-t border-border/40 pt-2 font-mono text-sm">
          Hello, World!
        </div>
      )}
    </CellContainer>
  );
}

/** Multi-cell demo with compact execution buttons */
export function CompactNotebookDemo() {
  const [focusedId, setFocusedId] = useState<string | null>("compact-cell-1");
  const [executionStates, setExecutionStates] = useState<
    Record<string, "idle" | "queued" | "running" | "completed" | "error">
  >({});
  const [executionCounts, setExecutionCounts] = useState<
    Record<string, number | null>
  >({});
  // Global counter for sequential execution counts like real Jupyter
  const [, setGlobalCounter] = useState(0);

  const cells = [
    {
      id: "compact-cell-1",
      type: "code" as CellType,
      content: "x = 1",
      output: null,
    },
    {
      id: "compact-cell-2",
      type: "code" as CellType,
      content: "y = 2",
      output: null,
    },
    {
      id: "compact-cell-3",
      type: "code" as CellType,
      content: "print(x + y)",
      output: "3",
    },
  ];

  const handleExecute = (cellId: string) => {
    setExecutionStates((prev) => ({ ...prev, [cellId]: "running" }));
    setTimeout(() => {
      setExecutionStates((prev) => ({ ...prev, [cellId]: "completed" }));
      setGlobalCounter((prev) => {
        const newCount = prev + 1;
        setExecutionCounts((counts) => ({ ...counts, [cellId]: newCount }));
        return newCount;
      });
    }, 800);
  };

  return (
    <div>
      {cells.map((cell, index) => {
        const isFocused = focusedId === cell.id;
        const executionState = executionStates[cell.id] || "idle";
        const executionCount = executionCounts[cell.id] ?? null;
        const isExecuting = executionState === "running";
        const nextCellType = cells[index + 1]?.type ?? cell.type;

        return (
          <div key={cell.id}>
            <CellContainer
              id={cell.id}
              cellType={cell.type}
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
              rightGutterContent={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Options"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              }
            >
              <div className="whitespace-pre font-mono text-sm">
                {cell.content}
              </div>
              {executionState === "completed" && cell.output && (
                <div className="border-t border-border/40 pt-2 font-mono text-sm">
                  {cell.output}
                </div>
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
