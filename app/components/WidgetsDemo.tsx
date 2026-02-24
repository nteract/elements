"use client";

/**
 * Interactive demo for the Jupyter Widgets index page.
 *
 * Renders widgets through OutputArea (not WidgetView directly) to demonstrate
 * the full isolation pipeline: OutputArea → IsolatedFrame → isolated-renderer → WidgetView
 *
 * Models raw Jupyter messages (comm_open, comm_msg) to show realistic kernel communication.
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { type JupyterOutput, OutputArea } from "@/registry/cell/OutputArea";
import { IsolatedRendererProvider } from "@/registry/outputs/isolated";
import {
  type JupyterCommMessage,
  useWidgetModels,
  useWidgetStoreRequired,
  WidgetStoreProvider,
} from "@/registry/widgets/widget-store-context";

// Import to register built-in widgets
import "@/registry/widgets/controls";

// === Model IDs ===
const SLIDER_MODEL_ID = "widgets-demo-slider";
const OUTPUT_MODEL_ID = "widgets-demo-output";

// === Raw comm_open messages (modeling kernel communication) ===

function createSliderMessage(): JupyterCommMessage {
  return {
    header: { msg_id: crypto.randomUUID(), msg_type: "comm_open" },
    content: {
      comm_id: SLIDER_MODEL_ID,
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
          description: "Progress:",
          readout: true,
          orientation: "horizontal",
        },
      },
    },
  };
}

function createOutputMessage(outputs: JupyterOutput[]): JupyterCommMessage {
  return {
    header: { msg_id: crypto.randomUUID(), msg_type: "comm_open" },
    content: {
      comm_id: OUTPUT_MODEL_ID,
      target_name: "jupyter.widget",
      data: {
        state: {
          _model_name: "OutputModel",
          _model_module: "@jupyter-widgets/output",
          _model_module_version: "1.0.0",
          _view_name: "OutputView",
          _view_module: "@jupyter-widgets/output",
          _view_module_version: "1.0.0",
          msg_id: "",
          outputs,
        },
      },
    },
  };
}

// comm_msg for state updates
function updateOutputState(outputs: JupyterOutput[]): JupyterCommMessage {
  return {
    header: { msg_id: crypto.randomUUID(), msg_type: "comm_msg" },
    content: {
      comm_id: OUTPUT_MODEL_ID,
      data: { method: "update", state: { outputs } },
    },
  };
}

// === Widget outputs to render through OutputArea ===

const sliderWidgetOutput: JupyterOutput[] = [
  {
    output_type: "display_data",
    data: {
      "application/vnd.jupyter.widget-view+json": {
        model_id: SLIDER_MODEL_ID,
        version_major: 2,
        version_minor: 0,
      },
      "text/plain": "IntSlider(value=50, description='Progress:')",
    },
    metadata: {},
  },
];

const outputWidgetOutput: JupyterOutput[] = [
  {
    output_type: "display_data",
    data: {
      "application/vnd.jupyter.widget-view+json": {
        model_id: OUTPUT_MODEL_ID,
        version_major: 2,
        version_minor: 0,
      },
      "text/plain": "Output()",
    },
    metadata: {},
  },
];

// Initial outputs for the OutputWidget
const INITIAL_OUTPUTS: JupyterOutput[] = [
  {
    output_type: "stream",
    name: "stdout",
    text: "Processing...\n",
  },
  {
    output_type: "display_data",
    data: {
      "text/html": `<table>
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Status</td><td>Ready</td></tr>
          <tr><td>Progress</td><td>100%</td></tr>
        </tbody>
      </table>`,
      "text/plain": "Status: Ready, Progress: 100%",
    },
    metadata: {},
  },
];

// === Demo Components ===

function WidgetsDemoContent() {
  const { handleMessage } = useWidgetStoreRequired();
  const models = useWidgetModels();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    // Send comm_open messages to create widget models
    handleMessage(createSliderMessage());
    handleMessage(createOutputMessage(INITIAL_OUTPUTS));
    setInitialized(true);
  }, [handleMessage, initialized]);

  const appendOutput = () => {
    const model = models.get(OUTPUT_MODEL_ID);
    if (!model) return;
    const currentOutputs = (model.state.outputs as JupyterOutput[]) || [];
    // Send comm_msg to update state (simulates kernel sending update)
    handleMessage(
      updateOutputState([
        ...currentOutputs,
        {
          output_type: "stream",
          name: "stdout",
          text: `Step ${currentOutputs.length + 1} complete.\n`,
        },
      ]),
    );
  };

  if (!initialized) {
    return (
      <div className="text-muted-foreground text-sm">Loading widgets...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* IntSlider through OutputArea */}
      <div data-testid="slider-widget-demo">
        <h4 className="mb-2 text-sm font-medium">IntSlider Widget</h4>
        <OutputArea outputs={sliderWidgetOutput} isolated="auto" />
      </div>

      {/* OutputWidget through OutputArea */}
      <div data-testid="output-widget-demo">
        <h4 className="mb-2 text-sm font-medium">OutputWidget with HTML</h4>
        <div className="mb-2 flex gap-2">
          <Button
            onClick={appendOutput}
            variant="secondary"
            size="sm"
            data-testid="append-output-btn"
          >
            Append Output
          </Button>
        </div>
        <OutputArea outputs={outputWidgetOutput} isolated="auto" />
      </div>
    </div>
  );
}

/**
 * Exported demo component with provider wrappers.
 *
 * Shows widgets rendered through OutputArea → IsolatedFrame → isolated-renderer → WidgetView
 * to demonstrate the full isolation pipeline.
 */
export function WidgetsDemo() {
  const sendMessage = useCallback((msg: JupyterCommMessage) => {
    console.log("Widget → Kernel:", msg);
  }, []);

  return (
    <IsolatedRendererProvider basePath="/isolated">
      <WidgetStoreProvider sendMessage={sendMessage}>
        <WidgetsDemoContent />
      </WidgetStoreProvider>
    </IsolatedRendererProvider>
  );
}

export default WidgetsDemo;
