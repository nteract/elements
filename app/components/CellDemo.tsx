"use client";

import { useState } from "react";
import { CellContainer } from "@/registry/cell/CellContainer";
import { CellControls } from "@/registry/cell/CellControls";
import { CellHeader } from "@/registry/cell/CellHeader";
import { type CellType, CellTypeButton } from "@/registry/cell/CellTypeButton";
import { ExecutionStatus } from "@/registry/cell/ExecutionStatus";
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

  const handleExecute = () => {
    setExecutionState("running");
    setTimeout(() => setExecutionState("completed"), 2000);
  };

  const handleInterrupt = () => {
    setExecutionState("idle");
  };

  return (
    <CellContainer
      id="demo-cell"
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
    >
      <CellHeader
        leftContent={
          <>
            <PlayButton
              executionState={executionState}
              cellType={cellType}
              isFocused={isFocused}
              onExecute={handleExecute}
              onInterrupt={handleInterrupt}
            />
            <CellTypeButton cellType={cellType} size="sm" />
            <ExecutionStatus executionState={executionState} />
          </>
        }
        rightContent={
          <CellControls
            sourceVisible={sourceVisible}
            toggleSourceVisibility={() => setSourceVisible(!sourceVisible)}
            onDeleteCell={() => alert("Delete cell")}
            onClearOutputs={() => setExecutionState("idle")}
            hasOutputs={executionState === "completed"}
            canMoveUp
            canMoveDown
            onMoveUp={() => {}}
            onMoveDown={() => {}}
            forceVisible={isFocused}
          />
        }
      />
      {showSource && sourceVisible && (
        <div className="border-t border-border/40 bg-muted/30 p-4 font-mono text-sm">
          <span className="text-muted-foreground">
            # Click the play button to run
          </span>
          <br />
          print("Hello from nteract-elements!")
        </div>
      )}
      {showOutput && executionState === "completed" && (
        <div className="border-t border-border/40 p-4 text-sm">
          <span className="text-green-600">Hello from nteract-elements!</span>
        </div>
      )}
    </CellContainer>
  );
}

/** Multiple cells demo showing focus behavior */
export function NotebookDemo() {
  const [focusedId, setFocusedId] = useState<string | null>("cell-1");

  const cells = [
    {
      id: "cell-1",
      type: "code" as CellType,
      content: 'x = 42\nprint(f"The answer is {x}")',
    },
    {
      id: "cell-2",
      type: "markdown" as CellType,
      content: "## Results\nThis cell shows markdown content.",
    },
    {
      id: "cell-3",
      type: "code" as CellType,
      content: "import pandas as pd\ndf = pd.DataFrame({'a': [1,2,3]})",
    },
  ];

  return (
    <div className="space-y-2">
      {cells.map((cell) => (
        <CellContainer
          key={cell.id}
          id={cell.id}
          isFocused={focusedId === cell.id}
          onFocus={() => setFocusedId(cell.id)}
        >
          <CellHeader
            leftContent={
              <>
                <PlayButton
                  executionState="idle"
                  cellType={cell.type}
                  isFocused={focusedId === cell.id}
                  onExecute={() => {}}
                  onInterrupt={() => {}}
                />
                <CellTypeButton cellType={cell.type} size="sm" />
              </>
            }
            rightContent={
              <CellControls
                sourceVisible={true}
                toggleSourceVisibility={() => {}}
                onDeleteCell={() => {}}
                onClearOutputs={() => {}}
                hasOutputs={false}
                forceVisible={focusedId === cell.id}
              />
            }
          />
          <div className="border-t border-border/40 bg-muted/30 p-4 font-mono text-sm whitespace-pre">
            {cell.content}
          </div>
        </CellContainer>
      ))}
    </div>
  );
}

/** Gutter ribbon mode demo - single cell with paper-like aesthetic */
export function GutterCellDemo({
  cellType = "code",
  initialExecutionState = "idle",
  initialFocused = false,
}: CellDemoProps) {
  const [isFocused, setIsFocused] = useState(initialFocused);
  const [executionState, setExecutionState] = useState<
    "idle" | "queued" | "running" | "completed" | "error"
  >(initialExecutionState);

  const handleExecute = () => {
    setExecutionState("running");
    setTimeout(() => setExecutionState("completed"), 2000);
  };

  const playButton =
    cellType === "code" ? (
      <PlayButton
        executionState={executionState}
        cellType={cellType}
        isFocused={isFocused}
        onExecute={handleExecute}
        onInterrupt={() => setExecutionState("idle")}
        gutterMode
        focusedClass="text-gray-700 dark:text-gray-300"
      />
    ) : undefined;

  return (
    <CellContainer
      id="demo-gutter-cell"
      cellType={cellType}
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      gutterContent={playButton}
    >
      <div className="p-3 font-mono text-sm">
        {cellType === "code" ? (
          <>
            <span className="text-muted-foreground"># Hover to see play button</span>
            <br />
            print(&quot;Hello from gutter mode!&quot;)
          </>
        ) : (
          <div className="prose prose-sm dark:prose-invert">
            <p className="text-foreground">
              This is a <strong>markdown</strong> cell with the gutter ribbon.
            </p>
          </div>
        )}
      </div>
      {executionState === "completed" && (
        <div className="border-t border-border/40 p-3 text-sm">
          <span className="text-green-600 dark:text-green-400">
            Hello from gutter mode!
          </span>
        </div>
      )}
    </CellContainer>
  );
}

/** Multiple cells demo with gutter ribbon layout */
export function GutterNotebookDemo() {
  const [focusedId, setFocusedId] = useState<string | null>("gutter-cell-1");
  const [executionStates, setExecutionStates] = useState<
    Record<string, "idle" | "queued" | "running" | "completed" | "error">
  >({});

  const cells = [
    {
      id: "gutter-cell-1",
      type: "code" as CellType,
      content: 'x = 42\nprint(f"The answer is {x}")',
    },
    {
      id: "gutter-cell-2",
      type: "markdown" as CellType,
      content: "## Results\nThis cell shows **markdown** content.",
    },
    {
      id: "gutter-cell-3",
      type: "code" as CellType,
      content: "import pandas as pd\ndf = pd.DataFrame({'a': [1,2,3]})",
    },
  ];

  const handleExecute = (cellId: string) => {
    setExecutionStates((prev) => ({ ...prev, [cellId]: "running" }));
    setTimeout(() => {
      setExecutionStates((prev) => ({ ...prev, [cellId]: "completed" }));
    }, 2000);
  };

  return (
    <div className="space-y-0">
      {cells.map((cell) => {
        const isFocused = focusedId === cell.id;
        const executionState = executionStates[cell.id] || "idle";

        const playButton =
          cell.type === "code" ? (
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
          ) : undefined;

        return (
          <CellContainer
            key={cell.id}
            id={cell.id}
            cellType={cell.type}
            isFocused={isFocused}
            onFocus={() => setFocusedId(cell.id)}
            gutterContent={playButton}
          >
            <div className="whitespace-pre p-3 font-mono text-sm">
              {cell.content}
            </div>
            {executionState === "completed" && (
              <div className="border-t border-border/40 p-3 text-sm">
                <span className="text-green-600 dark:text-green-400">
                  Output for {cell.id}
                </span>
              </div>
            )}
          </CellContainer>
        );
      })}
    </div>
  );
}
