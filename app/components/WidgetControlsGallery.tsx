"use client";

/**
 * Gallery component showing all built-in widget controls.
 * Organized by category with live interactive demos.
 */

import { useCallback, useEffect, useState } from "react";
import {
  type JupyterCommMessage,
  useWidgetModels,
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

// Widget configurations organized by category
const WIDGET_CATEGORIES = {
  sliders: {
    title: "Sliders",
    description: "Numeric input via draggable handle",
    widgets: [
      {
        id: "gallery-int-slider",
        name: "IntSliderModel",
        label: "IntSlider",
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
        id: "gallery-float-slider",
        name: "FloatSliderModel",
        label: "FloatSlider",
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
        id: "gallery-int-range-slider",
        name: "IntRangeSliderModel",
        label: "IntRangeSlider",
        state: {
          value: [25, 75],
          min: 0,
          max: 100,
          step: 1,
          description: "Range:",
          readout: true,
        },
      },
      {
        id: "gallery-float-range-slider",
        name: "FloatRangeSliderModel",
        label: "FloatRangeSlider",
        state: {
          value: [0.2, 0.8],
          min: 0,
          max: 1,
          step: 0.01,
          description: "Range:",
          readout: true,
          readout_format: ".2f",
        },
      },
    ],
  },
  progress: {
    title: "Progress",
    description: "Display progress or loading state",
    widgets: [
      {
        id: "gallery-int-progress",
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
        id: "gallery-float-progress",
        name: "FloatProgressModel",
        label: "FloatProgress",
        state: {
          value: 0.42,
          min: 0,
          max: 1,
          description: "Progress:",
          bar_style: "success",
        },
      },
    ],
  },
  text: {
    title: "Text Input",
    description: "Text and HTML content",
    widgets: [
      {
        id: "gallery-text",
        name: "TextModel",
        label: "Text",
        state: {
          value: "",
          description: "Name:",
          placeholder: "Enter text...",
        },
      },
      {
        id: "gallery-textarea",
        name: "TextareaModel",
        label: "Textarea",
        state: {
          value: "",
          description: "Notes:",
          placeholder: "Enter multiple lines...",
          rows: 3,
        },
      },
      {
        id: "gallery-html",
        name: "HTMLModel",
        label: "HTML",
        state: {
          value: "<strong>Bold</strong> and <em>italic</em> text",
          description: "Output:",
        },
      },
    ],
  },
  boolean: {
    title: "Boolean",
    description: "True/false inputs",
    widgets: [
      {
        id: "gallery-checkbox",
        name: "CheckboxModel",
        label: "Checkbox",
        state: {
          value: true,
          description: "Enable feature",
        },
      },
      {
        id: "gallery-toggle-button",
        name: "ToggleButtonModel",
        label: "ToggleButton",
        state: {
          value: false,
          description: "Toggle me",
          button_style: "info",
        },
      },
    ],
  },
  selection: {
    title: "Selection",
    description: "Choose from options",
    widgets: [
      {
        id: "gallery-dropdown",
        name: "DropdownModel",
        label: "Dropdown",
        state: {
          value: "Option B",
          _options_labels: ["Option A", "Option B", "Option C"],
          description: "Select:",
        },
      },
      {
        id: "gallery-radio",
        name: "RadioButtonsModel",
        label: "RadioButtons",
        state: {
          value: "Choice 1",
          _options_labels: ["Choice 1", "Choice 2", "Choice 3"],
          description: "Pick one:",
        },
      },
      {
        id: "gallery-toggle-buttons",
        name: "ToggleButtonsModel",
        label: "ToggleButtons",
        state: {
          value: "B",
          _options_labels: ["A", "B", "C", "D"],
          description: "Mode:",
          button_style: "",
        },
      },
      {
        id: "gallery-select-multiple",
        name: "SelectMultipleModel",
        label: "SelectMultiple",
        state: {
          value: ["Item 2"],
          _options_labels: ["Item 1", "Item 2", "Item 3", "Item 4"],
          description: "Select many:",
          rows: 4,
        },
      },
    ],
  },
  other: {
    title: "Other Controls",
    description: "Buttons and color picker",
    widgets: [
      {
        id: "gallery-button",
        name: "ButtonModel",
        label: "Button",
        state: {
          description: "Click me!",
          button_style: "primary",
          tooltip: "A clickable button",
        },
      },
      {
        id: "gallery-color-picker",
        name: "ColorPickerModel",
        label: "ColorPicker",
        state: {
          value: "#3b82f6",
          description: "Color:",
          concise: false,
        },
      },
    ],
  },
  containers: {
    title: "Layout Containers",
    description: "Arrange child widgets",
    widgets: [], // Handled separately due to complexity
  },
};

// Container widgets need child widgets first
const CONTAINER_SETUP = {
  children: [
    {
      id: "container-btn-1",
      name: "ButtonModel",
      state: { description: "One", button_style: "info" },
    },
    {
      id: "container-btn-2",
      name: "ButtonModel",
      state: { description: "Two", button_style: "success" },
    },
    {
      id: "container-btn-3",
      name: "ButtonModel",
      state: { description: "Three", button_style: "warning" },
    },
    {
      id: "container-slider-1",
      name: "IntSliderModel",
      state: { value: 30, min: 0, max: 100, description: "A:" },
    },
    {
      id: "container-slider-2",
      name: "IntSliderModel",
      state: { value: 70, min: 0, max: 100, description: "B:" },
    },
    {
      id: "container-check-1",
      name: "CheckboxModel",
      state: { value: true, description: "Opt 1" },
    },
    {
      id: "container-check-2",
      name: "CheckboxModel",
      state: { value: false, description: "Opt 2" },
    },
    {
      id: "container-check-3",
      name: "CheckboxModel",
      state: { value: true, description: "Opt 3" },
    },
    {
      id: "container-check-4",
      name: "CheckboxModel",
      state: { value: false, description: "Opt 4" },
    },
    {
      id: "container-text-1",
      name: "TextModel",
      state: { value: "", description: "", placeholder: "Tab 1 content..." },
    },
    {
      id: "container-text-2",
      name: "TextareaModel",
      state: {
        value: "",
        description: "",
        placeholder: "Tab 2 content...",
        rows: 2,
      },
    },
    {
      id: "container-acc-1",
      name: "TextModel",
      state: { value: "", description: "", placeholder: "Panel 1..." },
    },
    {
      id: "container-acc-2",
      name: "CheckboxModel",
      state: { value: false, description: "Panel 2 option" },
    },
  ],
  containers: [
    {
      id: "gallery-vbox",
      name: "VBoxModel",
      label: "VBox",
      state: {
        children: [
          "IPY_MODEL_container-btn-1",
          "IPY_MODEL_container-btn-2",
          "IPY_MODEL_container-btn-3",
        ],
      },
    },
    {
      id: "gallery-hbox",
      name: "HBoxModel",
      label: "HBox",
      state: {
        children: [
          "IPY_MODEL_container-slider-1",
          "IPY_MODEL_container-slider-2",
        ],
      },
    },
    {
      id: "gallery-gridbox",
      name: "GridBoxModel",
      label: "GridBox",
      state: {
        children: [
          "IPY_MODEL_container-check-1",
          "IPY_MODEL_container-check-2",
          "IPY_MODEL_container-check-3",
          "IPY_MODEL_container-check-4",
        ],
      },
    },
    {
      id: "gallery-tab",
      name: "TabModel",
      label: "Tab",
      state: {
        children: ["IPY_MODEL_container-text-1", "IPY_MODEL_container-text-2"],
        _titles: ["First Tab", "Second Tab"],
        selected_index: 0,
      },
    },
    {
      id: "gallery-accordion",
      name: "AccordionModel",
      label: "Accordion",
      state: {
        children: ["IPY_MODEL_container-acc-1", "IPY_MODEL_container-acc-2"],
        _titles: ["Expandable Panel 1", "Expandable Panel 2"],
        selected_index: 0,
      },
    },
  ],
};

function GalleryContent() {
  const { handleMessage } = useWidgetStoreRequired();
  const models = useWidgetModels();
  const [initialized, setInitialized] = useState(false);

  // Create all widgets on mount
  useEffect(() => {
    if (initialized) return;

    // Create regular widgets
    for (const category of Object.values(WIDGET_CATEGORIES)) {
      for (const widget of category.widgets) {
        handleMessage(
          createWidgetMessage(widget.id, widget.name, widget.state),
        );
      }
    }

    // Create container children first
    for (const child of CONTAINER_SETUP.children) {
      handleMessage(createWidgetMessage(child.id, child.name, child.state));
    }

    // Then create containers
    for (const container of CONTAINER_SETUP.containers) {
      handleMessage(
        createWidgetMessage(container.id, container.name, container.state),
      );
    }

    setInitialized(true);
  }, [handleMessage, initialized]);

  if (!initialized || models.size === 0) {
    return (
      <div className="text-muted-foreground text-sm">Loading widgets...</div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Regular widget categories */}
      {Object.entries(WIDGET_CATEGORIES).map(([key, category]) => {
        if (key === "containers") return null;
        return (
          <section key={key}>
            <h3 className="text-lg font-semibold mb-1">{category.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {category.description}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {category.widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="border rounded-lg p-4 bg-background"
                >
                  <div className="text-xs font-mono text-muted-foreground mb-3">
                    {widget.label}
                  </div>
                  <WidgetView modelId={widget.id} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Container widgets */}
      <section>
        <h3 className="text-lg font-semibold mb-1">Layout Containers</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Arrange child widgets in rows, columns, grids, tabs, or accordions
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {CONTAINER_SETUP.containers.map((container) => (
            <div
              key={container.id}
              className="border rounded-lg p-4 bg-background"
            >
              <div className="text-xs font-mono text-muted-foreground mb-3">
                {container.label}
              </div>
              <WidgetView modelId={container.id} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function WidgetControlsGallery() {
  const sendMessage = useCallback((msg: JupyterCommMessage) => {
    console.log("Widget message:", msg);
  }, []);

  return (
    <WidgetStoreProvider sendMessage={sendMessage}>
      <GalleryContent />
    </WidgetStoreProvider>
  );
}

export default WidgetControlsGallery;
