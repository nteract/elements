"use client";

import { HTMLManager } from "@jupyter-widgets/html-manager";
import { useCallback, useEffect, useRef } from "react";

/**
 * Minimal Jupyter message header structure for widget comm messages.
 */
export interface JupyterMessageHeader {
  msg_id: string;
  msg_type: string;
  username?: string;
  session?: string;
  date?: string;
  version?: string;
}

/**
 * Jupyter message structure for comm operations.
 */
export interface JupyterMessage {
  header: JupyterMessageHeader;
  parent_header?: JupyterMessageHeader;
  metadata?: Record<string, unknown>;
  content: {
    comm_id?: string;
    target_name?: string;
    data?: Record<string, unknown>;
    [key: string]: unknown;
  };
  channel?: string;
  buffers?: ArrayBuffer[];
}

/**
 * Function type for sending messages to the kernel.
 */
export type SendMessage = (msg: JupyterMessage) => void;

/**
 * Comm class that implements the Jupyter comm interface.
 * This bridges the widget manager with the kernel communication layer.
 */
export class Comm {
  comm_id: string;
  target_name: string;
  private sendMessage: SendMessage;
  private _onMsg: ((msg: JupyterMessage) => void) | null = null;
  private _onClose: ((msg: JupyterMessage) => void) | null = null;

  constructor(commId: string, targetName: string, sendMessage: SendMessage) {
    this.comm_id = commId;
    this.target_name = targetName;
    this.sendMessage = sendMessage;
  }

  /**
   * Send data to the kernel.
   */
  send(
    data: Record<string, unknown>,
    _callbacks?: unknown,
    metadata?: Record<string, unknown>,
    buffers?: ArrayBuffer[],
  ): string {
    const msgId = crypto.randomUUID();
    const msg: JupyterMessage = {
      header: {
        msg_id: msgId,
        msg_type: "comm_msg",
      },
      content: {
        comm_id: this.comm_id,
        data,
      },
      metadata: metadata || {},
      buffers: buffers || [],
    };
    this.sendMessage(msg);
    return msgId;
  }

  /**
   * Close the comm.
   */
  close(
    data?: Record<string, unknown>,
    _callbacks?: unknown,
    metadata?: Record<string, unknown>,
    buffers?: ArrayBuffer[],
  ): string {
    const msgId = crypto.randomUUID();
    const msg: JupyterMessage = {
      header: {
        msg_id: msgId,
        msg_type: "comm_close",
      },
      content: {
        comm_id: this.comm_id,
        data: data || {},
      },
      metadata: metadata || {},
      buffers: buffers || [],
    };
    this.sendMessage(msg);
    return msgId;
  }

  /**
   * Open the comm (for client-initiated comms).
   */
  open(
    data?: Record<string, unknown>,
    _callbacks?: unknown,
    metadata?: Record<string, unknown>,
    buffers?: ArrayBuffer[],
  ): string {
    const msgId = crypto.randomUUID();
    const msg: JupyterMessage = {
      header: {
        msg_id: msgId,
        msg_type: "comm_open",
      },
      content: {
        comm_id: this.comm_id,
        target_name: this.target_name,
        data: data || {},
      },
      metadata: metadata || {},
      buffers: buffers || [],
    };
    this.sendMessage(msg);
    return msgId;
  }

  /**
   * Set the message handler callback.
   */
  set on_msg(callback: ((msg: JupyterMessage) => void) | null) {
    this._onMsg = callback;
  }

  get on_msg(): ((msg: JupyterMessage) => void) | null {
    return this._onMsg;
  }

  /**
   * Set the close handler callback.
   */
  set on_close(callback: ((msg: JupyterMessage) => void) | null) {
    this._onClose = callback;
  }

  get on_close(): ((msg: JupyterMessage) => void) | null {
    return this._onClose;
  }

  /**
   * Handle an incoming message from the kernel.
   */
  handle_msg(msg: JupyterMessage): void {
    if (this._onMsg) {
      this._onMsg(msg);
    }
  }

  /**
   * Handle a close message from the kernel.
   */
  handle_close(msg: JupyterMessage): void {
    if (this._onClose) {
      this._onClose(msg);
    }
  }
}

/**
 * Map to track comms by their ID.
 */
type CommMap = Map<string, Comm>;

/**
 * Hook options for the widget manager.
 */
export interface UseWidgetManagerOptions {
  /**
   * Function to send messages to the kernel.
   * This is how the widget manager communicates back to the kernel.
   */
  sendMessage: SendMessage;
}

/**
 * Return type for the useWidgetManager hook.
 */
export interface UseWidgetManagerReturn {
  /**
   * Handle incoming Jupyter messages (comm_open, comm_msg, comm_close).
   * Call this with messages from your kernel connection.
   */
  handleMessage: (msg: JupyterMessage) => void;
  /**
   * Reference to the HTMLManager instance.
   */
  manager: React.RefObject<HTMLManager | null>;
  /**
   * Get a widget model by its model_id.
   */
  getModel: (modelId: string) => Promise<unknown>;
}

/**
 * Hook for managing Jupyter widgets using the HTMLManager.
 *
 * This hook creates and manages an HTMLManager instance and handles
 * the comm protocol for widget communication. Consumers provide their
 * own transport via the sendMessage callback.
 *
 * @example
 * ```tsx
 * function NotebookApp() {
 *   // Your transport - could be WebSocket, fetch, Tauri IPC, etc.
 *   const sendMessage = useCallback((msg: JupyterMessage) => {
 *     websocket.send(JSON.stringify(msg));
 *   }, [websocket]);
 *
 *   const { handleMessage, manager } = useWidgetManager({ sendMessage });
 *
 *   useEffect(() => {
 *     const unsubscribe = kernelConnection.onMessage(handleMessage);
 *     return unsubscribe;
 *   }, [handleMessage]);
 *
 *   return <OutputArea outputs={outputs} />;
 * }
 * ```
 */
export function useWidgetManager({
  sendMessage,
}: UseWidgetManagerOptions): UseWidgetManagerReturn {
  const managerRef = useRef<HTMLManager | null>(null);
  const commsRef = useRef<CommMap>(new Map());

  // Initialize the manager on mount
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new HTMLManager();
    }
    return () => {
      // Cleanup: close all comms
      commsRef.current.forEach((comm) => {
        comm.close();
      });
      commsRef.current.clear();
    };
  }, []);

  const handleMessage = useCallback(
    (msg: JupyterMessage) => {
      const manager = managerRef.current;
      if (!manager) return;

      const msgType = msg.header.msg_type;
      const commId = msg.content.comm_id;

      switch (msgType) {
        case "comm_open": {
          if (!commId || !msg.content.target_name) break;

          // Create a new Comm for this widget
          const comm = new Comm(commId, msg.content.target_name, sendMessage);
          commsRef.current.set(commId, comm);

          // Let the manager handle the comm_open
          // The manager expects a comm-like object and the message
          manager.handle_comm_open(comm as never, msg as never);
          break;
        }

        case "comm_msg": {
          if (!commId) break;
          const comm = commsRef.current.get(commId);
          if (comm) {
            comm.handle_msg(msg);
          }
          break;
        }

        case "comm_close": {
          if (!commId) break;
          const comm = commsRef.current.get(commId);
          if (comm) {
            comm.handle_close(msg);
            commsRef.current.delete(commId);
          }
          break;
        }
      }
    },
    [sendMessage],
  );

  const getModel = useCallback(async (modelId: string): Promise<unknown> => {
    const manager = managerRef.current;
    if (!manager) {
      throw new Error("Widget manager not initialized");
    }
    return manager.get_model(modelId);
  }, []);

  return {
    handleMessage,
    manager: managerRef,
    getModel,
  };
}
