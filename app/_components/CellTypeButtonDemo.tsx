"use client";

import { CellTypeButton } from "@/registry/cell/CellTypeButton";
import type { ComponentProps } from "react";

type CellTypeButtonDemoProps = Omit<ComponentProps<typeof CellTypeButton>, "onClick">;

export function CellTypeButtonDemo(props: CellTypeButtonDemoProps) {
  return <CellTypeButton {...props} />;
}
