"use client";

import type { ComponentProps } from "react";
import { CellTypeButton } from "@/registry/cell/CellTypeButton";

type CellTypeButtonDemoProps = Omit<
  ComponentProps<typeof CellTypeButton>,
  "onClick"
>;

export function CellTypeButtonDemo(props: CellTypeButtonDemoProps) {
  return <CellTypeButton {...props} />;
}
