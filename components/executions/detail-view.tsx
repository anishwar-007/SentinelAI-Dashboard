"use client";

import { useMemo, useState } from "react";
import { ExecutionStatusBadge } from "@/components/executions/status-badge";
import { JsonViewer } from "@/components/shared/json-viewer";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CopyButton } from "@/components/shared/copy-button";
import { TraceTree } from "@/components/traces/trace-tree";
import { TraceWaterfall } from "@/components/traces/trace-waterfall";
import { SpanInspector } from "@/components/traces/span-inspector";
import { Skeleton } from "@/components/ui/skeleton";
import { useExecution } from "@/hooks/use-execution";
import { useExecutionTrace } from "@/hooks/use-execution-trace";
import { PlatformApiError } from "@/lib/api/client";
import { formatDateTime, formatLatency } from "@/lib/utils";
import type { SpanView } from "@/types/trace";
import { VerificationSection } from "@/components/executions/verification-section";
import { AnalysisSection } from "@/components/executions/analysis-section";

export function ExecutionDetailView({ executionId }: { executionId: string }) {
  const execution = useExecution(executionId);
  const trace = useExecutionTrace(executionId);
  const [selected, setSelected] = useState<SpanView | null>(null);

  const snapshot = execution.data;
  const executionName =
    typeof snapshot?.metadata?.execution_name === "string"
      ? snapshot.metadata.execution_name
      : null;

  const prompts = useMemo(
    () => Object.entries(snapshot?.prompt_references ?? {}),
    [snapshot],
  );

  if (execution.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (execution.isError) {
    const notFound =
      execution.error instanceof PlatformApiError &&
      execution.error.status === 404;
    return (
      <ErrorState
        error={execution.error}
        title={notFound ? "Execution not found" : "Failed to load execution"}
      />
    );
  }

  if (!snapshot) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-card/30 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">
            {executionName ?? "Execution"}
          </h2>
          <ExecutionStatusBadge status={snapshot.execution_status} />
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Meta
            label="Execution ID"
            value={snapshot.execution_id}
            mono
            copy
          />
          <Meta
            label="Trace ID"
            value={snapshot.trace_id ?? "—"}
            mono
            copy={Boolean(snapshot.trace_id)}
          />
          <Meta label="Intent" value={snapshot.intent ?? "—"} />
          <Meta
            label="Model"
            value={`${snapshot.model_info.provider} / ${snapshot.model_info.model_name}`}
            mono
          />
          <Meta label="Started" value={formatDateTime(snapshot.created_at)} />
          <Meta
            label="Completed"
            value={formatDateTime(trace.data?.completed_at ?? null)}
          />
          <Meta
            label="Duration"
            value={formatLatency(trace.data?.total_latency_ms ?? null)}
          />
          <Meta label="Repository" value={snapshot.repository_version} />
        </dl>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Input
        </h3>
        <JsonViewer value={snapshot.query} label="query" />
      </section>

      {snapshot.plan ? (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Plan
          </h3>
          <JsonViewer value={snapshot.plan} label="plan" />
        </section>
      ) : null}

      {snapshot.retrieval_result ? (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Retrieval
          </h3>
          <JsonViewer value={snapshot.retrieval_result} label="retrieval_result" />
        </section>
      ) : null}

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Output
        </h3>
        {snapshot.response ? (
          <JsonViewer value={snapshot.response} label="response" />
        ) : (
          <EmptyState title="No output captured" />
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Model information
        </h3>
        <dl className="grid gap-2 rounded-md border border-border p-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(snapshot.model_info).map(([key, value]) =>
            value === null || value === undefined ? null : (
              <div key={key}>
                <dt className="text-[11px] uppercase text-muted-foreground">
                  {key}
                </dt>
                <dd className="font-mono text-xs text-foreground">
                  {String(value)}
                </dd>
              </div>
            ),
          )}
        </dl>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Prompt references
        </h3>
        {prompts.length === 0 ? (
          <EmptyState title="No prompt references" />
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Key</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">Prompt ID</th>
                  <th className="px-3 py-2">Hash</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map(([key, ref]) => (
                  <tr key={key} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs">{key}</td>
                    <td className="px-3 py-2">{ref.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{ref.version}</td>
                    <td className="px-3 py-2 font-mono text-xs">{ref.prompt_id}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                      {ref.hash.slice(0, 12)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <VerificationSection data={snapshot.verification} />
      <AnalysisSection data={snapshot.analysis} />

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Trace
        </h3>
        {trace.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : trace.isError ? (
          <ErrorState
            error={trace.error}
            title={
              trace.error instanceof PlatformApiError &&
              trace.error.status === 404
                ? "Trace not found"
                : "Failed to load trace"
            }
          />
        ) : trace.data ? (
          <>
            <TraceTree
              spans={trace.data.spans}
              selectedId={selected?.span_id}
              onSelect={setSelected}
            />
            <TraceWaterfall
              trace={trace.data}
              selectedId={selected?.span_id}
              onSelect={setSelected}
            />
          </>
        ) : (
          <EmptyState title="No trace exists for this execution" />
        )}
      </section>

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

function Meta({
  label,
  value,
  mono,
  copy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="flex items-center gap-1">
        <span
          className={
            mono
              ? "truncate font-mono text-xs text-foreground"
              : "truncate text-sm text-foreground"
          }
        >
          {value}
        </span>
        {copy && value !== "—" ? <CopyButton value={value} /> : null}
      </dd>
    </div>
  );
}
