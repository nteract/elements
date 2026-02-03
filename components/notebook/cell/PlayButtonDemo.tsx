"use client";

import { PlayButton } from "./PlayButton";
import type { ComponentProps } from "react";

type PlayButtonDemoProps = Omit<
  ComponentProps<typeof PlayButton>,
  "onExecute" | "onInterrupt"
>;

export function PlayButtonDemo(props: PlayButtonDemoProps) {
  return <PlayButton onExecute={() => {}} onInterrupt={() => {}} {...props} />;
}
