"use client";

import { useEffect, useRef, useState } from "react";
import { isDarkMode as detectDarkMode } from "@/lib/dark-mode";
import {
  IsolatedFrame,
  type IsolatedFrameHandle,
  useIsolatedRendererBundle,
} from "@/registry/outputs/isolated";

// Note: Tables without custom styles inherit from frame-html.ts defaults:
// - Uses CSS variables: --bg-secondary, --border-color, --text-primary
// - Automatically responds to theme changes via postMessage
const htmlTableContent = `
<table>
  <thead>
    <tr><th>Model</th><th>Accuracy</th><th>F1 Score</th></tr>
  </thead>
  <tbody>
    <tr><td>Random Forest</td><td>0.94</td><td>0.93</td></tr>
    <tr><td>XGBoost</td><td>0.96</td><td>0.95</td></tr>
    <tr><td>Neural Network</td><td>0.97</td><td>0.96</td></tr>
  </tbody>
</table>
`;

const styledContent = `
<style>
  .card {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 16px;
  }
  .card h3 { margin: 0 0 8px 0; color: var(--text-primary); }
  .card p { margin: 0; color: var(--text-secondary); }
  .badge {
    display: inline-block;
    background: var(--accent-color);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-top: 8px;
  }
</style>
<div class="card">
  <h3>Training Complete</h3>
  <p>Model trained on 10,000 samples with 98% validation accuracy.</p>
  <span class="badge">Success</span>
</div>
`;

const interactiveContent = `
<style>
  button {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px;
  }
  button:hover { opacity: 0.9; }
  #counter {
    font-size: 24px;
    font-weight: bold;
    margin: 16px 0;
    color: var(--text-primary);
  }
</style>
<div id="counter">Count: 0</div>
<button onclick="document.getElementById('counter').textContent = 'Count: ' + (++window.count || (window.count = 1))">
  Increment
</button>
<button onclick="window.count = 0; document.getElementById('counter').textContent = 'Count: 0'">
  Reset
</button>
`;

interface IsolatedFrameDemoProps {
  variant?: "table" | "styled" | "interactive" | "theme";
}

export function IsolatedFrameDemo({
  variant = "table",
}: IsolatedFrameDemoProps) {
  const frameRef = useRef<IsolatedFrameHandle>(null);
  // Detect page theme and track changes
  const [darkMode, setDarkMode] = useState(() => detectDarkMode());
  const [ready, setReady] = useState(false);
  // Load the renderer bundle
  const { rendererCode, rendererCss, isLoading } = useIsolatedRendererBundle();

  // Observe page theme changes (fumadocs adds/removes 'dark' class on html)
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

  const getContent = () => {
    switch (variant) {
      case "table":
        return htmlTableContent;
      case "styled":
        return styledContent;
      case "interactive":
        return interactiveContent;
      case "theme":
        return htmlTableContent;
      default:
        return htmlTableContent;
    }
  };

  return (
    <div className="space-y-4">
      {variant === "theme" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDarkMode(!darkMode);
              frameRef.current?.setTheme(!darkMode);
            }}
            className="rounded bg-gray-200 px-3 py-1.5 text-sm dark:bg-gray-700"
          >
            Toggle: {darkMode ? "Dark" : "Light"}
          </button>
          <span className="text-sm text-muted-foreground">
            Theme syncs to iframe via postMessage
          </span>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border">
        <IsolatedFrame
          ref={frameRef}
          darkMode={darkMode}
          rendererCode={rendererCode}
          rendererCss={rendererCss}
          initialContent={{
            mimeType: "text/html",
            data: getContent(),
          }}
          minHeight={60}
          maxHeight={400}
          onReady={() => setReady(true)}
          onResize={(height) => console.log("Frame height:", height)}
          onLinkClick={(url, newTab) => {
            console.log("Link clicked:", url, newTab);
            window.open(url, newTab ? "_blank" : "_self");
          }}
        />
      </div>
      {(isLoading || !ready) && (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}
    </div>
  );
}
