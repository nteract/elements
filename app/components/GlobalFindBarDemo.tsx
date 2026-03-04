"use client";

import { useState } from "react";
import { GlobalFindBar } from "@/registry/cell/GlobalFindBar";

export function GlobalFindBarDemo() {
  const [query, setQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);

  // Simulate finding matches
  const matchCount = query.length > 0 ? Math.min(query.length * 2, 15) : 0;

  const handleNext = () => {
    if (matchCount > 0) {
      setCurrentMatch((prev) => (prev + 1) % matchCount);
    }
  };

  const handlePrev = () => {
    if (matchCount > 0) {
      setCurrentMatch((prev) => (prev - 1 + matchCount) % matchCount);
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <GlobalFindBar
        query={query}
        matchCount={matchCount}
        currentMatchIndex={currentMatch}
        onQueryChange={setQuery}
        onNextMatch={handleNext}
        onPrevMatch={handlePrev}
        onClose={() => setQuery("")}
      />
    </div>
  );
}
