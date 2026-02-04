"use client";

import { useState } from "react";
import { CellTypeSelector } from "@/registry/cell/CellTypeSelector";
import type { CellType } from "@/registry/cell/CellTypeButton";

export function CellTypeSelectorDemo() {
  const [cellType, setCellType] = useState<CellType>("code");

  return (
    <CellTypeSelector currentType={cellType} onTypeChange={setCellType} />
  );
}

export function CellTypeSelectorLimitedDemo() {
  const [cellType, setCellType] = useState<CellType>("code");

  return (
    <CellTypeSelector
      currentType={cellType}
      onTypeChange={setCellType}
      enabledTypes={["code", "markdown"]}
    />
  );
}
