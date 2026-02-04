"use client";

import { CellContainer } from "@/registry/cell/CellContainer";
import type { ComponentProps } from "react";

type CellContainerDemoProps = Omit<
  ComponentProps<typeof CellContainer>,
  "onFocus" | "onDragStart" | "onDragOver" | "onDrop"
>;

export function CellContainerDemo(props: CellContainerDemoProps) {
  return <CellContainer onFocus={() => {}} {...props} />;
}
