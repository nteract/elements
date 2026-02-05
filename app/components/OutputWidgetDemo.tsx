"use client";

/**
 * Demo component for the OutputModel widget.
 *
 * Creates OutputModel widgets with sample Jupyter outputs pumped into state,
 * showing how captured outputs render inside the widget tree.
 */

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaProvider } from "@/registry/outputs/media-provider";
import {
  type JupyterCommMessage,
  useWidgetModels,
  useWidgetStoreRequired,
  WidgetStoreProvider,
} from "@/registry/widgets/widget-store-context";
import { WidgetView } from "@/registry/widgets/widget-view";

// Import to register built-in widgets (includes OutputModel)
import "@/registry/widgets/controls";

// === Sample Messages ===

function createWidgetMessage(
  commId: string,
  modelName: string,
  modelModule: string,
  state: Record<string, unknown>,
): JupyterCommMessage {
  return {
    header: {
      msg_id: crypto.randomUUID(),
      msg_type: "comm_open",
    },
    content: {
      comm_id: commId,
      target_name: "jupyter.widget",
      data: {
        state: {
          _model_name: modelName,
          _model_module: modelModule,
          _view_name: modelName.replace("Model", "View"),
          _view_module: modelModule,
          ...state,
        },
      },
    },
  };
}

function updateWidgetState(
  commId: string,
  state: Record<string, unknown>,
): JupyterCommMessage {
  return {
    header: { msg_id: crypto.randomUUID(), msg_type: "comm_msg" },
    content: {
      comm_id: commId,
      data: { method: "update", state },
    },
  };
}

// === Sample Output Data ===

const STREAM_OUTPUTS = [
  {
    output_type: "stream" as const,
    name: "stdout" as const,
    text: "Training model...\nEpoch 1/3: loss=0.482\nEpoch 2/3: loss=0.231\nEpoch 3/3: loss=0.089\n",
  },
  {
    output_type: "stream" as const,
    name: "stderr" as const,
    text: "WARNING: GPU memory usage at 85%\n",
  },
];

const RICH_OUTPUTS = [
  {
    output_type: "execute_result" as const,
    data: {
      "text/html":
        "<table><thead><tr><th></th><th>name</th><th>score</th></tr></thead><tbody><tr><td>0</td><td>Alice</td><td>95</td></tr><tr><td>1</td><td>Bob</td><td>87</td></tr><tr><td>2</td><td>Carol</td><td>92</td></tr></tbody></table>",
      "text/plain":
        "   name  score\n0  Alice     95\n1  Bob       87\n2  Carol     92",
    },
    execution_count: 1,
  },
];

const ERROR_OUTPUTS = [
  {
    output_type: "stream" as const,
    name: "stdout" as const,
    text: "Attempting connection...\n",
  },
  {
    output_type: "error" as const,
    ename: "ConnectionError",
    evalue: "Failed to connect to database on port 5432",
    traceback: [
      "\u001b[0;31m---------------------------------------------------------------------------\u001b[0m",
      "\u001b[0;31mConnectionError\u001b[0m                           Traceback (most recent call last)",
      "Cell \u001b[0;32mIn[3], line 2\u001b[0m\n\u001b[1;32m      1\u001b[0m \u001b[38;5;28;01mimport\u001b[39;00m \u001b[38;5;21;01mpsycopg2\u001b[39;00m\n\u001b[0;32m----> 2\u001b[0m conn \u001b[38;5;241m=\u001b[39m psycopg2\u001b[38;5;241m.\u001b[39mconnect(host\u001b[38;5;241m=\u001b[39m\u001b[38;5;124m'\u001b[39m\u001b[38;5;124mlocalhost\u001b[39m\u001b[38;5;124m'\u001b[39m)\n",
      "\u001b[0;31mConnectionError\u001b[0m: Failed to connect to database on port 5432",
    ],
  },
];

const MIXED_OUTPUTS = [
  {
    output_type: "stream" as const,
    name: "stdout" as const,
    text: "Results:\n",
  },
  {
    output_type: "display_data" as const,
    data: {
      "application/json": {
        accuracy: 0.95,
        precision: 0.93,
        recall: 0.97,
        f1: 0.95,
      },
      "text/plain":
        "{'accuracy': 0.95, 'precision': 0.93, 'recall': 0.97, 'f1': 0.95}",
    },
    metadata: {},
  },
  {
    output_type: "display_data" as const,
    data: {
      "text/markdown":
        "### Summary\n\nModel training **complete**. The model achieved:\n- 95% accuracy\n- 0.95 F1 score\n\n> Ready for deployment.",
      "text/plain": "Summary: Model training complete.",
    },
    metadata: {},
  },
];

// === Demo Components ===

function DemoControls() {
  const { handleMessage } = useWidgetStoreRequired();
  const models = useWidgetModels();
  const [created, setCreated] = useState(false);

  const createOutputWidgets = () => {
    // Output widget with stream outputs
    handleMessage(
      createWidgetMessage(
        "output-streams",
        "OutputModel",
        "@jupyter-widgets/output",
        {
          outputs: STREAM_OUTPUTS,
          msg_id: "",
        },
      ),
    );

    // Output widget with rich HTML (DataFrame)
    handleMessage(
      createWidgetMessage(
        "output-rich",
        "OutputModel",
        "@jupyter-widgets/output",
        {
          outputs: RICH_OUTPUTS,
          msg_id: "",
        },
      ),
    );

    // Output widget with error traceback
    handleMessage(
      createWidgetMessage(
        "output-error",
        "OutputModel",
        "@jupyter-widgets/output",
        {
          outputs: ERROR_OUTPUTS,
          msg_id: "",
        },
      ),
    );

    // Output widget with mixed content
    handleMessage(
      createWidgetMessage(
        "output-mixed",
        "OutputModel",
        "@jupyter-widgets/output",
        {
          outputs: MIXED_OUTPUTS,
          msg_id: "",
        },
      ),
    );

    // A VBox containing a label + output widget (the common pattern)
    handleMessage(
      createWidgetMessage(
        "vbox-label",
        "LabelModel",
        "@jupyter-widgets/controls",
        {
          value: "Captured Output:",
        },
      ),
    );
    handleMessage(
      createWidgetMessage(
        "output-in-vbox",
        "OutputModel",
        "@jupyter-widgets/output",
        {
          outputs: RICH_OUTPUTS,
          msg_id: "",
        },
      ),
    );
    handleMessage(
      createWidgetMessage(
        "demo-vbox",
        "VBoxModel",
        "@jupyter-widgets/controls",
        {
          children: ["IPY_MODEL_vbox-label", "IPY_MODEL_output-in-vbox"],
          box_style: "info",
        },
      ),
    );

    setCreated(true);
  };

  const appendOutput = () => {
    const model = models.get("output-streams");
    if (!model) return;
    const currentOutputs = (model.state.outputs as typeof STREAM_OUTPUTS) || [];
    handleMessage(
      updateWidgetState("output-streams", {
        outputs: [
          ...currentOutputs,
          {
            output_type: "stream",
            name: "stdout",
            text: `Step ${currentOutputs.length + 1}: checkpoint saved.\n`,
          },
        ],
      }),
    );
  };

  const clearOutputs = () => {
    handleMessage(updateWidgetState("output-streams", { outputs: [] }));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {!created ? (
        <Button onClick={createOutputWidgets} variant="default">
          Create Output Widgets
        </Button>
      ) : (
        <>
          <Button onClick={appendOutput} variant="secondary">
            Append Stream Output
          </Button>
          <Button onClick={clearOutputs} variant="outline">
            Clear Stream Widget
          </Button>
          <Button onClick={createOutputWidgets} variant="outline">
            Reset All
          </Button>
        </>
      )}
    </div>
  );
}

const DEMO_SECTIONS = [
  {
    id: "output-streams",
    label: "Stream Outputs",
    description: "stdout + stderr",
  },
  { id: "output-rich", label: "Rich Output", description: "HTML DataFrame" },
  {
    id: "output-error",
    label: "Error Traceback",
    description: "stream + error",
  },
  {
    id: "output-mixed",
    label: "Mixed Content",
    description: "stream + JSON + markdown",
  },
  { id: "demo-vbox", label: "In Layout", description: "VBox(Label, Output)" },
];

function WidgetDisplay() {
  const models = useWidgetModels();

  if (models.size === 0) {
    return (
      <div className="text-muted-foreground italic text-sm">
        Click &quot;Create Output Widgets&quot; to see OutputModel in action.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {DEMO_SECTIONS.map(({ id, label, description }) => {
        if (!models.has(id)) return null;
        return (
          <div key={id} className="border rounded-lg p-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            </div>
            <WidgetView modelId={id} />
          </div>
        );
      })}
    </div>
  );
}

function OutputWidgetDemoContent() {
  return (
    <div className="space-y-6">
      <DemoControls />
      <WidgetDisplay />
    </div>
  );
}

/**
 * Exported demo component with provider wrappers.
 *
 * Wraps with WidgetStoreProvider and MediaProvider so the OutputWidget
 * can render all output types through the standard media pipeline.
 */
export function OutputWidgetDemo() {
  const sendMessage = useCallback((msg: JupyterCommMessage) => {
    console.log("Widget → Kernel:", msg);
  }, []);

  return (
    <WidgetStoreProvider sendMessage={sendMessage}>
      <MediaProvider>
        <OutputWidgetDemoContent />
      </MediaProvider>
    </WidgetStoreProvider>
  );
}

export default OutputWidgetDemo;
