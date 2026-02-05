"use client";

import type { ComponentProps } from "react";
import { PlayButton } from "@/registry/cell/PlayButton";

type PlayButtonDemoProps = Omit<
  ComponentProps<typeof PlayButton>,
  "onExecute" | "onInterrupt"
>;

export function PlayButtonDemo(props: PlayButtonDemoProps) {
  return <PlayButton onExecute={() => {}} onInterrupt={() => {}} {...props} />;
}
