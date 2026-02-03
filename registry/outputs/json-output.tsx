"use client";

import JsonView from "@uiw/react-json-view";

interface JsonOutputProps {
  /**
   * The JSON data to render. Can be any JSON-serializable value.
   */
  data: unknown;
  /**
   * Collapse nested objects beyond this depth.
   * Set to `false` to expand all, or a number for depth limit.
   * @default false
   */
  collapsed?: boolean | number;
  /**
   * Show data types alongside values
   * @default false
   */
  displayDataTypes?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * JsonOutput component for rendering JSON data in notebook outputs
 *
 * Displays JSON data in an interactive, expandable tree view.
 * Useful for inspecting complex data structures, API responses,
 * and object representations from Jupyter kernels.
 */
export function JsonOutput({
  data,
  collapsed = false,
  displayDataTypes = false,
  className = "",
}: JsonOutputProps) {
  if (data === undefined || data === null) {
    return (
      <div className={`not-prose py-2 font-mono text-sm text-gray-500 ${className}`.trim()}>
        {data === undefined ? "undefined" : "null"}
      </div>
    );
  }

  // Wrap primitives in an object for display
  const jsonData =
    data && typeof data === "object" ? data : { value: data };

  return (
    <div className={`not-prose py-2 ${className}`.trim()}>
      <div className="rounded bg-gray-50 p-3">
        <JsonView
          value={jsonData}
          collapsed={collapsed}
          displayDataTypes={displayDataTypes}
          indentWidth={2}
          style={{
            backgroundColor: "transparent",
            fontSize: "0.875rem",
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          }}
        />
      </div>
    </div>
  );
}

export default JsonOutput;
