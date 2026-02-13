import { Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactExecutionButtonProps {
  /** Execution count - null means never executed */
  count: number | null;
  /** Whether the cell is currently executing */
  isExecuting?: boolean;
  /** Called when user clicks to execute */
  onExecute?: () => void;
  /** Called when user clicks to interrupt */
  onInterrupt?: () => void;
  /** Additional classes */
  className?: string;
}

/**
 * Compact execution button combining play + execution count into one element.
 *
 * - Never run: `[ ▶ ]` - click to execute
 * - Running: `[■]` with pulse - click to stop
 * - Executed: `[1]` - hover to show play, click to re-run
 */
export function CompactExecutionButton({
  count,
  isExecuting = false,
  onExecute,
  onInterrupt,
  className,
}: CompactExecutionButtonProps) {
  const handleClick = () => {
    if (isExecuting) {
      onInterrupt?.();
    } else {
      onExecute?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group/exec inline-flex items-center font-mono text-xs tabular-nums",
        "text-muted-foreground hover:text-foreground",
        "transition-colors duration-150",
        className,
      )}
      title={isExecuting ? "Stop execution" : "Run cell"}
    >
      <span className="opacity-60">[</span>
      <span className="relative flex h-4 w-4 items-center justify-center">
        {isExecuting ? (
          // Running state: show stop icon with pulse
          <Square className="h-2.5 w-2.5 fill-current text-destructive animate-pulse" />
        ) : count !== null ? (
          // Has count: show count, play on hover
          <>
            <span className="group-hover/exec:opacity-0 transition-opacity">
              {count}
            </span>
            <Play className="absolute h-3 w-3 fill-current opacity-0 group-hover/exec:opacity-100 transition-opacity" />
          </>
        ) : (
          // Never run: show play icon
          <Play className="h-3 w-3 fill-current" />
        )}
      </span>
      <span className="opacity-60">]:</span>
    </button>
  );
}
