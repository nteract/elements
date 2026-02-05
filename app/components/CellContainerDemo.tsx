"use client";

import type { ComponentProps } from "react";
import { CellContainer } from "@/registry/cell/CellContainer";

type CellContainerDemoProps = Omit<
  ComponentProps<typeof CellContainer>,
  "onFocus" | "onDragStart" | "onDragOver" | "onDrop"
>;

export function CellContainerDemo(props: CellContainerDemoProps) {
  return <CellContainer onFocus={() => {}} {...props} />;
}
