"use client";

import { createContext, type ReactNode, useContext } from "react";
import {
  type SendMessage,
  type UseWidgetManagerReturn,
  useWidgetManager,
} from "./widget-manager";

/**
 * Context value for the widget provider.
 */
interface WidgetContextValue extends UseWidgetManagerReturn {
  /**
   * Whether the widget manager is ready to use.
   */
  isReady: boolean;
}

const WidgetContext = createContext<WidgetContextValue | null>(null);

/**
 * Props for the WidgetProvider component.
 */
interface WidgetProviderProps {
  /**
   * Children to render within the provider.
   */
  children: ReactNode;
  /**
   * Function to send messages to the kernel.
   */
  sendMessage: SendMessage;
}

/**
 * Provider component for sharing the widget manager across components.
 *
 * Wrap your application or notebook component with this provider to enable
 * widget support. All WidgetOutput components within the provider will use
 * the same manager instance.
 *
 * @example
 * ```tsx
 * function NotebookApp() {
 *   const sendMessage = useCallback((msg: JupyterMessage) => {
 *     fetch("/kernel/message", { method: "POST", body: JSON.stringify(msg) });
 *   }, []);
 *
 *   const { handleMessage } = useWidget();
 *
 *   useEffect(() => {
 *     const unsubscribe = kernelEvents.onMessage(handleMessage);
 *     return unsubscribe;
 *   }, [handleMessage]);
 *
 *   return (
 *     <WidgetProvider sendMessage={sendMessage}>
 *       <OutputArea outputs={outputs} />
 *     </WidgetProvider>
 *   );
 * }
 * ```
 */
export function WidgetProvider({ children, sendMessage }: WidgetProviderProps) {
  const widgetManager = useWidgetManager({ sendMessage });

  const value: WidgetContextValue = {
    ...widgetManager,
    isReady: widgetManager.manager.current !== null,
  };

  return (
    <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>
  );
}

/**
 * Hook to access the widget context.
 *
 * Must be used within a WidgetProvider. If used outside a provider,
 * returns null - components should handle this gracefully.
 *
 * @example
 * ```tsx
 * function WidgetOutput({ modelId }: { modelId: string }) {
 *   const widget = useWidget();
 *
 *   if (!widget) {
 *     return <div>Widget support not configured</div>;
 *   }
 *
 *   const { getModel } = widget;
 *   // ... render widget
 * }
 * ```
 */
export function useWidget(): WidgetContextValue | null {
  return useContext(WidgetContext);
}

/**
 * Hook to require the widget context (throws if not available).
 *
 * Use this when your component absolutely requires widget support.
 */
export function useWidgetRequired(): WidgetContextValue {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error(
      "useWidgetRequired must be used within a WidgetProvider. " +
        "Wrap your application with <WidgetProvider sendMessage={...}>.",
    );
  }
  return context;
}
