"use client";

import { useState } from "react";
import { type JupyterOutput, OutputArea } from "@/registry/cell/OutputArea";

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

const htmlOutput: JupyterOutput[] = [
  {
    output_type: "execute_result",
    data: {
      "text/html": `<table style="border-collapse: collapse; width: 100%; font-family: system-ui;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="border: 1px solid #e0e0e0; padding: 8px;">Model</th>
            <th style="border: 1px solid #e0e0e0; padding: 8px;">Accuracy</th>
            <th style="border: 1px solid #e0e0e0; padding: 8px;">F1 Score</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="border: 1px solid #e0e0e0; padding: 8px;">Random Forest</td><td style="border: 1px solid #e0e0e0; padding: 8px;">0.94</td><td style="border: 1px solid #e0e0e0; padding: 8px;">0.93</td></tr>
          <tr><td style="border: 1px solid #e0e0e0; padding: 8px;">XGBoost</td><td style="border: 1px solid #e0e0e0; padding: 8px;">0.96</td><td style="border: 1px solid #e0e0e0; padding: 8px;">0.95</td></tr>
        </tbody>
      </table>`,
      "text/plain": "DataFrame with model results",
    },
    execution_count: 3,
  },
];

interface OutputAreaDemoProps {
  variant?: "simple" | "multi" | "error" | "collapsible" | "scrollable" | "html";
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

    case "html":
      return <OutputArea outputs={htmlOutput} isolated={true} />;

    default:
      return <OutputArea outputs={sampleOutputs} />;
  }
}
