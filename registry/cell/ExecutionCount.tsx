import { cn } from "@/lib/utils";

interface ExecutionCountProps {
  count: number | null;
  isExecuting?: boolean;
  className?: string;
}

export function ExecutionCount({
  count,
  isExecuting,
  className,
}: ExecutionCountProps) {
  const display = isExecuting ? "*" : count ?? " ";
  return (
    <span className={cn("font-mono text-sm text-muted-foreground", className)}>
      [{display}]:
    </span>
  );
}
