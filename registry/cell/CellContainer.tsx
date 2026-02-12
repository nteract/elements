import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  type GutterColorConfig,
  getGutterColors,
} from "./gutter-colors";

interface CellContainerProps {
  id: string;
  isFocused?: boolean;
  onFocus?: () => void;
  children: ReactNode;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  className?: string;

  // === New Gutter System ===
  /** Cell type for automatic gutter ribbon styling. When provided, enables gutter mode. */
  cellType?: string;
  /** Content to render in the gutter action area (e.g., play button) */
  gutterContent?: ReactNode;
  /** Custom color configuration for cell types not in defaults */
  customGutterColors?: Record<string, GutterColorConfig>;

  // === Legacy Props (Deprecated) ===
  /**
   * @deprecated Use cellType prop instead. This prop is ignored when cellType is provided.
   */
  focusBgColor?: string;
  /**
   * @deprecated Use cellType prop instead. This prop is ignored when cellType is provided.
   */
  focusBorderColor?: string;
}

export const CellContainer = forwardRef<HTMLDivElement, CellContainerProps>(
  (
    {
      id,
      isFocused = false,
      onFocus,
      children,
      onDragStart,
      onDragOver,
      onDrop,
      className,
      // New gutter props
      cellType,
      gutterContent,
      customGutterColors,
      // Legacy props
      focusBgColor = "bg-primary/5",
      focusBorderColor = "border-primary/60",
    },
    ref,
  ) => {
    // Determine rendering mode based on cellType presence
    const useGutterMode = cellType !== undefined;

    // Gutter mode rendering
    if (useGutterMode) {
      const colors = getGutterColors(cellType, customGutterColors);
      const ribbonColor = isFocused
        ? colors.ribbon.focused
        : colors.ribbon.default;
      const bgColor = isFocused ? colors.background.focused : undefined;

      return (
        <div
          ref={ref}
          data-slot="cell-container"
          data-cell-id={id}
          data-cell-type={cellType}
          className={cn(
            "cell-container group flex transition-colors duration-150",
            bgColor,
            className,
          )}
          onMouseDown={onFocus}
          draggable={!!onDragStart}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {/* Gutter area: action button + thin ribbon */}
          <div className="flex flex-shrink-0">
            {/* Action button area (24px / w-6) */}
            <div className="flex w-6 items-start justify-center pt-1.5">
              {gutterContent}
            </div>
            {/* Thin ribbon (4px / w-1) */}
            <div
              className={cn(
                "w-1 transition-colors duration-150",
                ribbonColor,
              )}
            />
          </div>
          {/* Cell content */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      );
    }

    // Legacy mode rendering (backwards compatible)
    return (
      <div
        ref={ref}
        data-slot="cell-container"
        data-cell-id={id}
        className={cn(
          "cell-container group relative border-2 transition-all duration-200",
          isFocused
            ? [focusBgColor, focusBorderColor]
            : "border-transparent hover:bg-muted/10",
          className,
        )}
        onMouseDown={onFocus}
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {children}
      </div>
    );
  },
);

CellContainer.displayName = "CellContainer";
