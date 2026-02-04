"use client";

/**
 * React context and hooks for the widget model store.
 *
 * Provides:
 * - WidgetStoreProvider: Wrap your app to enable widget support
 * - useWidgetStore: Access the store context (nullable)
 * - useWidgetModels: Subscribe to all models
 * - useWidgetModel: Subscribe to a single model
 * - useWidgetModelValue: Subscribe to a single key (finest granularity)
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  createWidgetStore,
  resolveModelRef,
  type WidgetModel,
  type WidgetStore,
} from "./widget-store";

// === Jupyter Message Types ===

export interface JupyterMessageHeader {
  msg_id: string;
  msg_type: string;
  username?: string;
  session?: string;
  date?: string;
  version?: string;
}

export interface JupyterCommMessage {
  header: JupyterMessageHeader;
  parent_header?: JupyterMessageHeader;
  metadata?: Record<string, unknown>;
  content: {
    comm_id?: string;
    target_name?: string;
    data?: {
      state?: Record<string, unknown>;
      method?: string;
      buffer_paths?: string[][];
    };
  };
  buffers?: ArrayBuffer[];
  channel?: string | null;
}

/**
 * Function type for sending messages back to the kernel.
 */
export type SendMessage = (msg: JupyterCommMessage) => void;

// === Context Types ===

interface WidgetStoreContextValue {
  store: WidgetStore;
  handleMessage: (msg: JupyterCommMessage) => void;
  sendMessage: SendMessage;
}

// === Context ===

const WidgetStoreContext = createContext<WidgetStoreContextValue | null>(null);

// === Provider ===

interface WidgetStoreProviderProps {
  children: ReactNode;
  /** Function to send messages back to the kernel (for widget interactions) */
  sendMessage?: SendMessage;
}

/**
 * Provider component for the widget store.
 *
 * Wrap your app (or the part that needs widgets) with this provider.
 * Pass a sendMessage function to enable widget interactions back to the kernel.
 */
export function WidgetStoreProvider({
  children,
  sendMessage = () => {},
}: WidgetStoreProviderProps) {
  // Create store once and keep it stable across renders
  const storeRef = useRef<WidgetStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createWidgetStore();
  }
  const store = storeRef.current;

  /**
   * Handle incoming Jupyter comm messages.
   * Routes comm_open, comm_msg, and comm_close to appropriate store methods.
   */
  const handleMessage = useCallback(
    (msg: JupyterCommMessage) => {
      const msgType = msg.header.msg_type;
      const commId = msg.content.comm_id;

      if (!commId) return;

      switch (msgType) {
        case "comm_open": {
          const state = msg.content.data?.state || {};
          const buffers = msg.buffers || [];
          store.createModel(commId, state, buffers);
          break;
        }
        case "comm_msg": {
          const data = msg.content.data;
          if (data?.method === "update" && data.state) {
            store.updateModel(commId, data.state, msg.buffers);
          }
          // Note: Other methods like "custom" could be handled here
          break;
        }
        case "comm_close": {
          store.deleteModel(commId);
          break;
        }
      }
    },
    [store]
  );

  const value = useMemo(
    () => ({ store, handleMessage, sendMessage }),
    [store, handleMessage, sendMessage]
  );

  return (
    <WidgetStoreContext.Provider value={value}>
      {children}
    </WidgetStoreContext.Provider>
  );
}

// === Hooks ===

/**
 * Access the widget store context.
 * Returns null if used outside of WidgetStoreProvider.
 */
export function useWidgetStore(): WidgetStoreContextValue | null {
  return useContext(WidgetStoreContext);
}

/**
 * Access the widget store context, throwing if not available.
 * Use this when you know you're inside a WidgetStoreProvider.
 */
export function useWidgetStoreRequired(): WidgetStoreContextValue {
  const ctx = useContext(WidgetStoreContext);
  if (!ctx) {
    throw new Error(
      "useWidgetStoreRequired must be used within WidgetStoreProvider"
    );
  }
  return ctx;
}

/**
 * Subscribe to all widget models.
 * Re-renders when any model is added, updated, or removed.
 */
export function useWidgetModels(): Map<string, WidgetModel> {
  const { store } = useWidgetStoreRequired();

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot // SSR snapshot (same as client)
  );
}

/**
 * Subscribe to a specific widget model.
 * Re-renders when that model's state changes.
 */
export function useWidgetModel(modelId: string): WidgetModel | undefined {
  const { store } = useWidgetStoreRequired();

  const subscribe = useCallback(
    (callback: () => void) => store.subscribe(callback),
    [store]
  );

  const getSnapshot = useCallback(
    () => store.getModel(modelId),
    [store, modelId]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Subscribe to a specific key in a widget model's state.
 * This is the finest granularity - only re-renders when that specific key changes.
 *
 * @example
 * const value = useWidgetModelValue<number>(modelId, 'value');
 * const description = useWidgetModelValue<string>(modelId, 'description');
 */
export function useWidgetModelValue<T = unknown>(
  modelId: string,
  key: string
): T | undefined {
  const { store } = useWidgetStoreRequired();

  const subscribe = useCallback(
    (callback: () => void) => store.subscribeToKey(modelId, key, callback),
    [store, modelId, key]
  );

  const getSnapshot = useCallback(
    () => store.getModel(modelId)?.state[key] as T | undefined,
    [store, modelId, key]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Get a value from a widget model, resolving IPY_MODEL_ references.
 * If the value is an IPY_MODEL_<id> reference, returns the referenced model.
 *
 * @example
 * // If state.layout is "IPY_MODEL_abc123", this returns the LayoutModel
 * const layout = useResolvedModelValue(modelId, 'layout');
 */
export function useResolvedModelValue<T = unknown>(
  modelId: string,
  key: string
): T | WidgetModel | undefined {
  const { store } = useWidgetStoreRequired();
  const value = useWidgetModelValue(modelId, key);

  // Resolve IPY_MODEL_ reference if applicable
  const resolved = resolveModelRef(value, (id) => store.getModel(id));

  return resolved as T | WidgetModel | undefined;
}

// Re-export types and utilities from widget-store
export { resolveModelRef, isModelRef, parseModelRef } from "./widget-store";
export type { WidgetModel, WidgetStore } from "./widget-store";
