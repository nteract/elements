"use client";

import type { ComponentProps } from "react";
import { CellContainer } from "@/registry/cell/CellContainer";

type CellContainerDemoProps = Omit<
  ComponentProps<typeof CellContainer>,
  "onFocus" | "onDragStart" | "onDragOver" | "onDrop"
> & {
  cellType?: string;
};

export function CellContainerDemo({
  cellType = "code",
  ...props
}: CellContainerDemoProps) {
  return <CellContainer cellType={cellType} onFocus={() => {}} {...props} />;
}
