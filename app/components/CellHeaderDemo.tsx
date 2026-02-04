"use client";

import { CellHeader } from "@/registry/cell/CellHeader";
import type { ComponentProps } from "react";

type CellHeaderDemoProps = Omit<
  ComponentProps<typeof CellHeader>,
  "onDragStart" | "onKeyDown"
>;

export function CellHeaderDemo(props: CellHeaderDemoProps) {
  return <CellHeader onDragStart={() => {}} onKeyDown={() => {}} {...props} />;
}
