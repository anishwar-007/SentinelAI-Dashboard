"use client";

import { useState } from "react";
import { TraceGraph } from "@/components/traces/trace-graph";
import { TraceWaterfall } from "@/components/traces/trace-waterfall";
import { SpanInspector } from "@/components/traces/span-inspector";
import { JsonViewer } from "@/components/shared/json-viewer";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PlatformApiError } from "@/lib/api/client";
import type { ExecutionTraceView, SpanView } from "@/types/trace";

type Tab = "graph" | "waterfall" | "raw";

export function TraceExplorer({
  trace,
  isLoading,
  error,
}: {
  trace: ExecutionTraceView | undefined;
  isLoading?: boolean;
  error?: unknown;
}) {
  const [tab, setTab] = useState<Tab>("graph");
  const [selected, setSelected] = useState<SpanView | null>(null);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  if (error) {
    const notFound =
      error instanceof PlatformApiError && error.status === 404;
    return (
      <ErrorState
        error={error}
        title={notFound ? "Trace not found" : "Failed to load trace"}
      />
    );
  }

  if (!trace) {
    return <EmptyState title="No trace exists for this execution" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 border-b border-border">
        {(
          [
            ["graph", "Graph"],
            ["waterfall", "Waterfall"],
            ["raw", "Raw"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              "px-3 py-1.5 text-xs font-medium",
              tab === id
                ? "border-b-2 border-sky-500 text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "graph" ? (
        <TraceGraph
          spans={trace.spans}
          selectedId={selected?.span_id}
          onSelect={setSelected}
        />
      ) : null}
      {tab === "waterfall" ? (
        <TraceWaterfall
          trace={trace}
          selectedId={selected?.span_id}
          onSelect={setSelected}
        />
      ) : null}
      {tab === "raw" ? (
        <JsonViewer value={trace} label="ExecutionTraceView" />
      ) : null}

      <SpanInspector
        span={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
