"use client";

import type { ComponentProps } from "react";
import { RuntimeHealthIndicator } from "@/registry/cell/RuntimeHealthIndicator";

type RuntimeHealthIndicatorDemoProps = Omit<
  ComponentProps<typeof RuntimeHealthIndicator>,
  "onClick"
> & {
  interactive?: boolean;
};

export function RuntimeHealthIndicatorDemo({
  interactive = false,
  ...props
}: RuntimeHealthIndicatorDemoProps) {
  return (
    <RuntimeHealthIndicator
      onClick={interactive ? () => {} : undefined}
      {...props}
    />
  );
}
