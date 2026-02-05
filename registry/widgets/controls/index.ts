/**
 * Built-in widget components for @jupyter-widgets/controls.
 *
 * This module registers all built-in widget components with the widget registry.
 * Import this module to enable rendering of standard ipywidgets.
 */

import { registerWidget } from "../widget-registry";
import { AccordionWidget } from "./accordion-widget";
import { BoundedFloatTextWidget } from "./bounded-float-text-widget";
import { BoundedIntTextWidget } from "./bounded-int-text-widget";
import { BoxWidget } from "./box-widget";
import { ButtonWidget } from "./button-widget";
import { CheckboxWidget } from "./checkbox-widget";
import { ColorPicker } from "./color-picker";
// Selection widgets
import { DropdownWidget } from "./dropdown-widget";
import { FloatProgress } from "./float-progress";
import { FloatRangeSlider } from "./float-range-slider";
import { FloatSlider } from "./float-slider";
import { FloatTextWidget } from "./float-text-widget";
import { GridBoxWidget } from "./gridbox-widget";
import { HBoxWidget } from "./hbox-widget";
import { HTMLWidget } from "./html-widget";
import { ImageWidget } from "./image-widget";
import { IntProgress } from "./int-progress";
import { IntRangeSlider } from "./int-range-slider";
// Import widget components
import { IntSlider } from "./int-slider";
import { IntTextWidget } from "./int-text-widget";
import { LabelWidget } from "./label-widget";
import { PasswordWidget } from "./password-widget";
import { RadioButtonsWidget } from "./radio-buttons-widget";
import { SelectMultipleWidget } from "./select-multiple-widget";
import { SelectWidget } from "./select-widget";
import { TabWidget } from "./tab-widget";
import { TextWidget } from "./text-widget";
import { TextareaWidget } from "./textarea-widget";
import { ToggleButtonWidget } from "./toggle-button-widget";
import { ToggleButtonsWidget } from "./toggle-buttons-widget";
import { ValidWidget } from "./valid-widget";
// Import layout widget components
import { VBoxWidget } from "./vbox-widget";

// Register all widgets with their model names
registerWidget("IntSliderModel", IntSlider);
registerWidget("FloatSliderModel", FloatSlider);
registerWidget("IntRangeSliderModel", IntRangeSlider);
registerWidget("FloatRangeSliderModel", FloatRangeSlider);
registerWidget("IntProgressModel", IntProgress);
registerWidget("FloatProgressModel", FloatProgress);
registerWidget("ButtonModel", ButtonWidget);
registerWidget("CheckboxModel", CheckboxWidget);
registerWidget("TextModel", TextWidget);
registerWidget("TextareaModel", TextareaWidget);
registerWidget("HTMLModel", HTMLWidget);
registerWidget("LabelModel", LabelWidget);
registerWidget("ImageModel", ImageWidget);
registerWidget("ColorPickerModel", ColorPicker);
// Numeric text inputs
registerWidget("IntTextModel", IntTextWidget);
registerWidget("FloatTextModel", FloatTextWidget);
registerWidget("BoundedIntTextModel", BoundedIntTextWidget);
registerWidget("BoundedFloatTextModel", BoundedFloatTextWidget);
registerWidget("PasswordModel", PasswordWidget);
registerWidget("ValidModel", ValidWidget);
// Selection widgets
registerWidget("DropdownModel", DropdownWidget);
registerWidget("RadioButtonsModel", RadioButtonsWidget);
registerWidget("SelectModel", SelectWidget);
registerWidget("SelectMultipleModel", SelectMultipleWidget);
registerWidget("ToggleButtonModel", ToggleButtonWidget);
registerWidget("ToggleButtonsModel", ToggleButtonsWidget);

// Register layout widgets
registerWidget("VBoxModel", VBoxWidget);
registerWidget("HBoxModel", HBoxWidget);
registerWidget("BoxModel", BoxWidget);
registerWidget("GridBoxModel", GridBoxWidget);
registerWidget("AccordionModel", AccordionWidget);
registerWidget("TabModel", TabWidget);

export { AccordionWidget } from "./accordion-widget";
export { BoundedFloatTextWidget } from "./bounded-float-text-widget";
export { BoundedIntTextWidget } from "./bounded-int-text-widget";
export { BoxWidget } from "./box-widget";
export { ButtonWidget } from "./button-widget";
export { CheckboxWidget } from "./checkbox-widget";
export { ColorPicker } from "./color-picker";
// Selection widgets
export { DropdownWidget } from "./dropdown-widget";
export { FloatProgress } from "./float-progress";
export { FloatRangeSlider } from "./float-range-slider";
export { FloatSlider } from "./float-slider";
export { FloatTextWidget } from "./float-text-widget";
export { GridBoxWidget } from "./gridbox-widget";
export { HBoxWidget } from "./hbox-widget";
export { HTMLWidget } from "./html-widget";
export { ImageWidget } from "./image-widget";
export { IntProgress } from "./int-progress";
export { IntRangeSlider } from "./int-range-slider";
// Re-export components for direct use
export { IntSlider } from "./int-slider";
export { IntTextWidget } from "./int-text-widget";
export { LabelWidget } from "./label-widget";
export { PasswordWidget } from "./password-widget";
export { RadioButtonsWidget } from "./radio-buttons-widget";
export { SelectMultipleWidget } from "./select-multiple-widget";
export { SelectWidget } from "./select-widget";
export { TabWidget } from "./tab-widget";
export { TextWidget } from "./text-widget";
export { TextareaWidget } from "./textarea-widget";
export { ToggleButtonWidget } from "./toggle-button-widget";
export { ToggleButtonsWidget } from "./toggle-buttons-widget";
export { ValidWidget } from "./valid-widget";
// Re-export layout widgets
export { VBoxWidget } from "./vbox-widget";
