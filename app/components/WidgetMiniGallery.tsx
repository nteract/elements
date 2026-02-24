"use client";

/**
 * Mini widget gallery for the Getting Started page.
 * Shows a small selection of widgets to demonstrate capabilities.
 */

import { useCallback, useEffect, useState } from "react";
import {
  type JupyterCommMessage,
  useWidgetStoreRequired,
  WidgetStoreProvider,
} from "@/registry/widgets/widget-store-context";
import { WidgetView } from "@/registry/widgets/widget-view";

// Import to register built-in widgets
import "@/registry/widgets/controls";

function createWidgetMessage(
  commId: string,
  modelName: string,
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
          _model_module: "@jupyter-widgets/controls",
          _view_name: modelName.replace("Model", "View"),
          _view_module: "@jupyter-widgets/controls",
          ...state,
        },
      },
    },
  };
}

const PREVIEW_WIDGETS = [
  {
    id: "mini-int-slider",
    name: "IntSliderModel",
    label: "IntSlider",
    state: {
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      description: "Value:",
      readout: true,
    },
  },
  {
    id: "mini-dropdown",
    name: "DropdownModel",
    label: "Dropdown",
    state: {
      value: "Option B",
      _options_labels: ["Option A", "Option B", "Option C"],
      description: "Select:",
    },
  },
  {
    id: "mini-button",
    name: "ButtonModel",
    label: "Button",
    state: {
      description: "Click me",
      button_style: "primary",
    },
  },
  {
    id: "mini-color-picker",
    name: "ColorPickerModel",
    label: "ColorPicker",
    state: {
      value: "#3b82f6",
      description: "Color:",
      concise: false,
    },
  },
  {
    id: "mini-progress",
    name: "IntProgressModel",
    label: "IntProgress",
    state: {
      value: 65,
      min: 0,
      max: 100,
      description: "Loading:",
      bar_style: "info",
    },
  },
  {
    id: "mini-checkbox",
    name: "CheckboxModel",
    label: "Checkbox",
    state: {
      value: true,
      description: "Enable feature",
    },
  },
];

function MiniGalleryContent() {
  const { handleMessage } = useWidgetStoreRequired();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    for (const widget of PREVIEW_WIDGETS) {
      handleMessage(createWidgetMessage(widget.id, widget.name, widget.state));
    }

    setInitialized(true);
  }, [handleMessage, initialized]);

  if (!initialized) {
    return (
      <div className="text-muted-foreground text-sm">Loading widgets...</div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {PREVIEW_WIDGETS.map((widget) => (
        <div
          key={widget.id}
          className="border rounded-lg p-3 bg-background"
        >
          <div className="text-xs font-mono text-muted-foreground mb-2">
            {widget.label}
          </div>
          <WidgetView modelId={widget.id} />
        </div>
      ))}
    </div>
  );
}

export function WidgetMiniGallery() {
  const sendMessage = useCallback((msg: JupyterCommMessage) => {
    console.log("Widget message:", msg);
  }, []);

  return (
    <div className="my-6">
      <WidgetStoreProvider sendMessage={sendMessage}>
        <MiniGalleryContent />
      </WidgetStoreProvider>
    </div>
  );
}

export default WidgetMiniGallery;
