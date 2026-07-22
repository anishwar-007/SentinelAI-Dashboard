"use client";

import { useMemo, useState } from "react";
import { ExecutionStatusBadge } from "@/components/executions/status-badge";
import { JsonViewer } from "@/components/shared/json-viewer";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CopyButton } from "@/components/shared/copy-button";
import { TraceExplorer } from "@/components/traces/trace-explorer";
import { Skeleton } from "@/components/ui/skeleton";
import { useExecution } from "@/hooks/use-execution";
import { useExecutionTrace } from "@/hooks/use-execution-trace";
import { PlatformApiError } from "@/lib/api/client";
import { cn, formatDateTime, formatLatency } from "@/lib/utils";
import {
  estimateCostUsd,
  extractTokenCount,
  formatCost,
} from "@/lib/span-style";
import { VerificationSection } from "@/components/executions/verification-section";
import { AnalysisSection } from "@/components/executions/analysis-section";

type DetailTab = "overview" | "verification" | "raw";

export function ExecutionDetailView({ executionId }: { executionId: string }) {
  const execution = useExecution(executionId);
  const trace = useExecutionTrace(executionId);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");

  const snapshot = execution.data;
  const executionName =
    typeof snapshot?.metadata?.execution_name === "string"
      ? snapshot.metadata.execution_name
      : null;

  const prompts = useMemo(
    () => Object.entries(snapshot?.prompt_references ?? {}),
    [snapshot],
  );

  const aggregateTokens = useMemo(() => {
    if (!trace.data) return null;
    let total = 0;
    let found = false;
    for (const span of trace.data.spans) {
      const n = extractTokenCount(span.tokens);
      if (n != null) {
        total += n;
        found = true;
      }
    }
    return found ? total : null;
  }, [trace.data]);

  const estimatedCost = useMemo(() => {
    if (!trace.data) return null;
    let total = 0;
    let found = false;
    for (const span of trace.data.spans) {
      const c = estimateCostUsd(span.tokens, span.model ?? snapshot?.model_info.model_name);
      if (c != null) {
        total += c;
        found = true;
      }
    }
    return found ? total : null;
  }, [trace.data, snapshot?.model_info.model_name]);

  if (execution.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[480px] w-full" />
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
    <div className="space-y-5">
      {/* Execution Header */}
      <section className="rounded-md border border-border bg-card/50 p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {executionName ?? "Execution"}
          </h2>
          <ExecutionStatusBadge status={snapshot.execution_status} />
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Meta
            label="Execution ID"
            value={snapshot.execution_id}
            mono
            copy
          />
          <Meta
            label="Status"
            value={String(snapshot.execution_status)}
          />
          <Meta
            label="Total Duration"
            value={formatLatency(trace.data?.total_latency_ms ?? null)}
            mono
          />
          <Meta
            label="Model"
            value={`${snapshot.model_info.provider} / ${snapshot.model_info.model_name}`}
            mono
          />
          <Meta
            label="Tokens"
            value={aggregateTokens != null ? String(aggregateTokens) : "—"}
            mono
          />
          <Meta
            label="Estimated Cost"
            value={formatCost(estimatedCost)}
            mono
          />
        </dl>
        <dl className="mt-3 grid gap-3 border-t border-border pt-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Meta
            label="Trace ID"
            value={snapshot.trace_id ?? "—"}
            mono
            copy={Boolean(snapshot.trace_id)}
          />
          <Meta label="Intent" value={snapshot.intent ?? "—"} />
          <Meta label="Started" value={formatDateTime(snapshot.created_at)} />
          <Meta
            label="Completed"
            value={formatDateTime(trace.data?.completed_at ?? null)}
          />
        </dl>
      </section>

      {/* Execution Graph (default) */}
      <section className="space-y-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Execution Graph
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Parent/child span relationships. Select a node to inspect inputs,
            outputs, latency, and errors.
          </p>
        </div>
        <TraceExplorer
          trace={trace.data}
          isLoading={trace.isLoading}
          error={trace.error}
        />
      </section>

      {/* Secondary details */}
      <section className="space-y-3">
        <div className="flex gap-1 border-b border-border">
          {(
            [
              ["overview", "Overview"],
              ["verification", "Verification"],
              ["raw", "Raw"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                detailTab === id
                  ? "border-b-2 border-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setDetailTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {detailTab === "overview" ? (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Input
                </h4>
                <PayloadSummary value={snapshot.query} label="query" />
              </div>
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Output
                </h4>
                {snapshot.response ? (
                  <PayloadSummary value={snapshot.response} label="response" />
                ) : (
                  <EmptyState title="No output captured" />
                )}
              </div>
            </div>

            {snapshot.plan ? (
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Plan
                </h4>
                <PayloadSummary value={snapshot.plan} label="plan" />
              </div>
            ) : null}

            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Model information
              </h4>
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
            </div>

            {prompts.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Prompt references
                </h4>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-muted/40 text-[11px] uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Key</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Version</th>
                        <th className="px-3 py-2">Prompt ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prompts.map(([key, ref]) => (
                        <tr key={key} className="border-t border-border">
                          <td className="px-3 py-2 font-mono text-xs">{key}</td>
                          <td className="px-3 py-2">{ref.name}</td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {ref.version}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {ref.prompt_id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {detailTab === "verification" ? (
          <div className="space-y-4">
            <VerificationSection data={snapshot.verification} />
            <AnalysisSection data={snapshot.analysis} />
          </div>
        ) : null}

        {detailTab === "raw" ? (
          <JsonViewer value={snapshot} label="ExecutionSnapshot" />
        ) : null}
      </section>
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
      <dd className="mt-0.5 flex items-center gap-1">
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

function PayloadSummary({
  value,
  label,
}: {
  value: unknown;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const preview =
    typeof value === "string"
      ? value.length > 160
        ? `${value.slice(0, 160)}…`
        : value
      : (() => {
          try {
            const t = JSON.stringify(value);
            return t.length > 160 ? `${t.slice(0, 160)}…` : t;
          } catch {
            return String(value);
          }
        })();

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate font-mono text-[11px] text-foreground/80">
          {preview}
        </span>
        <span className="shrink-0">{open ? "Collapse" : "Expand"}</span>
      </button>
      {open ? (
        <div className="border-t border-border">
          <JsonViewer value={value} label={label} className="rounded-none border-0" />
        </div>
      ) : null}
    </div>
  );
}
