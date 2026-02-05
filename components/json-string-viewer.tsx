"use client";

import { useState } from "react";
import { JsonOutput } from "@/registry/outputs/json-output";

export function JsonStringViewer() {
  const [input, setInput] = useState(
    '{"name": "nteract", "features": ["ANSI", "Markdown", "JSON"], "nested": {"deep": true}}',
  );
  const [parsed, setParsed] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    try {
      setParsed(JSON.parse(input));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setParsed(null);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full rounded-lg border bg-fd-background p-3 font-mono text-sm"
        rows={3}
      />
      <button
        onClick={handleParse}
        type="button"
        className="rounded-lg bg-fd-primary px-4 py-2 text-sm text-fd-primary-foreground hover:bg-fd-primary/90"
      >
        Parse JSON
      </button>
      {error !== null && <p className="text-sm text-red-500">Error: {error}</p>}
      {parsed !== null && <JsonOutput data={parsed} />}
    </div>
  );
}
