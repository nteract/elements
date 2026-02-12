/**
 * Gutter ribbon color configuration for cell containers.
 *
 * Each cell type has:
 * - ribbon: The thin vertical ribbon color (unfocused/focused)
 * - background: The cell background color when focused
 */
export interface GutterColorConfig {
  ribbon: {
    default: string;
    focused: string;
  };
  background: {
    focused: string;
  };
}

/**
 * Default gutter colors for built-in cell types.
 * Colors are designed to match the existing CellTypeButton color scheme.
 */
export const defaultGutterColors: Record<string, GutterColorConfig> = {
  code: {
    ribbon: {
      default: "bg-gray-200 dark:bg-gray-700",
      focused: "bg-gray-400 dark:bg-gray-500",
    },
    background: {
      focused: "bg-gray-50/50 dark:bg-gray-900/30",
    },
  },
  markdown: {
    ribbon: {
      default: "bg-amber-200 dark:bg-amber-800",
      focused: "bg-amber-400 dark:bg-amber-600",
    },
    background: {
      focused: "bg-amber-50/50 dark:bg-amber-900/30",
    },
  },
  sql: {
    ribbon: {
      default: "bg-blue-200 dark:bg-blue-800",
      focused: "bg-blue-400 dark:bg-blue-600",
    },
    background: {
      focused: "bg-blue-50/50 dark:bg-blue-900/30",
    },
  },
  ai: {
    ribbon: {
      default: "bg-purple-200 dark:bg-purple-800",
      focused: "bg-purple-400 dark:bg-purple-600",
    },
    background: {
      focused: "bg-purple-50/50 dark:bg-purple-900/30",
    },
  },
  raw: {
    ribbon: {
      default: "bg-rose-200 dark:bg-rose-800",
      focused: "bg-rose-400 dark:bg-rose-600",
    },
    background: {
      focused: "bg-rose-50/50 dark:bg-rose-900/30",
    },
  },
};

/**
 * Fallback colors for unknown cell types.
 * Uses neutral gray styling.
 */
export const fallbackGutterColors: GutterColorConfig = {
  ribbon: {
    default: "bg-gray-200 dark:bg-gray-700",
    focused: "bg-gray-400 dark:bg-gray-500",
  },
  background: {
    focused: "bg-gray-50/50 dark:bg-gray-900/30",
  },
};

/**
 * Get gutter colors for a cell type.
 * Falls back to neutral gray for unknown types.
 *
 * @param cellType - The cell type to get colors for
 * @param customColors - Optional custom color overrides
 */
export function getGutterColors(
  cellType: string,
  customColors?: Record<string, GutterColorConfig>,
): GutterColorConfig {
  // Check custom colors first
  if (customColors?.[cellType]) {
    return customColors[cellType];
  }
  // Then check defaults
  if (defaultGutterColors[cellType]) {
    return defaultGutterColors[cellType];
  }
  // Fall back to neutral
  return fallbackGutterColors;
}
