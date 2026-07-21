"use client";

import { useMemo } from "react";
import { ExecutionStatusBadge } from "@/components/executions/status-badge";
import { formatLatency, cn } from "@/lib/utils";
import { buildSpanForest, flattenSpanForest } from "@/lib/trace-tree";
import type { SpanView } from "@/types/trace";

export function TraceTree({
  spans,
  selectedId,
  onSelect,
}: {
  spans: SpanView[];
  selectedId?: string | null;
  onSelect: (span: SpanView) => void;
}) {
  const rows = useMemo(
    () => flattenSpanForest(buildSpanForest(spans)),
    [spans],
  );

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-muted/40 text-[11px] uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Span</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Duration</th>
            <th className="px-3 py-2">Model</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((span) => (
            <tr
              key={span.span_id}
              className={cn(
                "cursor-pointer border-t border-border hover:bg-muted/30",
                selectedId === span.span_id && "bg-muted/40",
                span.status === "error" && "bg-red-500/5",
              )}
              onClick={() => onSelect(span)}
            >
              <td className="px-3 py-2">
                <div
                  className="font-medium text-foreground"
                  style={{ paddingLeft: span.depth * 16 }}
                >
                  <span className="mr-1 text-muted-foreground">
                    {span.depth > 0 ? "└" : "•"}
                  </span>
                  {span.name}
                </div>
              </td>
              <td className="px-3 py-2">
                <ExecutionStatusBadge status={span.status} />
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {formatLatency(span.latency_ms)}
              </td>
              <td className="max-w-[160px] truncate px-3 py-2 font-mono text-[11px] text-muted-foreground">
                {span.model ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
