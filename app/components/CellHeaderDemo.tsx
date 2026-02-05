"use client";

import type { ComponentProps } from "react";
import { CellHeader } from "@/registry/cell/CellHeader";

type CellHeaderDemoProps = Omit<
  ComponentProps<typeof CellHeader>,
  "onDragStart" | "onKeyDown"
>;

export function CellHeaderDemo(props: CellHeaderDemoProps) {
  return <CellHeader onDragStart={() => {}} onKeyDown={() => {}} {...props} />;
}
