"use client";

import { useEffect, useRef, useState } from "react";
import { isDarkMode as detectDarkMode } from "@/lib/dark-mode";
import { CodeMirrorEditor } from "@/registry/editor";
import {
  IsolatedFrame,
  type IsolatedFrameHandle,
  useIsolatedRendererBundle,
} from "@/registry/outputs/isolated";

const DEFAULT_HTML = `<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }
  h1 {
    color: var(--text-primary);
    margin: 0 0 8px 0;
    font-size: 1.25rem;
  }
  p {
    color: var(--text-secondary);
    margin: 0 0 16px 0;
  }
  .counter {
    padding: 8px 16px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  .counter:hover {
    opacity: 0.9;
  }
</style>

<div class="container">
  <h1>Hello from IsolatedFrame</h1>
  <p>Edit the HTML above to see live changes!</p>
  <button class="counter" onclick="this.textContent = 'Clicked ' + (++window.count || (window.count = 1)) + ' times'">
    Click me
  </button>
</div>`;

interface HTMLEditorDemoProps {
  initialCode?: string;
  debounceMs?: number;
}

export function HTMLEditorDemo({
  initialCode = DEFAULT_HTML,
  debounceMs = 300,
}: HTMLEditorDemoProps) {
  const frameRef = useRef<IsolatedFrameHandle>(null);
  const [code, setCode] = useState(initialCode);
  const [darkMode, setDarkMode] = useState(() => detectDarkMode());
  const [ready, setReady] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  // Load the renderer bundle
  const { rendererCode, rendererCss } = useIsolatedRendererBundle();

  // Observe page theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(detectDarkMode());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-mode"],
    });
    return () => observer.disconnect();
  }, []);

  // Debounced render on code change
  useEffect(() => {
    if (!ready) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      frameRef.current?.render({
        mimeType: "text/html",
        data: code,
        replace: true,
      });
    }, debounceMs);

    return () => clearTimeout(debounceRef.current);
  }, [code, ready, debounceMs]);

  return (
    <div className="space-y-4" data-slot="html-editor-demo">
      {/* Editor Section */}
      <div
        className="overflow-hidden rounded-lg border border-border"
        data-slot="html-editor-input"
      >
        <div className="flex items-center border-b border-border bg-muted/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">HTML Editor</span>
        </div>
        <div className="max-h-[300px] overflow-auto">
          <CodeMirrorEditor
            value={code}
            language="html"
            onValueChange={setCode}
            placeholder="Enter HTML..."
            lineWrapping
          />
        </div>
      </div>

      {/* Preview Section */}
      <div
        className="overflow-hidden rounded-lg border border-border"
        data-slot="html-editor-preview"
      >
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">Live Preview</span>
          {!ready && (
            <span className="text-xs text-muted-foreground">Loading...</span>
          )}
        </div>
        <IsolatedFrame
          ref={frameRef}
          darkMode={darkMode}
          rendererCode={rendererCode}
          rendererCss={rendererCss}
          initialContent={{
            mimeType: "text/html",
            data: code,
            replace: true,
          }}
          minHeight={100}
          maxHeight={400}
          onReady={() => setReady(true)}
          onLinkClick={(url, newTab) => {
            window.open(url, newTab ? "_blank" : "_self");
          }}
        />
      </div>
    </div>
  );
}
