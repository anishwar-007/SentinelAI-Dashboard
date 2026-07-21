"use client";

import { useMemo } from "react";
import { cn, formatLatency } from "@/lib/utils";
import {
  buildSpanForest,
  flattenSpanForest,
  spanOffsetPercent,
} from "@/lib/trace-tree";
import type { ExecutionTraceView, SpanView } from "@/types/trace";

export function TraceWaterfall({
  trace,
  selectedId,
  onSelect,
}: {
  trace: ExecutionTraceView;
  selectedId?: string | null;
  onSelect: (span: SpanView) => void;
}) {
  const rows = useMemo(
    () => flattenSpanForest(buildSpanForest(trace.spans)),
    [trace.spans],
  );
  const traceStart = new Date(trace.started_at).getTime();
  const totalMs =
    trace.total_latency_ms && trace.total_latency_ms > 0
      ? trace.total_latency_ms
      : Math.max(
          ...rows.map((s) => {
            const end = s.ended_at
              ? new Date(s.ended_at).getTime()
              : new Date(s.started_at).getTime() + (s.latency_ms ?? 0);
            return end - traceStart;
          }),
          1,
        );

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Waterfall</span>
        <span>Total {formatLatency(totalMs)}</span>
      </div>
      <div className="space-y-1.5">
        {rows.map((span) => {
          const { left, width } = spanOffsetPercent(span, traceStart, totalMs);
          const errored = span.status === "error";
          return (
            <button
              type="button"
              key={span.span_id}
              className={cn(
                "grid w-full grid-cols-[160px_1fr_72px] items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-muted/40",
                selectedId === span.span_id && "bg-muted/50",
              )}
              onClick={() => onSelect(span)}
            >
              <span
                className="truncate font-mono text-[11px] text-foreground"
                style={{ paddingLeft: span.depth * 10 }}
                title={span.name}
              >
                {span.name}
              </span>
              <div className="relative h-4 overflow-hidden rounded bg-muted/40">
                <div
                  className={cn(
                    "absolute inset-y-0 rounded",
                    errored ? "bg-red-500/80" : "bg-sky-500/70",
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              </div>
              <span className="text-right font-mono text-[11px] text-muted-foreground">
                {formatLatency(span.latency_ms)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
