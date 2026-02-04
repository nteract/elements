import { cn } from "@/lib/utils";
import React from "react";

export interface ExecutionCountProps {
  count: number | null;
  isExecuting?: boolean;
  className?: string;
}

export const ExecutionCount: React.FC<ExecutionCountProps> = ({
  count,
  isExecuting = false,
  className,
}) => {
  const displayContent = isExecuting ? "*" : count ?? " ";

  return (
    <span
      className={cn(
        "font-mono text-sm text-muted-foreground",
        className
      )}
    >
      [{displayContent}]:
    </span>
  );
};
