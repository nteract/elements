"use client";

import { useCallback, useEffect, useState } from "react";
import { useWidgetRequired, WidgetProvider } from "@/lib/widget-context";
import type { JupyterMessage } from "@/lib/widget-manager";
import { WidgetOutput } from "@/registry/outputs/widget-output";

/**
 * Real session data captured from a Jupyter kernel running IntProgress widget.
 *
 * This demonstrates the full widget lifecycle:
 * 1. comm_open for LayoutModel (styling)
 * 2. comm_open for ProgressStyleModel (progress bar styling)
 * 3. comm_open for IntProgressModel (the actual widget)
 * 4. display_data with widget view reference
 * 5. comm_msg updates as progress increments from 1 to 10
 */
const RAW_SESSION_MESSAGES = `{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_22","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:18.024498Z","msg_type":"comm_open","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{"version":"2.1.0"},"content":{"comm_id":"a6f0231f219b428cad40fcf5c42d7608","target_name":"jupyter.widget","data":{"buffer_paths":[],"state":{"_model_module":"@jupyter-widgets/base","_model_module_version":"2.0.0","_model_name":"LayoutModel","_view_count":null,"_view_module":"@jupyter-widgets/base","_view_module_version":"2.0.0","_view_name":"LayoutView","align_content":null,"align_items":null,"align_self":null,"border_bottom":null,"border_left":null,"border_right":null,"border_top":null,"bottom":null,"display":null,"flex":null,"flex_flow":null,"grid_area":null,"grid_auto_columns":null,"grid_auto_flow":null,"grid_auto_rows":null,"grid_column":null,"grid_gap":null,"grid_row":null,"grid_template_areas":null,"grid_template_columns":null,"grid_template_rows":null,"height":null,"justify_content":null,"justify_items":null,"left":null,"margin":null,"max_height":null,"max_width":null,"min_height":null,"min_width":null,"object_fit":null,"object_position":null,"order":null,"overflow":null,"padding":null,"right":null,"top":null,"visibility":null,"width":null}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_23","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:18.024696Z","msg_type":"comm_open","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{"version":"2.1.0"},"content":{"comm_id":"7d372ddf69834cfabf6d52701116a7cd","target_name":"jupyter.widget","data":{"buffer_paths":[],"state":{"_model_module":"@jupyter-widgets/controls","_model_module_version":"2.0.0","_model_name":"ProgressStyleModel","_view_count":null,"_view_module":"@jupyter-widgets/base","_view_module_version":"2.0.0","_view_name":"StyleView","bar_color":null,"description_width":""}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_24","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:18.024773Z","msg_type":"comm_open","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{"version":"2.1.0"},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","target_name":"jupyter.widget","data":{"buffer_paths":[],"state":{"_dom_classes":[],"_model_module":"@jupyter-widgets/controls","_model_module_version":"2.0.0","_model_name":"IntProgressModel","_view_count":null,"_view_module":"@jupyter-widgets/controls","_view_module_version":"2.0.0","_view_name":"ProgressView","bar_style":"","description":"Loading:","description_allow_html":false,"layout":"IPY_MODEL_a6f0231f219b428cad40fcf5c42d7608","max":10,"min":0,"orientation":"horizontal","style":"IPY_MODEL_7d372ddf69834cfabf6d52701116a7cd","tabbable":null,"tooltip":null,"value":0}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_25","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:18.026241Z","msg_type":"display_data","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"data":{"text/plain":"IntProgress(value=0, description='Loading:', max=10)","application/vnd.jupyter.widget-view+json":{"model_id":"5d3a9b27b8cd4da880f2442d9d7fc047","version_major":2,"version_minor":0}},"metadata":{},"transient":{}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_26","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:18.331785Z","msg_type":"comm_msg","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","data":{"buffer_paths":[],"method":"update","state":{"value":1}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_27","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:18.637353Z","msg_type":"comm_msg","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","data":{"buffer_paths":[],"method":"update","state":{"value":2}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_28","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:18.940914Z","msg_type":"comm_msg","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","data":{"buffer_paths":[],"method":"update","state":{"value":3}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_29","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:19.245406Z","msg_type":"comm_msg","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","data":{"buffer_paths":[],"method":"update","state":{"value":4}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_30","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:19.550885Z","msg_type":"comm_msg","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","data":{"buffer_paths":[],"method":"update","state":{"value":5}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_31","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:19.854119Z","msg_type":"comm_msg","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","data":{"buffer_paths":[],"method":"update","state":{"value":6}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_32","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:20.157480Z","msg_type":"comm_msg","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","data":{"buffer_paths":[],"method":"update","state":{"value":7}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_33","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:20.461781Z","msg_type":"comm_msg","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","data":{"buffer_paths":[],"method":"update","state":{"value":8}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_34","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:20.766413Z","msg_type":"comm_msg","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","data":{"buffer_paths":[],"method":"update","state":{"value":9}}},"buffers":[],"channel":null}
{"header":{"msg_id":"bb91d722-ab349a6aa6e03291c9217b5c_57748_35","username":"kylekelley","session":"bb91d722-ab349a6aa6e03291c9217b5c","date":"2026-02-04T16:48:21.071081Z","msg_type":"comm_msg","version":"5.4"},"parent_header":{"msg_id":"ce77a19f-deb2fa5117453dd0525a360c_57664_6","username":"kylekelley","session":"ce77a19f-deb2fa5117453dd0525a360c","date":"2026-02-04T16:48:17.989424Z","msg_type":"execute_request","version":"5.4"},"metadata":{},"content":{"comm_id":"5d3a9b27b8cd4da880f2442d9d7fc047","data":{"buffer_paths":[],"method":"update","state":{"value":10}}},"buffers":[],"channel":null}`;

/**
 * Parse the raw session messages into typed JupyterMessages.
 */
function parseSessionMessages(raw: string): JupyterMessage[] {
  return raw
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as JupyterMessage);
}

/**
 * Inner component that uses the widget context to replay messages.
 */
function WidgetReplayDemo() {
  const { handleMessage } = useWidgetRequired();
  const [widgetData, setWidgetData] = useState<{ model_id: string } | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const messages = parseSessionMessages(RAW_SESSION_MESSAGES);

  // Separate initialization messages (comm_open, display_data) from updates (comm_msg)
  const initMessages = messages.filter(
    (m) =>
      m.header.msg_type === "comm_open" || m.header.msg_type === "display_data",
  );
  const updateMessages = messages.filter(
    (m) => m.header.msg_type === "comm_msg",
  );

  const initialize = useCallback(() => {
    // Process all comm_open messages to set up the widget models
    for (const msg of initMessages) {
      if (msg.header.msg_type === "comm_open") {
        handleMessage(msg);
      } else if (msg.header.msg_type === "display_data") {
        // Extract the widget view data from display_data
        const data = msg.content.data as Record<string, unknown>;
        const widgetView = data["application/vnd.jupyter.widget-view+json"] as {
          model_id: string;
        };
        if (widgetView?.model_id) {
          setWidgetData(widgetView);
        }
      }
    }
    setCurrentStep(0);
  }, [handleMessage, initMessages]);

  const playUpdates = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);

    let step = 0;
    const interval = setInterval(() => {
      if (step < updateMessages.length) {
        handleMessage(updateMessages[step]);
        setCurrentStep(step + 1);
        step++;
      } else {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 300); // 300ms between updates, matching original timing

    return () => clearInterval(interval);
  }, [handleMessage, updateMessages, isPlaying]);

  const reset = useCallback(() => {
    setWidgetData(null);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={playUpdates}
          disabled={isPlaying || !widgetData}
          className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
        >
          {isPlaying ? "Playing..." : "Play Progress"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80"
        >
          Reset
        </button>
        <span className="text-xs text-muted-foreground">
          Step: {currentStep}/{updateMessages.length}
        </span>
      </div>

      {widgetData ? (
        <WidgetOutput data={widgetData} />
      ) : (
        <div className="text-sm text-muted-foreground">
          Initializing widget models...
        </div>
      )}
    </div>
  );
}

/**
 * Mock widget view data simulating what comes from a kernel.
 */
const mockWidgetData = {
  model_id: "mock-slider-123",
  version_major: 2,
  version_minor: 0,
};

interface WidgetOutputDemoProps {
  variant?: "no-provider" | "with-provider" | "invalid-data" | "replay";
}

/**
 * Demo component for WidgetOutput showing different states.
 *
 * Variants:
 * - "replay": Replays real captured session data with an IntProgress widget
 * - "no-provider": Shows the "not configured" fallback state
 * - "with-provider": Shows loading state, then error (no real kernel)
 * - "invalid-data": Shows error for invalid widget data
 */
export function WidgetOutputDemo({
  variant = "replay",
}: WidgetOutputDemoProps) {
  // Mock send function that doesn't do anything
  const mockSendMessage = (_msg: JupyterMessage) => {
    // In a real app, this would send to your kernel
  };

  switch (variant) {
    case "replay":
      // Replay real session data
      return (
        <WidgetProvider sendMessage={mockSendMessage}>
          <WidgetReplayDemo />
        </WidgetProvider>
      );

    case "no-provider":
      // Shows the "not configured" fallback state
      return <WidgetOutput data={mockWidgetData} />;

    case "with-provider":
      // Shows loading state, then error (since there's no real kernel)
      return (
        <WidgetProvider sendMessage={mockSendMessage}>
          <WidgetOutput data={mockWidgetData} />
        </WidgetProvider>
      );

    case "invalid-data":
      // Shows error for invalid widget data
      return <WidgetOutput data={{ invalid: "data" }} />;

    default:
      return <WidgetOutput data={mockWidgetData} />;
  }
}

/**
 * Interactive demo showing all widget states.
 */
export function WidgetOutputInteractiveDemo() {
  const [variant, setVariant] = useState<
    "replay" | "no-provider" | "with-provider" | "invalid-data"
  >("replay");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setVariant("replay")}
          className={`rounded px-3 py-1 text-sm ${
            variant === "replay"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Replay Session
        </button>
        <button
          type="button"
          onClick={() => setVariant("no-provider")}
          className={`rounded px-3 py-1 text-sm ${
            variant === "no-provider"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          No Provider
        </button>
        <button
          type="button"
          onClick={() => setVariant("with-provider")}
          className={`rounded px-3 py-1 text-sm ${
            variant === "with-provider"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          With Provider
        </button>
        <button
          type="button"
          onClick={() => setVariant("invalid-data")}
          className={`rounded px-3 py-1 text-sm ${
            variant === "invalid-data"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Invalid Data
        </button>
      </div>
      <div className="rounded-lg border p-4">
        <WidgetOutputDemo variant={variant} />
      </div>
    </div>
  );
}
