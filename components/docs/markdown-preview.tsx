"use client";

import { type JupyterOutput, OutputArea } from "@/registry/cell/OutputArea";

interface MarkdownPreviewProps {
  /** Markdown content to render */
  content: string;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * MarkdownPreview - Renders markdown content in an isolated iframe for docs.
 *
 * This is a docs-only component that wraps OutputArea to safely render
 * markdown content. For production code, use OutputArea directly.
 */
export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const outputs: JupyterOutput[] = [
    {
      output_type: "display_data",
      data: { "text/markdown": content },
    },
  ];

  return (
    <div className={className}>
      <OutputArea outputs={outputs} />
    </div>
  );
}
