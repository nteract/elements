"use client";

/**
 * Demo component for built-in shadcn-backed widgets.
 *
 * Shows IntSlider, FloatSlider, IntProgress, Button, Checkbox, Text, and Textarea
 * widgets with interactive controls.
 */

import { useCallback, useState } from "react";
import { Button } from "@/registry/primitives/button";
import {
  type JupyterCommMessage,
  useWidgetModels,
  useWidgetStoreRequired,
  WidgetStoreProvider,
} from "@/registry/widgets/widget-store-context";
import { WidgetView } from "@/registry/widgets/widget-view";

// Import to register built-in widgets
import "@/registry/widgets/controls";

// === Sample Messages ===

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

// Demo widget configurations
const DEMO_WIDGETS = [
  {
    id: "demo-int-slider",
    name: "IntSliderModel",
    state: {
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      description: "Integer:",
      readout: true,
    },
  },
  {
    id: "demo-float-slider",
    name: "FloatSliderModel",
    state: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Float:",
      readout: true,
      readout_format: ".2f",
    },
  },
  {
    id: "demo-int-progress",
    name: "IntProgressModel",
    state: {
      value: 75,
      min: 0,
      max: 100,
      description: "Progress:",
      bar_style: "info",
    },
  },
  {
    id: "demo-button",
    name: "ButtonModel",
    state: {
      description: "Click me!",
      button_style: "primary",
      tooltip: "This is a button widget",
    },
  },
  {
    id: "demo-checkbox",
    name: "CheckboxModel",
    state: {
      value: false,
      description: "Enable feature",
      indent: true,
    },
  },
  {
    id: "demo-text",
    name: "TextModel",
    state: {
      value: "",
      description: "Name:",
      placeholder: "Enter your name...",
      continuous_update: true,
    },
  },
  {
    id: "demo-textarea",
    name: "TextareaModel",
    state: {
      value: "",
      description: "Comments:",
      placeholder: "Write something...",
      rows: 3,
      continuous_update: false,
    },
  },
];

// Layout widget configurations (separate for clearer demo)
const LAYOUT_WIDGETS = [
  // Extra buttons for layout demos
  {
    id: "layout-btn-1",
    name: "ButtonModel",
    state: { description: "Button 1", button_style: "info" },
  },
  {
    id: "layout-btn-2",
    name: "ButtonModel",
    state: { description: "Button 2", button_style: "success" },
  },
  {
    id: "layout-btn-3",
    name: "ButtonModel",
    state: { description: "Button 3", button_style: "warning" },
  },
  // VBox with buttons
  {
    id: "demo-vbox",
    name: "VBoxModel",
    state: {
      children: [
        "IPY_MODEL_layout-btn-1",
        "IPY_MODEL_layout-btn-2",
        "IPY_MODEL_layout-btn-3",
      ],
      box_style: "info",
    },
  },
  // Extra sliders for HBox
  {
    id: "layout-slider-1",
    name: "IntSliderModel",
    state: { value: 25, min: 0, max: 100, description: "A:" },
  },
  {
    id: "layout-slider-2",
    name: "IntSliderModel",
    state: { value: 75, min: 0, max: 100, description: "B:" },
  },
  // HBox with sliders
  {
    id: "demo-hbox",
    name: "HBoxModel",
    state: {
      children: ["IPY_MODEL_layout-slider-1", "IPY_MODEL_layout-slider-2"],
      box_style: "",
    },
  },
  // GridBox with mixed widgets
  {
    id: "layout-check-1",
    name: "CheckboxModel",
    state: { value: true, description: "Option A" },
  },
  {
    id: "layout-check-2",
    name: "CheckboxModel",
    state: { value: false, description: "Option B" },
  },
  {
    id: "layout-check-3",
    name: "CheckboxModel",
    state: { value: true, description: "Option C" },
  },
  {
    id: "layout-check-4",
    name: "CheckboxModel",
    state: { value: false, description: "Option D" },
  },
  {
    id: "demo-gridbox",
    name: "GridBoxModel",
    state: {
      children: [
        "IPY_MODEL_layout-check-1",
        "IPY_MODEL_layout-check-2",
        "IPY_MODEL_layout-check-3",
        "IPY_MODEL_layout-check-4",
      ],
      box_style: "success",
    },
  },
  // Tab widget
  {
    id: "tab-content-1",
    name: "TextModel",
    state: {
      value: "",
      description: "Tab 1 input:",
      placeholder: "Type here...",
    },
  },
  {
    id: "tab-content-2",
    name: "IntSliderModel",
    state: { value: 50, min: 0, max: 100, description: "Tab 2 slider:" },
  },
  {
    id: "demo-tab",
    name: "TabModel",
    state: {
      children: ["IPY_MODEL_tab-content-1", "IPY_MODEL_tab-content-2"],
      _titles: ["Text Input", "Slider Control"],
      selected_index: 0,
    },
  },
  // Accordion widget
  {
    id: "accordion-content-1",
    name: "TextareaModel",
    state: {
      value: "",
      description: "",
      placeholder: "Panel 1 content...",
      rows: 2,
    },
  },
  {
    id: "accordion-content-2",
    name: "CheckboxModel",
    state: { value: false, description: "Enable in panel 2" },
  },
  {
    id: "demo-accordion",
    name: "AccordionModel",
    state: {
      children: [
        "IPY_MODEL_accordion-content-1",
        "IPY_MODEL_accordion-content-2",
      ],
      _titles: ["Panel One", "Panel Two"],
      selected_index: 0,
    },
  },
];

// Combined list for widget creation
const ALL_WIDGETS = [...DEMO_WIDGETS, ...LAYOUT_WIDGETS];

// === Demo Components ===

function DemoControls() {
  const { handleMessage } = useWidgetStoreRequired();
  const models = useWidgetModels();
  const [log, setLog] = useState<string[]>([]);

  const hasWidgets = models.size > 0;

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-9), msg]);
  };

  const createAllWidgets = () => {
    for (const widget of ALL_WIDGETS) {
      if (!models.has(widget.id)) {
        handleMessage(
          createWidgetMessage(widget.id, widget.name, widget.state),
        );
        addLog(`Created ${widget.name}`);
      }
    }
  };

  const updateProgress = () => {
    const progressModel = models.get("demo-int-progress");
    if (progressModel) {
      const currentValue = (progressModel.state.value as number) || 0;
      const newValue = currentValue >= 100 ? 0 : currentValue + 10;
      handleMessage({
        header: { msg_id: crypto.randomUUID(), msg_type: "comm_msg" },
        content: {
          comm_id: "demo-int-progress",
          data: { method: "update", state: { value: newValue } },
        },
      });
      addLog(`Progress updated to ${newValue}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {!hasWidgets ? (
          <Button onClick={createAllWidgets} variant="default">
            Create All Widgets
          </Button>
        ) : (
          <>
            <Button onClick={updateProgress} variant="secondary">
              Increment Progress
            </Button>
            <Button onClick={createAllWidgets} variant="outline">
              Reset Widgets
            </Button>
          </>
        )}
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

// Layout widget IDs to show (not the child widgets)
const LAYOUT_DISPLAY_WIDGETS = [
  "demo-vbox",
  "demo-hbox",
  "demo-gridbox",
  "demo-tab",
  "demo-accordion",
];

function WidgetDisplay() {
  const models = useWidgetModels();

  if (models.size === 0) {
    return (
      <div className="text-muted-foreground italic text-sm">
        Click "Create All Widgets" to load the demo widgets.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control widgets */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Control Widgets
        </h4>
        <div className="space-y-4">
          {DEMO_WIDGETS.map(
            (widget) =>
              models.has(widget.id) && (
                <div key={widget.id} className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    {widget.name}
                  </div>
                  <WidgetView modelId={widget.id} />
                </div>
              ),
          )}
        </div>
      </div>

      {/* Layout widgets */}
      {LAYOUT_DISPLAY_WIDGETS.some((id) => models.has(id)) && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Layout Widgets
          </h4>
          <div className="space-y-4">
            {LAYOUT_DISPLAY_WIDGETS.map((widgetId) => {
              const model = models.get(widgetId);
              if (!model) return null;
              return (
                <div key={widgetId} className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    {model.modelName}
                  </div>
                  <WidgetView modelId={widgetId} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BuiltinWidgetsDemoContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Controls</h3>
        <DemoControls />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Widgets</h3>
        <WidgetDisplay />
      </div>
    </div>
  );
}

/**
 * Exported demo component with provider wrapper.
 */
export function BuiltinWidgetsDemo() {
  const sendMessage = useCallback((msg: JupyterCommMessage) => {
    console.log("Widget → Kernel:", msg);
  }, []);

  return (
    <WidgetStoreProvider sendMessage={sendMessage}>
      <BuiltinWidgetsDemoContent />
    </WidgetStoreProvider>
  );
}

export default BuiltinWidgetsDemo;
