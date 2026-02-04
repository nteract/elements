/**
 * Built-in widget components for @jupyter-widgets/controls.
 *
 * This module registers all built-in widget components with the widget registry.
 * Import this module to enable rendering of standard ipywidgets.
 */

import { registerWidget } from "../widget-registry";

// Import widget components
import { IntSlider } from "./int-slider";
import { FloatSlider } from "./float-slider";
import { IntProgress } from "./int-progress";
import { FloatProgress } from "./float-progress";
import { ButtonWidget } from "./button-widget";
import { CheckboxWidget } from "./checkbox-widget";
import { TextWidget } from "./text-widget";
import { TextareaWidget } from "./textarea-widget";

// Register all widgets with their model names
registerWidget("IntSliderModel", IntSlider);
registerWidget("FloatSliderModel", FloatSlider);
registerWidget("IntProgressModel", IntProgress);
registerWidget("FloatProgressModel", FloatProgress);
registerWidget("ButtonModel", ButtonWidget);
registerWidget("CheckboxModel", CheckboxWidget);
registerWidget("TextModel", TextWidget);
registerWidget("TextareaModel", TextareaWidget);

// Re-export components for direct use
export { IntSlider } from "./int-slider";
export { FloatSlider } from "./float-slider";
export { IntProgress } from "./int-progress";
export { FloatProgress } from "./float-progress";
export { ButtonWidget } from "./button-widget";
export { CheckboxWidget } from "./checkbox-widget";
export { TextWidget } from "./text-widget";
export { TextareaWidget } from "./textarea-widget";
