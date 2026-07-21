"use client";

import { ExecutionStatusBadge } from "@/components/executions/status-badge";
import { JsonViewer } from "@/components/shared/json-viewer";
import { CopyButton } from "@/components/shared/copy-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDateTime, formatLatency } from "@/lib/utils";
import type { SpanView } from "@/types/trace";

export function SpanInspector({
  span,
  open,
  onOpenChange,
}: {
  span: SpanView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{span?.name ?? "Span"}</SheetTitle>
        </SheetHeader>
        {span ? (
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="flex items-center gap-2">
              <ExecutionStatusBadge status={span.status} />
              <span className="text-xs text-muted-foreground">
                {formatLatency(span.latency_ms)}
              </span>
            </div>
            <Field label="Span ID" value={span.span_id} copy />
            <Field
              label="Parent Span ID"
              value={span.parent_span_id ?? "—"}
              copy={Boolean(span.parent_span_id)}
            />
            <Field label="Started" value={formatDateTime(span.started_at)} />
            <Field label="Ended" value={formatDateTime(span.ended_at)} />
            <Field label="Model" value={span.model ?? "—"} />
            {span.error ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-2">
                <p className="text-[11px] uppercase text-red-400">Error</p>
                <p className="whitespace-pre-wrap font-mono text-xs text-foreground">
                  {span.error}
                </p>
              </div>
            ) : null}
            <JsonViewer value={span.input} label="Input" />
            <JsonViewer value={span.output} label="Output" />
            <JsonViewer value={span.tokens} label="Tokens" defaultCollapsed />
            <JsonViewer
              value={span.attributes}
              label="Attributes"
              defaultCollapsed
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  value,
  copy,
}: {
  label: string;
  value: string;
  copy?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1">
        <p className="break-all font-mono text-xs text-foreground">{value}</p>
        {copy && value !== "—" ? <CopyButton value={value} /> : null}
      </div>
    </div>
  );
}
