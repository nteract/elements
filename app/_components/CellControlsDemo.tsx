"use client";

import { CellControls } from "@/registry/cell/CellControls";
import { useState } from "react";

interface CellControlsDemoProps {
  showMoveControls?: boolean;
  showDeleteAllBelow?: boolean;
  hasOutputs?: boolean;
  contextSelectionMode?: boolean;
}

export function CellControlsDemo({
  showMoveControls = false,
  showDeleteAllBelow = false,
  hasOutputs = true,
  contextSelectionMode = false,
}: CellControlsDemoProps) {
  const [sourceVisible, setSourceVisible] = useState(true);
  const [aiContextVisible, setAiContextVisible] = useState(false);

  return (
    <div className="group border rounded-md p-4 bg-muted/20">
      <CellControls
        sourceVisible={sourceVisible}
        toggleSourceVisibility={() => setSourceVisible(!sourceVisible)}
        onDeleteCell={() => alert("Delete cell")}
        onClearOutputs={() => alert("Clear outputs")}
        hasOutputs={hasOutputs}
        aiContextVisible={aiContextVisible}
        contextSelectionMode={contextSelectionMode}
        toggleAiContextVisibility={() => setAiContextVisible(!aiContextVisible)}
        canMoveUp={showMoveControls}
        canMoveDown={showMoveControls}
        onMoveUp={showMoveControls ? () => alert("Move up") : undefined}
        onMoveDown={showMoveControls ? () => alert("Move down") : undefined}
        onMoveToTop={showMoveControls ? () => alert("Move to top") : undefined}
        onMoveToBottom={
          showMoveControls ? () => alert("Move to bottom") : undefined
        }
        onDeleteAllBelow={
          showDeleteAllBelow ? () => alert("Delete all below") : undefined
        }
        hasCellsBelow={showDeleteAllBelow}
      />
    </div>
  );
}
