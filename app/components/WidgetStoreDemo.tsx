"use client";

/**
 * Demo component for the widget model store.
 *
 * This demonstrates:
 * - Processing comm_open, comm_msg, comm_close messages
 * - Creating, updating, and deleting widget models
 * - IPY_MODEL_ reference resolution
 * - Fine-grained subscriptions with useWidgetModelValue
 */

import { useCallback, useState } from "react";
import { Button } from "@/registry/primitives/button";
import {
  type JupyterCommMessage,
  useResolvedModelValue,
  useWidgetModels,
  useWidgetModelValue,
  useWidgetStoreRequired,
  type WidgetModel,
  WidgetStoreProvider,
} from "@/registry/widgets/widget-store-context";

// === Test Data from Issue #66 ===

const TEST_MESSAGES = {
  // comm_open for LayoutModel
  layoutOpen: {
    header: {
      msg_id: "bb91d722-ab349a6aa6e03291c9217b5c_57748_22",
      msg_type: "comm_open",
    },
    content: {
      comm_id: "a6f0231f219b428cad40fcf5c42d7608",
      target_name: "jupyter.widget",
      data: {
        state: {
          _model_module: "@jupyter-widgets/base",
          _model_module_version: "2.0.0",
          _model_name: "LayoutModel",
          _view_module: "@jupyter-widgets/base",
          _view_name: "LayoutView",
        },
      },
    },
  } as JupyterCommMessage,

  // comm_open for ProgressStyleModel
  styleOpen: {
    header: {
      msg_id: "bb91d722-ab349a6aa6e03291c9217b5c_57748_23",
      msg_type: "comm_open",
    },
    content: {
      comm_id: "7d372ddf69834cfabf6d52701116a7cd",
      target_name: "jupyter.widget",
      data: {
        state: {
          _model_module: "@jupyter-widgets/controls",
          _model_module_version: "2.0.0",
          _model_name: "ProgressStyleModel",
          _view_module: "@jupyter-widgets/base",
          _view_name: "StyleView",
          bar_color: null,
          description_width: "",
        },
      },
    },
  } as JupyterCommMessage,

  // comm_open for IntProgressModel (references the above via IPY_MODEL_)
  progressOpen: {
    header: {
      msg_id: "bb91d722-ab349a6aa6e03291c9217b5c_57748_24",
      msg_type: "comm_open",
    },
    content: {
      comm_id: "5d3a9b27b8cd4da880f2442d9d7fc047",
      target_name: "jupyter.widget",
      data: {
        state: {
          _model_module: "@jupyter-widgets/controls",
          _model_name: "IntProgressModel",
          _view_name: "ProgressView",
          description: "Loading:",
          layout: "IPY_MODEL_a6f0231f219b428cad40fcf5c42d7608",
          style: "IPY_MODEL_7d372ddf69834cfabf6d52701116a7cd",
          max: 10,
          min: 0,
          value: 0,
        },
      },
    },
  } as JupyterCommMessage,

  // comm_msg update (value: 0 → 5)
  progressUpdate5: {
    header: {
      msg_id: "bb91d722-ab349a6aa6e03291c9217b5c_57748_30",
      msg_type: "comm_msg",
    },
    content: {
      comm_id: "5d3a9b27b8cd4da880f2442d9d7fc047",
      data: {
        method: "update",
        state: { value: 5 },
      },
    },
  } as JupyterCommMessage,

  // comm_msg update (value: 5 → 10)
  progressUpdate10: {
    header: {
      msg_id: "bb91d722-ab349a6aa6e03291c9217b5c_57748_35",
      msg_type: "comm_msg",
    },
    content: {
      comm_id: "5d3a9b27b8cd4da880f2442d9d7fc047",
      data: {
        method: "update",
        state: { value: 10 },
      },
    },
  } as JupyterCommMessage,

  // comm_close
  progressClose: {
    header: {
      msg_id: "bb91d722-ab349a6aa6e03291c9217b5c_57748_40",
      msg_type: "comm_close",
    },
    content: {
      comm_id: "5d3a9b27b8cd4da880f2442d9d7fc047",
    },
  } as JupyterCommMessage,
};

// === Demo Components ===

/**
 * Control panel for sending test messages to the store.
 */
function DemoControls() {
  const { handleMessage } = useWidgetStoreRequired();
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-9), msg]); // Keep last 10 entries
  };

  const createAllModels = () => {
    handleMessage(TEST_MESSAGES.layoutOpen);
    addLog("comm_open: LayoutModel");
    handleMessage(TEST_MESSAGES.styleOpen);
    addLog("comm_open: ProgressStyleModel");
    handleMessage(TEST_MESSAGES.progressOpen);
    addLog("comm_open: IntProgressModel");
  };

  const updateTo5 = () => {
    handleMessage(TEST_MESSAGES.progressUpdate5);
    addLog("comm_msg: value → 5");
  };

  const updateTo10 = () => {
    handleMessage(TEST_MESSAGES.progressUpdate10);
    addLog("comm_msg: value → 10");
  };

  const closeProgress = () => {
    handleMessage(TEST_MESSAGES.progressClose);
    addLog("comm_close: IntProgressModel");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={createAllModels} variant="default">
          Create Models
        </Button>
        <Button onClick={updateTo5} variant="secondary">
          Update to 5
        </Button>
        <Button onClick={updateTo10} variant="secondary">
          Update to 10
        </Button>
        <Button onClick={closeProgress} variant="destructive">
          Close Progress
        </Button>
      </div>
      {log.length > 0 && (
        <div className="text-xs font-mono bg-muted p-2 rounded max-h-32 overflow-y-auto">
          {log.map((entry, i) => (
            <div key={i} className="text-muted-foreground">
              {entry}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Display all models in the store.
 */
function ModelList() {
  const models = useWidgetModels();

  if (models.size === 0) {
    return (
      <div className="text-muted-foreground italic">
        No models. Click "Create Models" to start.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from(models.values()).map((model) => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  );
}

/**
 * Card displaying a single model's info.
 */
function ModelCard({ model }: { model: WidgetModel }) {
  const isProgress = model.modelName === "IntProgressModel";

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{model.modelName}</span>
        <span className="text-xs text-muted-foreground font-mono">
          {model.id.slice(0, 8)}...
        </span>
      </div>
      <div className="text-xs text-muted-foreground">{model.modelModule}</div>

      {isProgress && <ProgressDisplay modelId={model.id} />}

      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          State ({Object.keys(model.state).length} keys)
        </summary>
        <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
          {JSON.stringify(model.state, null, 2)}
        </pre>
      </details>
    </div>
  );
}

/**
 * Progress bar that subscribes only to the 'value' key.
 * Demonstrates fine-grained subscriptions.
 */
function ProgressDisplay({ modelId }: { modelId: string }) {
  // Fine-grained subscriptions - only re-renders when these specific values change
  const value = useWidgetModelValue<number>(modelId, "value") ?? 0;
  const min = useWidgetModelValue<number>(modelId, "min") ?? 0;
  const max = useWidgetModelValue<number>(modelId, "max") ?? 100;
  const description = useWidgetModelValue<string>(modelId, "description") ?? "";

  // Demonstrate IPY_MODEL_ resolution
  const layoutModel = useResolvedModelValue(modelId, "layout");
  const layoutResolved = layoutModel && typeof layoutModel === "object";

  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
        <span className="text-sm font-mono">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {layoutResolved ? (
        <div className="text-xs text-green-600">
          ✓ layout reference resolved to{" "}
          {(layoutModel as WidgetModel).modelName}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Main demo component.
 */
function WidgetStoreDemoContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Controls</h3>
        <DemoControls />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Widget Models</h3>
        <ModelList />
      </div>
    </div>
  );
}

/**
 * Exported demo component with provider wrapper.
 */
export function WidgetStoreDemo({ variant }: { variant?: string }) {
  const sendMessage = useCallback((msg: JupyterCommMessage) => {
    console.log("Send to kernel:", msg);
  }, []);

  return (
    <WidgetStoreProvider sendMessage={sendMessage}>
      <WidgetStoreDemoContent />
    </WidgetStoreProvider>
  );
}

export default WidgetStoreDemo;
