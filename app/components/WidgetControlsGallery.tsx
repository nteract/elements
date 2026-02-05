"use client";

/**
 * Gallery component showing all built-in widget controls.
 * Organized by category with live interactive demos.
 */

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
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
      {
        id: "gallery-float-log-slider",
        name: "FloatLogSliderModel",
        label: "FloatLogSlider",
        state: {
          value: 100,
          base: 10,
          min: 0,
          max: 4,
          step: 0.1,
          description: "Log:",
          readout: true,
          readout_format: ".3g",
        },
      },
      {
        id: "gallery-selection-slider",
        name: "SelectionSliderModel",
        label: "SelectionSlider",
        state: {
          index: 1,
          _options_labels: ["Small", "Medium", "Large", "XL"],
          description: "Size:",
          readout: true,
        },
      },
      {
        id: "gallery-selection-range-slider",
        name: "SelectionRangeSliderModel",
        label: "SelectionRangeSlider",
        state: {
          index: [0, 2],
          _options_labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          description: "Days:",
          readout: true,
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
    description: "Text input fields",
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
        id: "gallery-password",
        name: "PasswordModel",
        label: "Password",
        state: {
          value: "",
          description: "Secret:",
          placeholder: "Enter password...",
        },
      },
    ],
  },
  numeric: {
    title: "Numeric Input",
    description: "Number input fields",
    widgets: [
      {
        id: "gallery-int-text",
        name: "IntTextModel",
        label: "IntText",
        state: {
          value: 42,
          description: "Count:",
          step: 1,
        },
      },
      {
        id: "gallery-float-text",
        name: "FloatTextModel",
        label: "FloatText",
        state: {
          value: 3.14,
          description: "Value:",
          step: 0.1,
        },
      },
      {
        id: "gallery-bounded-int-text",
        name: "BoundedIntTextModel",
        label: "BoundedIntText",
        state: {
          value: 50,
          min: 0,
          max: 100,
          step: 5,
          description: "Bounded:",
        },
      },
      {
        id: "gallery-bounded-float-text",
        name: "BoundedFloatTextModel",
        label: "BoundedFloatText",
        state: {
          value: 0.5,
          min: 0,
          max: 1,
          step: 0.05,
          description: "Ratio:",
        },
      },
    ],
  },
  display: {
    title: "Display",
    description: "Output and display widgets",
    widgets: [
      {
        id: "gallery-label",
        name: "LabelModel",
        label: "Label",
        state: {
          value: "Plain text display",
          description: "Status:",
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
      {
        id: "gallery-image",
        name: "ImageModel",
        label: "Image",
        state: {
          // Small 2x2 red PNG image (base64)
          value:
            "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAADklEQVQIW2P4z8DwHwAFAAH/q842AAAAAElFTkSuQmCC",
          format: "png",
          width: "64px",
          height: "64px",
          description: "Preview:",
        },
      },
      {
        id: "gallery-html-math",
        name: "HTMLMathModel",
        label: "HTMLMath",
        state: {
          value: "Euler's identity: $e^{i\\pi} + 1 = 0$",
          description: "Math:",
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
        id: "gallery-select",
        name: "SelectModel",
        label: "Select",
        state: {
          index: 1,
          _options_labels: ["First", "Second", "Third", "Fourth"],
          description: "Pick one:",
          rows: 4,
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
          index: [1],
          _options_labels: ["Item 1", "Item 2", "Item 3", "Item 4"],
          description: "Select many:",
          rows: 4,
        },
      },
      {
        id: "gallery-combobox",
        name: "ComboboxModel",
        label: "Combobox",
        state: {
          value: "",
          options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
          description: "Fruit:",
          placeholder: "Type or select...",
        },
      },
    ],
  },
  other: {
    title: "Other Controls",
    description: "Buttons, color picker, and validation",
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
      {
        id: "gallery-valid",
        name: "ValidModel",
        label: "Valid",
        state: {
          value: true,
          description: "Status:",
          readout: "All checks passed",
        },
      },
      {
        id: "gallery-invalid",
        name: "ValidModel",
        label: "Valid (invalid)",
        state: {
          value: false,
          description: "Status:",
          readout: "Validation failed",
        },
      },
      {
        id: "gallery-play",
        name: "PlayModel",
        label: "Play",
        state: {
          value: 0,
          min: 0,
          max: 10,
          step: 1,
          interval: 500,
          _playing: false,
          repeat: true,
          description: "Frame:",
        },
      },
      {
        id: "gallery-date-picker",
        name: "DatePickerModel",
        label: "DatePicker",
        state: {
          value: null,
          description: "Date:",
        },
      },
      {
        id: "gallery-time-picker",
        name: "TimePickerModel",
        label: "TimePicker",
        state: {
          value: null,
          description: "Time:",
        },
      },
      {
        id: "gallery-file-upload",
        name: "FileUploadModel",
        label: "FileUpload",
        state: {
          value: [],
          description: "Upload",
          accept: ".txt,.csv",
          multiple: true,
          button_style: "primary",
        },
      },
      {
        id: "gallery-tags-input",
        name: "TagsInputModel",
        label: "TagsInput",
        state: {
          value: ["Python", "TypeScript"],
          description: "Tags:",
          placeholder: "Add tag...",
        },
      },
      {
        id: "gallery-colors-input",
        name: "ColorsInputModel",
        label: "ColorsInput",
        state: {
          value: ["#ef4444", "#3b82f6", "#22c55e"],
          description: "Colors:",
        },
      },
    ],
  },
  containers: {
    title: "Layout Containers",
    description: "Arrange child widgets",
    widgets: [], // Handled separately due to complexity
  },
  gamepad: {
    title: "Gamepad Controller",
    description: "Web Gamepad API integration",
    widgets: [], // Handled separately due to child widgets
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
    // tqdm-like progress bar children (matches actual tqdm output format)
    {
      id: "tqdm-label",
      name: "HTMLModel",
      state: { value: "Downloading model.safetensors:  42%" },
    },
    {
      id: "tqdm-progress",
      name: "FloatProgressModel",
      state: { value: 42, min: 0, max: 100, bar_style: "success" },
    },
    {
      id: "tqdm-stats",
      name: "HTMLModel",
      state: { value: " 1.2G/2.8G [00:19&lt;00:26, 62.1MB/s]" },
    },
    // Controller button children - standard gamepad has up to 16 buttons
    ...Array.from({ length: 16 }, (_, i) => ({
      id: `gamepad-btn-${i}`,
      name: "ControllerButtonModel",
      state: { pressed: false, value: 0 },
    })),
    // Controller axis children - standard gamepad has 4 axes (2 sticks)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `gamepad-axis-${i}`,
      name: "ControllerAxisModel",
      state: { value: 0 },
    })),
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
    {
      id: "gallery-tqdm",
      name: "HBoxModel",
      label: "tqdm-style Progress",
      span: 2, // Full width to show progress bar properly
      state: {
        children: [
          "IPY_MODEL_tqdm-label",
          "IPY_MODEL_tqdm-progress",
          "IPY_MODEL_tqdm-stats",
        ],
      },
    },
  ],
  gamepad: {
    id: "gallery-controller",
    name: "ControllerModel",
    label: "Controller (Gamepad)",
    state: {
      index: 0,
      connected: false, // Starts disconnected - connect a real gamepad!
      name: "",
      mapping: "",
      // Standard gamepad: 16 buttons, 4 axes
      buttons: Array.from(
        { length: 16 },
        (_, i) => `IPY_MODEL_gamepad-btn-${i}`,
      ),
      axes: Array.from({ length: 4 }, (_, i) => `IPY_MODEL_gamepad-axis-${i}`),
      timestamp: 0,
    },
  },
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

    // Create gamepad controller widget
    handleMessage(
      createWidgetMessage(
        CONTAINER_SETUP.gamepad.id,
        CONTAINER_SETUP.gamepad.name,
        CONTAINER_SETUP.gamepad.state,
      ),
    );

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
        if (key === "containers" || key === "gamepad") return null;
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
              className={cn(
                "border rounded-lg p-4 bg-background",
                container.span === 2 && "md:col-span-2",
              )}
            >
              <div className="text-xs font-mono text-muted-foreground mb-3">
                {container.label}
              </div>
              <WidgetView modelId={container.id} />
            </div>
          ))}
        </div>
      </section>

      {/* Gamepad Controller widget */}
      <section>
        <h3 className="text-lg font-semibold mb-1">Gamepad Controller</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Web Gamepad API integration - connect a gamepad to see live input
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4 bg-background md:col-span-2">
            <div className="text-xs font-mono text-muted-foreground mb-3">
              {CONTAINER_SETUP.gamepad.label}
            </div>
            <WidgetView modelId={CONTAINER_SETUP.gamepad.id} />
          </div>
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
