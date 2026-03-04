"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { isDarkMode as detectDarkMode } from "@/lib/dark-mode";
import {
  type IframeToParentMessage,
  IsolatedFrame,
  type IsolatedFrameHandle,
  IsolatedRendererProvider,
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

// Content with repeatable terms for search demonstration
const searchContent = `
<style>
  .report { color: var(--text-primary); line-height: 1.6; }
  .report h2 { margin: 0 0 12px 0; font-size: 18px; }
  .report p { margin: 0 0 12px 0; }
  .report table { width: 100%; margin-top: 16px; }
</style>
<div class="report">
  <h2>Machine Learning Model Comparison</h2>
  <p>
    The <strong>Random Forest</strong> model achieved 94% accuracy on the test dataset.
    This model uses ensemble learning to combine multiple decision trees. The training
    process completed in 45 seconds with default hyperparameters.
  </p>
  <p>
    The <strong>XGBoost</strong> model improved to 96% accuracy with optimized hyperparameters.
    Gradient boosting helped reduce overfitting compared to the Random Forest approach.
    Training time was slightly longer at 62 seconds due to hyperparameter tuning.
  </p>
  <p>
    The <strong>Neural Network</strong> reached 97% accuracy after training for 100 epochs.
    The model architecture includes 3 hidden layers with dropout regularization.
    Total training time was 180 seconds on GPU-accelerated hardware.
  </p>
  <table>
    <thead>
      <tr><th>Model</th><th>Accuracy</th><th>Training Time</th></tr>
    </thead>
    <tbody>
      <tr><td>Random Forest</td><td>94%</td><td>45s</td></tr>
      <tr><td>XGBoost</td><td>96%</td><td>62s</td></tr>
      <tr><td>Neural Network</td><td>97%</td><td>180s</td></tr>
    </tbody>
  </table>
</div>
`;

interface IsolatedFrameDemoProps {
  variant?: "table" | "styled" | "interactive" | "theme" | "search";
}

export function IsolatedFrameDemo({
  variant = "table",
}: IsolatedFrameDemoProps) {
  const frameRef = useRef<IsolatedFrameHandle>(null);
  // Detect page theme and track changes
  const [darkMode, setDarkMode] = useState(() => detectDarkMode());
  const [ready, setReady] = useState(false);

  // Search state (for search variant)
  const [searchQuery, setSearchQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);

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

  // Handle search results from iframe
  const handleMessage = useCallback((msg: IframeToParentMessage) => {
    if (msg.type === "search_results") {
      setMatchCount(msg.payload.count);
      setCurrentMatch(msg.payload.count > 0 ? 0 : -1);
    }
  }, []);

  // Debounced search when query or case sensitivity changes
  useEffect(() => {
    if (variant !== "search") return;
    const timer = setTimeout(() => {
      frameRef.current?.search(searchQuery, caseSensitive);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, caseSensitive, variant]);

  const handlePrevMatch = () => {
    if (matchCount === 0) return;
    const prev = currentMatch > 0 ? currentMatch - 1 : matchCount - 1;
    setCurrentMatch(prev);
    frameRef.current?.searchNavigate(prev);
  };

  const handleNextMatch = () => {
    if (matchCount === 0) return;
    const next = (currentMatch + 1) % matchCount;
    setCurrentMatch(next);
    frameRef.current?.searchNavigate(next);
  };

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
      case "search":
        return searchContent;
      default:
        return htmlTableContent;
    }
  };

  return (
    <IsolatedRendererProvider basePath="/isolated">
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
        {variant === "search" && (
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in content..."
              className="rounded border border-gray-300 bg-background px-3 py-1.5 text-sm dark:border-gray-600"
            />
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded"
              />
              Case sensitive
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMatch}
                disabled={matchCount === 0}
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="w-14 text-center text-sm tabular-nums">
                {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : "0/0"}
              </span>
              <button
                type="button"
                onClick={handleNextMatch}
                disabled={matchCount === 0}
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
        <div className="overflow-hidden rounded-lg border">
          <IsolatedFrame
            ref={frameRef}
            darkMode={darkMode}
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
            onMessage={variant === "search" ? handleMessage : undefined}
          />
        </div>
        {!ready && <p className="text-sm text-muted-foreground">Loading...</p>}
      </div>
    </IsolatedRendererProvider>
  );
}
