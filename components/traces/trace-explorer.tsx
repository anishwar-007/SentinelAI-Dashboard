"use client";

import { useMemo, useState } from "react";
import { TraceGraph } from "@/components/traces/trace-graph";
import { TraceWaterfall } from "@/components/traces/trace-waterfall";
import { SpanInspector } from "@/components/traces/span-inspector";
import { JsonViewer } from "@/components/shared/json-viewer";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ClientOnly } from "@/components/shared/client-only";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDateTime, formatLatency } from "@/lib/utils";
import { PlatformApiError } from "@/lib/api/client";
import type { ExecutionTraceView, SpanView } from "@/types/trace";

type Tab = "graph" | "waterfall" | "events" | "raw";

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

  const parentName = useMemo(() => {
    if (!selected?.parent_span_id || !trace) return null;
    return (
      trace.spans.find((s) => s.span_id === selected.parent_span_id)?.name ??
      null
    );
  }, [selected, trace]);

  const events = useMemo(() => {
    if (!trace) return [];
    return [...trace.spans]
      .sort(
        (a, b) =>
          new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
      )
      .flatMap((span) => {
        const items = [
          {
            id: `${span.span_id}-start`,
            at: span.started_at,
            label: "started",
            span,
          },
        ];
        if (span.ended_at) {
          items.push({
            id: `${span.span_id}-end`,
            at: span.ended_at,
            label: span.status === "error" ? "failed" : "completed",
            span,
          });
        }
        return items;
      })
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [trace]);

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
            ["events", "Events"],
            ["raw", "Raw"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors duration-150",
              tab === id
                ? "border-b-2 border-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "graph" ? (
        <ClientOnly fallback={<Skeleton className="h-[480px] w-full" />}>
          <TraceGraph
            spans={trace.spans}
            selectedId={selected?.span_id}
            onSelect={setSelected}
          />
        </ClientOnly>
      ) : null}
      {tab === "waterfall" ? (
        <TraceWaterfall
          trace={trace}
          selectedId={selected?.span_id}
          onSelect={setSelected}
        />
      ) : null}
      {tab === "events" ? (
        <div className="rounded-md border border-border">
          <ul className="divide-y divide-border">
            {events.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors duration-150 hover:bg-muted/40",
                    selected?.span_id === ev.span.span_id && "bg-accent-muted/50",
                  )}
                  onClick={() => setSelected(ev.span)}
                >
                  <span className="w-40 shrink-0 font-mono text-[11px] text-muted-foreground">
                    {formatDateTime(ev.at)}
                  </span>
                  <span className="w-20 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {ev.label}
                  </span>
                  <span className="min-w-0 truncate font-mono text-xs text-foreground">
                    {ev.span.name}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground">
                    {formatLatency(ev.span.latency_ms)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {tab === "raw" ? (
        <JsonViewer value={trace} label="ExecutionTraceView" />
      ) : null}

      <SpanInspector
        span={selected}
        parentName={parentName}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
