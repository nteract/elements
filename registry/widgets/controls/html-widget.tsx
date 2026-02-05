"use client";

/**
 * HTML widget - renders arbitrary HTML content.
 *
 * Maps to ipywidgets HTMLModel.
 */

import { cn } from "@/lib/utils";
import type { WidgetComponentProps } from "../widget-registry";
import { useWidgetModelValue } from "../widget-store-context";

export function HTMLWidget({ modelId, className }: WidgetComponentProps) {
  const value = useWidgetModelValue<string>(modelId, "value") ?? "";

  return (
    <div
      className={cn("widget-html", className)}
      data-widget-id={modelId}
      data-widget-type="HTML"
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

export default HTMLWidget;
