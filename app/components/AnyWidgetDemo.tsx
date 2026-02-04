"use client";

/**
 * Demo component for the AnyWidgetView.
 *
 * This demonstrates:
 * - Loading inline ESM code
 * - AFM model interface (get, set, save_changes, on)
 * - CSS injection
 * - Two-way state synchronization
 */

import { useCallback, useState } from "react";
import {
  WidgetStoreProvider,
  useWidgetStoreRequired,
  useWidgetModels,
  type JupyterCommMessage,
} from "@/registry/widgets/widget-store-context";
import { AnyWidgetView } from "@/registry/widgets/anywidget-view";
import { Button } from "@/registry/primitives/button";

// === Example anywidget ESM code ===

const COUNTER_ESM = `
export default {
  render({ model, el }) {
    const btn = document.createElement("button");
    btn.className = "anywidget-counter-btn";
    btn.textContent = "Count: " + (model.get("count") ?? 0);

    btn.onclick = () => {
      const newCount = (model.get("count") ?? 0) + 1;
      model.set("count", newCount);
      model.save_changes();
      btn.textContent = "Count: " + newCount;
    };

    model.on("change:count", () => {
      btn.textContent = "Count: " + model.get("count");
    });

    el.appendChild(btn);
  }
}
`;

const COUNTER_CSS = `
.anywidget-counter-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: background 0.15s;
}
.anywidget-counter-btn:hover {
  background: hsl(var(--muted));
}
`;

// === Test Messages ===

const createAnyWidgetMessage = (
  commId: string,
  count: number = 0
): JupyterCommMessage => ({
  header: {
    msg_id: crypto.randomUUID(),
    msg_type: "comm_open",
  },
  content: {
    comm_id: commId,
    target_name: "jupyter.widget",
    data: {
      state: {
        _model_name: "AnyModel",
        _model_module: "anywidget",
        _view_name: "AnyView",
        _view_module: "anywidget",
        _esm: COUNTER_ESM,
        _css: COUNTER_CSS,
        count,
      },
    },
  },
});

const updateCountMessage = (
  commId: string,
  count: number
): JupyterCommMessage => ({
  header: {
    msg_id: crypto.randomUUID(),
    msg_type: "comm_msg",
  },
  content: {
    comm_id: commId,
    data: {
      method: "update",
      state: { count },
    },
  },
});

// === Demo Components ===

const WIDGET_ID = "demo-anywidget-001";

function DemoControls() {
  const { handleMessage } = useWidgetStoreRequired();
  const models = useWidgetModels();
  const [log, setLog] = useState<string[]>([]);

  const hasWidget = models.has(WIDGET_ID);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-4), msg]);
  };

  const createWidget = () => {
    handleMessage(createAnyWidgetMessage(WIDGET_ID, 0));
    addLog("comm_open: Created counter widget");
  };

  const simulateKernelUpdate = () => {
    const randomCount = Math.floor(Math.random() * 100);
    handleMessage(updateCountMessage(WIDGET_ID, randomCount));
    addLog(`comm_msg: Kernel set count → ${randomCount}`);
  };

  const resetCount = () => {
    handleMessage(updateCountMessage(WIDGET_ID, 0));
    addLog("comm_msg: Reset count → 0");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {!hasWidget ? (
          <Button onClick={createWidget} variant="default">
            Create Widget
          </Button>
        ) : (
          <>
            <Button onClick={simulateKernelUpdate} variant="secondary">
              Simulate Kernel Update
            </Button>
            <Button onClick={resetCount} variant="outline">
              Reset Count
            </Button>
          </>
        )}
      </div>
      {log.length > 0 && (
        <div className="text-xs font-mono bg-muted p-2 rounded max-h-24 overflow-y-auto">
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

function WidgetDisplay() {
  const models = useWidgetModels();
  const hasWidget = models.has(WIDGET_ID);

  if (!hasWidget) {
    return (
      <div className="text-muted-foreground italic text-sm">
        Click "Create Widget" to load the anywidget.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnyWidgetView modelId={WIDGET_ID} />
      <p className="text-xs text-muted-foreground">
        Click the button to increment. Use "Simulate Kernel Update" to see
        external state changes.
      </p>
    </div>
  );
}

function AnyWidgetDemoContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Controls</h3>
        <DemoControls />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Widget</h3>
        <WidgetDisplay />
      </div>
    </div>
  );
}

/**
 * Exported demo component with provider wrapper.
 */
export function AnyWidgetDemo() {
  const sendMessage = useCallback((msg: JupyterCommMessage) => {
    console.log("Widget → Kernel:", msg);
  }, []);

  return (
    <WidgetStoreProvider sendMessage={sendMessage}>
      <AnyWidgetDemoContent />
    </WidgetStoreProvider>
  );
}

export default AnyWidgetDemo;
