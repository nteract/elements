"use client";

import { useState } from "react";
import { OutputArea, type JupyterOutput } from "@/registry/cell/OutputArea";

const sampleOutputs: JupyterOutput[] = [
  {
    output_type: "execute_result",
    data: {
      "text/plain": "42",
    },
    execution_count: 1,
  },
];

const multiOutputs: JupyterOutput[] = [
  {
    output_type: "stream",
    name: "stdout",
    text: "Processing data...\nLoading model...\n",
  },
  {
    output_type: "execute_result",
    data: {
      "text/plain": "{'accuracy': 0.95, 'loss': 0.05}",
      "application/json": { accuracy: 0.95, loss: 0.05 },
    },
    execution_count: 2,
  },
];

const errorOutput: JupyterOutput[] = [
  {
    output_type: "error",
    ename: "ValueError",
    evalue: "invalid literal for int() with base 10: 'hello'",
    traceback: [
      "\u001b[0;31m---------------------------------------------------------------------------\u001b[0m",
      "\u001b[0;31mValueError\u001b[0m                                Traceback (most recent call last)",
      "Cell \u001b[0;32mIn[1], line 1\u001b[0m\n\u001b[0;32m----> 1\u001b[0m \u001b[38;5;28mint\u001b[39m(\u001b[38;5;124m'\u001b[39m\u001b[38;5;124mhello\u001b[39m\u001b[38;5;124m'\u001b[39m)\n",
      "\u001b[0;31mValueError\u001b[0m: invalid literal for int() with base 10: 'hello'",
    ],
  },
];

interface OutputAreaDemoProps {
  variant?: "simple" | "multi" | "error" | "collapsible" | "scrollable";
}

export function OutputAreaDemo({ variant = "simple" }: OutputAreaDemoProps) {
  const [collapsed, setCollapsed] = useState(false);

  switch (variant) {
    case "simple":
      return <OutputArea outputs={sampleOutputs} />;

    case "multi":
      return <OutputArea outputs={multiOutputs} />;

    case "error":
      return <OutputArea outputs={errorOutput} />;

    case "collapsible":
      return (
        <OutputArea
          outputs={multiOutputs}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      );

    case "scrollable":
      return (
        <OutputArea
          outputs={[...multiOutputs, ...multiOutputs, ...multiOutputs]}
          maxHeight={150}
        />
      );

    default:
      return <OutputArea outputs={sampleOutputs} />;
  }
}
