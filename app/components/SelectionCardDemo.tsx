"use client";

import { useState } from "react";
import {
  CondaIcon,
  DenoIcon,
  PythonIcon,
  UvIcon,
} from "@/registry/icons/runtime-icons";
import {
  BRAND_COLORS,
  PageDots,
  SelectionCard,
} from "@/registry/ui/selection-card";

type Runtime = "python" | "deno" | null;
type PythonEnv = "uv" | "conda" | null;

export function SelectionCardDemo() {
  const [runtime, setRuntime] = useState<Runtime>(null);
  const [pythonEnv, setPythonEnv] = useState<PythonEnv>(null);
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-6">
      {page === 1 && (
        <>
          <p className="text-sm text-muted-foreground text-center">
            Choose your preferred runtime
          </p>
          <div className="flex items-center justify-center gap-6">
            <SelectionCard
              selected={runtime === "python"}
              onClick={() => setRuntime("python")}
              icon={PythonIcon}
              title="Python"
              description="Scientific computing & data science"
              colorClass={BRAND_COLORS.python}
            />
            <SelectionCard
              selected={runtime === "deno"}
              onClick={() => setRuntime("deno")}
              icon={DenoIcon}
              title="Deno"
              description="TypeScript/JS notebooks"
              colorClass={BRAND_COLORS.deno}
            />
          </div>
        </>
      )}

      {page === 2 && (
        <>
          <p className="text-sm text-muted-foreground text-center">
            Choose your package manager
          </p>
          <div className="flex items-center justify-center gap-6">
            <SelectionCard
              selected={pythonEnv === "uv"}
              onClick={() => setPythonEnv("uv")}
              icon={UvIcon}
              title="UV"
              description="PyPI & pip-compatible"
              colorClass={BRAND_COLORS.uv}
            />
            <SelectionCard
              selected={pythonEnv === "conda"}
              onClick={() => setPythonEnv("conda")}
              icon={CondaIcon}
              title="Conda"
              description="Scientific stack & private channels"
              colorClass={BRAND_COLORS.conda}
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-center gap-4">
        {page === 2 && (
          <button
            type="button"
            onClick={() => setPage(1)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
        )}
        <PageDots current={page} total={2} />
        {page === 1 && runtime && (
          <button
            type="button"
            onClick={() => setPage(2)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export function PageDotsDemo() {
  const [current, setCurrent] = useState(1);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => setCurrent((p) => Math.max(1, p - 1))}
        className="text-sm px-2 py-1 rounded border"
      >
        Prev
      </button>
      <PageDots current={current} total={4} />
      <button
        type="button"
        onClick={() => setCurrent((p) => Math.min(4, p + 1))}
        className="text-sm px-2 py-1 rounded border"
      >
        Next
      </button>
    </div>
  );
}
