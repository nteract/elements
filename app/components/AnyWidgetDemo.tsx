"use client";

/**
 * Demo component for the AnyWidgetView.
 *
 * This demonstrates:
 * - Loading inline ESM code with remote imports (esm.sh)
 * - AFM model interface (get, set, save_changes, on, send)
 * - CSS injection
 * - Two-way state synchronization
 * - Custom message handling (kernel ↔ widget)
 */

import { useCallback, useRef, useState } from "react";
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
    // Create container
    const container = document.createElement("div");
    container.className = "anywidget-counter-container";

    // Counter button
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

    // Custom message display
    const msgDisplay = document.createElement("div");
    msgDisplay.className = "anywidget-msg-display";
    msgDisplay.textContent = "No custom messages yet";

    // Listen for custom messages from kernel
    model.on("msg:custom", (content, buffers) => {
      msgDisplay.textContent = "Received: " + JSON.stringify(content);
      msgDisplay.classList.add("anywidget-msg-highlight");
      setTimeout(() => msgDisplay.classList.remove("anywidget-msg-highlight"), 500);
    });

    // Button to send custom message back to kernel
    const sendBtn = document.createElement("button");
    sendBtn.className = "anywidget-counter-btn anywidget-send-btn";
    sendBtn.textContent = "Send to Kernel";
    sendBtn.onclick = () => {
      model.send({ type: "ping", timestamp: Date.now() });
    };

    container.appendChild(btn);
    container.appendChild(sendBtn);
    container.appendChild(msgDisplay);
    el.appendChild(container);
  }
}
`;

const COUNTER_CSS = `
.anywidget-counter-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
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
  width: fit-content;
}
.anywidget-counter-btn:hover {
  background: hsl(var(--muted));
}
.anywidget-send-btn {
  font-size: 12px;
  padding: 4px 12px;
}
.anywidget-msg-display {
  font-size: 12px;
  font-family: monospace;
  padding: 8px;
  background: hsl(var(--muted));
  border-radius: 4px;
  transition: background 0.15s;
}
.anywidget-msg-highlight {
  background: hsl(var(--primary) / 0.2);
}
`;

// Confetti widget - demonstrates remote ESM imports from CDN
const CONFETTI_ESM = `
import confetti from "https://esm.sh/canvas-confetti@1.6";

function render({ model, el }) {
  let btn = document.createElement("button");
  btn.classList.add("confetti-button");
  btn.innerHTML = "click me!";
  btn.addEventListener("click", () => {
    confetti();
  });
  el.appendChild(btn);
}

export default { render };
`;

const CONFETTI_CSS = `
.confetti-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background-color: #ea580c;
  color: white;
  cursor: pointer;
  transition: background-color 0.15s;
}
.confetti-button:hover {
  background-color: #9a3412;
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

const customMessage = (
  commId: string,
  content: Record<string, unknown>
): JupyterCommMessage => ({
  header: {
    msg_id: crypto.randomUUID(),
    msg_type: "comm_msg",
  },
  content: {
    comm_id: commId,
    data: {
      method: "custom",
      content,
    },
  },
});

const createConfettiWidgetMessage = (commId: string): JupyterCommMessage => ({
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
        _esm: CONFETTI_ESM,
        _css: CONFETTI_CSS,
      },
    },
  },
});

// === Demo Components ===

const COUNTER_WIDGET_ID = "demo-anywidget-counter";
const CONFETTI_WIDGET_ID = "demo-anywidget-confetti";

function CounterDemo() {
  const { handleMessage } = useWidgetStoreRequired();
  const models = useWidgetModels();
  const [log, setLog] = useState<string[]>([]);

  const hasWidget = models.has(COUNTER_WIDGET_ID);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-4), msg]);
  };

  const createWidget = () => {
    handleMessage(createAnyWidgetMessage(COUNTER_WIDGET_ID, 0));
    addLog("comm_open: Created counter widget");
  };

  const simulateKernelUpdate = () => {
    const randomCount = Math.floor(Math.random() * 100);
    handleMessage(updateCountMessage(COUNTER_WIDGET_ID, randomCount));
    addLog(`comm_msg: Kernel set count → ${randomCount}`);
  };

  const resetCount = () => {
    handleMessage(updateCountMessage(COUNTER_WIDGET_ID, 0));
    addLog("comm_msg: Reset count → 0");
  };

  const sendCustomToWidget = () => {
    const msg = customMessage(COUNTER_WIDGET_ID, {
      type: "pong",
      message: "Hello from kernel!",
      timestamp: Date.now(),
    });
    handleMessage(msg);
    addLog("comm_msg: Sent custom message to widget");
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div>
        <h4 className="font-medium mb-1">Counter Widget</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Demonstrates state sync, custom messages, and the full AFM interface.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {!hasWidget ? (
          <Button onClick={createWidget} variant="default" size="sm">
            Create Counter
          </Button>
        ) : (
          <>
            <Button onClick={simulateKernelUpdate} variant="secondary" size="sm">
              Kernel Update
            </Button>
            <Button onClick={sendCustomToWidget} variant="secondary" size="sm">
              Custom Message
            </Button>
            <Button onClick={resetCount} variant="outline" size="sm">
              Reset
            </Button>
          </>
        )}
      </div>
      {hasWidget && (
        <div className="pt-2">
          <AnyWidgetView modelId={COUNTER_WIDGET_ID} />
        </div>
      )}
      {log.length > 0 && (
        <div className="text-xs font-mono bg-muted p-2 rounded max-h-20 overflow-y-auto">
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

function ConfettiDemo() {
  const { handleMessage } = useWidgetStoreRequired();
  const models = useWidgetModels();

  const hasWidget = models.has(CONFETTI_WIDGET_ID);

  const createWidget = () => {
    handleMessage(createConfettiWidgetMessage(CONFETTI_WIDGET_ID));
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div>
        <h4 className="font-medium mb-1">Confetti Widget</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Demonstrates remote ESM imports from CDN (esm.sh/canvas-confetti).
        </p>
      </div>
      {!hasWidget ? (
        <Button onClick={createWidget} variant="default" size="sm">
          Create Confetti
        </Button>
      ) : (
        <AnyWidgetView modelId={CONFETTI_WIDGET_ID} />
      )}
    </div>
  );
}

// Kernel log entry type
interface KernelLogEntry {
  direction: "in" | "out";
  type: string;
  data: unknown;
  timestamp: number;
}

/**
 * Exported demo component with provider wrapper.
 */
export function AnyWidgetDemo() {
  const [kernelLog, setKernelLog] = useState<KernelLogEntry[]>([]);
  const handleMessageRef = useRef<((msg: JupyterCommMessage) => void) | null>(null);

  const addKernelLog = useCallback((entry: Omit<KernelLogEntry, "timestamp">) => {
    setKernelLog((prev) => [...prev.slice(-9), { ...entry, timestamp: Date.now() }]);
  }, []);

  // Kernel message handler - receives messages from widgets
  const sendMessage = useCallback((msg: JupyterCommMessage) => {
    const method = msg.content.data?.method;
    const commId = msg.content.comm_id;

    // Log the incoming message
    if (method === "update") {
      addKernelLog({
        direction: "in",
        type: "update",
        data: msg.content.data?.state,
      });
    } else if (method === "custom") {
      const content = msg.content.data as Record<string, unknown>;
      addKernelLog({
        direction: "in",
        type: "custom",
        data: content,
      });

      // Auto-respond to ping with pong (simulating kernel behavior)
      if (content?.type === "ping" && commId && handleMessageRef.current) {
        setTimeout(() => {
          const response = customMessage(commId, {
            type: "pong",
            message: "Kernel received your ping!",
            originalTimestamp: content.timestamp,
            responseTimestamp: Date.now(),
          });
          addKernelLog({
            direction: "out",
            type: "pong",
            data: response.content.data,
          });
          handleMessageRef.current?.(response);
        }, 100); // Small delay to simulate network
      }
    }
  }, [addKernelLog]);

  return (
    <WidgetStoreProvider sendMessage={sendMessage}>
      <AnyWidgetDemoInner
        kernelLog={kernelLog}
        setHandleMessage={(fn) => { handleMessageRef.current = fn; }}
      />
    </WidgetStoreProvider>
  );
}

function AnyWidgetDemoInner({
  kernelLog,
  setHandleMessage,
}: {
  kernelLog: KernelLogEntry[];
  setHandleMessage: (fn: (msg: JupyterCommMessage) => void) => void;
}) {
  const { handleMessage } = useWidgetStoreRequired();

  // Pass handleMessage to parent so kernel can send responses
  useCallback(() => {
    setHandleMessage(handleMessage);
  }, [handleMessage, setHandleMessage])();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <CounterDemo />
        <ConfettiDemo />
      </div>

      {/* Kernel Log */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-2">Kernel Log</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Messages between widgets and the simulated kernel. The kernel auto-responds to "ping" with "pong".
        </p>
        {kernelLog.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">
            No messages yet. Click "Send to Kernel" in a widget.
          </div>
        ) : (
          <div className="text-xs font-mono bg-muted p-2 rounded max-h-32 overflow-y-auto space-y-1">
            {kernelLog.map((entry, i) => (
              <div
                key={i}
                className={
                  entry.direction === "in"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-green-600 dark:text-green-400"
                }
              >
                <span className="opacity-50">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>{" "}
                {entry.direction === "in" ? "←" : "→"} {entry.type}:{" "}
                {JSON.stringify(entry.data)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnyWidgetDemo;
