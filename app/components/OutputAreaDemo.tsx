"use client";

import { useCallback, useEffect, useState } from "react";
import { type JupyterOutput, OutputArea } from "@/registry/cell/OutputArea";
import { IsolatedRendererProvider } from "@/registry/outputs/isolated";
import {
  type JupyterCommMessage,
  useWidgetStoreRequired,
  WidgetStoreProvider,
} from "@/registry/widgets/widget-store-context";

// Import to register built-in widgets
import "@/registry/widgets/controls";

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
      // Note: HTML output in iframes inherits CSS variables from frame-html.ts
      // The frame provides: --bg-secondary, --border-color, --text-primary
      // Tables without explicit styles will use these variables automatically
      "text/html": `<table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Accuracy</th>
            <th>F1 Score</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Random Forest</td><td>0.94</td><td>0.93</td></tr>
          <tr><td>XGBoost</td><td>0.96</td><td>0.95</td></tr>
        </tbody>
      </table>`,
      "text/plain": "DataFrame with model results",
    },
    execution_count: 3,
  },
];

// Widget output - renders an IntSlider widget through OutputArea's isolation pipeline
const WIDGET_MODEL_ID = "demo-slider-widget";

const widgetOutput: JupyterOutput[] = [
  {
    output_type: "display_data",
    data: {
      "application/vnd.jupyter.widget-view+json": {
        model_id: WIDGET_MODEL_ID,
        version_major: 2,
        version_minor: 0,
      },
      "text/plain": "IntSlider(value=50, description='Value:')",
    },
    metadata: {},
  },
];

// Widget comm messages to create the slider model
const createSliderWidget = (): JupyterCommMessage => ({
  header: { msg_id: crypto.randomUUID(), msg_type: "comm_open" },
  content: {
    comm_id: WIDGET_MODEL_ID,
    target_name: "jupyter.widget",
    data: {
      state: {
        _model_name: "IntSliderModel",
        _model_module: "@jupyter-widgets/controls",
        _model_module_version: "2.0.0",
        _view_name: "IntSliderView",
        _view_module: "@jupyter-widgets/controls",
        _view_module_version: "2.0.0",
        value: 50,
        min: 0,
        max: 100,
        step: 1,
        description: "Value:",
        readout: true,
        orientation: "horizontal",
      },
    },
  },
});

/**
 * Widget demo content - creates widget model and renders through OutputArea
 */
function WidgetOutputDemoContent() {
  const { handleMessage } = useWidgetStoreRequired();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    // Create the widget model in the store
    handleMessage(createSliderWidget());
    setInitialized(true);
  }, [handleMessage, initialized]);

  if (!initialized) {
    return <div className="text-muted-foreground text-sm">Loading widget...</div>;
  }

  // Render widget output through OutputArea (isolated="auto" will detect widget MIME type)
  return <OutputArea outputs={widgetOutput} isolated="auto" />;
}

/**
 * Widget demo with providers - shows widget rendered through OutputArea isolation
 */
function WidgetOutputDemo() {
  const sendMessage = useCallback((msg: JupyterCommMessage) => {
    console.log("Widget → Kernel:", msg);
  }, []);

  return (
    <IsolatedRendererProvider basePath="/isolated">
      <WidgetStoreProvider sendMessage={sendMessage}>
        <WidgetOutputDemoContent />
      </WidgetStoreProvider>
    </IsolatedRendererProvider>
  );
}

interface OutputAreaDemoProps {
  variant?:
    | "simple"
    | "multi"
    | "error"
    | "collapsible"
    | "scrollable"
    | "html"
    | "widget";
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
      return (
        <IsolatedRendererProvider basePath="/isolated">
          <OutputArea outputs={htmlOutput} isolated={true} />
        </IsolatedRendererProvider>
      );

    case "widget":
      return <WidgetOutputDemo />;

    default:
      return <OutputArea outputs={sampleOutputs} />;
  }
}
