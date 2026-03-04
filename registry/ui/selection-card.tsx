"use client";

/**
 * SelectionCard and PageDots components for wizard/onboarding UIs.
 * SelectionCard is a stylized button with icon, title, description, and selected state.
 * PageDots provides navigation indicators for multi-step wizards.
 */

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Color classes for selection card theming */
export interface SelectionCardColorClass {
  /** Background color when selected (e.g., "bg-blue-500/10") */
  bg: string;
  /** Text color when selected (e.g., "text-blue-600 dark:text-blue-400") */
  text: string;
  /** Ring color when selected (e.g., "ring-blue-500") */
  ring: string;
  /** Icon background color when selected (e.g., "bg-blue-500/20") */
  iconBg: string;
}

export interface SelectionCardProps {
  /** Whether this card is currently selected */
  selected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Icon component to render */
  icon: React.ComponentType<{ className?: string }>;
  /** Card title */
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Description text */
  description: string;
  /** Color classes for theming */
  colorClass: SelectionCardColorClass;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A selectable card component for wizard/onboarding selection UIs.
 * Displays an icon, title, optional subtitle, and description with
 * color-coded styling based on selection state.
 */
export function SelectionCard({
  selected,
  onClick,
  icon: Icon,
  title,
  subtitle,
  description,
  colorClass,
  className,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 p-8 w-52 h-64",
        "transition-all duration-200 ease-out cursor-pointer",
        "hover:scale-[1.02] hover:shadow-lg",
        selected
          ? [
              "scale-[1.02] shadow-lg",
              colorClass.bg,
              colorClass.ring,
              "ring-2 ring-offset-2 ring-offset-background",
              "border-transparent",
            ]
          : ["border-border/50 hover:border-border bg-card"],
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl p-4",
          selected ? colorClass.iconBg : "bg-muted",
        )}
      >
        <Icon
          className={cn(
            "h-16 w-16 transition-colors",
            selected ? colorClass.text : "text-muted-foreground",
          )}
        />
      </div>
      <div className="text-center space-y-1">
        <h3
          className={cn(
            "text-lg font-semibold",
            selected ? colorClass.text : "text-foreground",
          )}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className={cn(
              "text-xs font-medium",
              selected ? colorClass.text : "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {selected && (
        <div
          className={cn(
            "absolute top-3 right-3 rounded-full p-1",
            colorClass.iconBg,
          )}
        >
          <Check className={cn("h-4 w-4", colorClass.text)} />
        </div>
      )}
    </button>
  );
}

export interface PageDotsProps {
  /** Current page (1-indexed) */
  current: number;
  /** Total number of pages */
  total: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigation dots for multi-step wizards.
 * Displays filled dots for the current page and hollow dots for others.
 */
export function PageDots({ current, total, className }: PageDotsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            i + 1 === current ? "bg-foreground" : "bg-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

/** Pre-configured brand colors for common runtime/package manager icons */
export const BRAND_COLORS = {
  python: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500",
    iconBg: "bg-blue-500/20",
  },
  deno: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500",
    iconBg: "bg-emerald-500/20",
  },
  uv: {
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    ring: "ring-fuchsia-500",
    iconBg: "bg-fuchsia-500/20",
  },
  conda: {
    bg: "bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    ring: "ring-green-500",
    iconBg: "bg-green-500/20",
  },
  pixi: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-600 dark:text-yellow-400",
    ring: "ring-yellow-500",
    iconBg: "bg-yellow-500/20",
  },
} as const satisfies Record<string, SelectionCardColorClass>;
