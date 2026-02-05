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
