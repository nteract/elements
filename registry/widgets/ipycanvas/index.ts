/**
 * ipycanvas widget registration.
 *
 * Registers CanvasModel and CanvasManagerModel with the widget registry.
 * Import this module to enable rendering of ipycanvas widgets.
 */

import { registerWidget } from "../widget-registry";
import { CanvasManagerWidget, CanvasWidget } from "./canvas-widget";

registerWidget("CanvasModel", CanvasWidget);
registerWidget("CanvasManagerModel", CanvasManagerWidget);

export { CanvasManagerWidget, CanvasWidget } from "./canvas-widget";
