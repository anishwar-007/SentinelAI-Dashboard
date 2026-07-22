"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { MarketingNav } from "@/components/marketing/nav";
import { ExecutionStatusBadge } from "@/components/executions/status-badge";
import { JsonViewer } from "@/components/shared/json-viewer";
import { TraceExplorer } from "@/components/traces/trace-explorer";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/shared/copy-button";
import { getDemoExecution, getDemoExecutionTrace } from "@/lib/api/demo";
import { formatDateTime, formatLatency } from "@/lib/utils";
import {
  estimateCostUsd,
  extractTokenCount,
  formatCost,
} from "@/lib/span-style";
import { PlatformApiError } from "@/lib/api/client";

export default function SandboxExecutionPage({
  params,
}: {
  params: Promise<{ executionId: string }>;
}) {
  const { executionId } = use(params);
  const execution = useQuery({
    queryKey: ["demo-execution", executionId],
    queryFn: () => getDemoExecution(executionId),
  });
  const trace = useQuery({
    queryKey: ["demo-trace", executionId],
    queryFn: () => getDemoExecutionTrace(executionId),
  });

  const aggregateTokens =
    trace.data?.spans.reduce((sum, span) => {
      const n = extractTokenCount(span.tokens);
      return n != null ? sum + n : sum;
    }, 0) ?? null;
  const hasTokens = Boolean(
    trace.data?.spans.some((s) => extractTokenCount(s.tokens) != null),
  );
  const estimatedCost =
    trace.data?.spans.reduce((sum, span) => {
      const c = estimateCostUsd(span.tokens, span.model);
      return c != null ? sum + c : sum;
    }, 0) ?? null;
  const hasCost = Boolean(
    trace.data?.spans.some((s) => estimateCostUsd(s.tokens, s.model) != null),
  );

  return (
    <>
      <MarketingNav />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-8">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Public sandbox execution
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            Execution inspector
          </h1>
        </div>

        {execution.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : execution.isError ? (
          <ErrorState
            error={execution.error}
            title={
              execution.error instanceof PlatformApiError &&
              execution.error.status === 404
                ? "Sandbox execution not found"
                : "Failed to load sandbox execution"
            }
          />
        ) : execution.data ? (
          <>
            <section className="rounded-md border border-border bg-card/50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <ExecutionStatusBadge
                  status={execution.data.execution_status}
                />
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-[11px] uppercase text-muted-foreground">
                    Execution ID
                  </dt>
                  <dd className="flex items-center gap-1 font-mono text-xs">
                    {execution.data.execution_id}
                    <CopyButton value={execution.data.execution_id} />
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase text-muted-foreground">
                    Status
                  </dt>
                  <dd className="text-sm">{execution.data.execution_status}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase text-muted-foreground">
                    Total Duration
                  </dt>
                  <dd className="font-mono text-xs">
                    {formatLatency(trace.data?.total_latency_ms ?? null)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase text-muted-foreground">
                    Model
                  </dt>
                  <dd className="font-mono text-xs">
                    {execution.data.model_info.provider} /{" "}
                    {execution.data.model_info.model_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase text-muted-foreground">
                    Tokens
                  </dt>
                  <dd className="font-mono text-xs">
                    {hasTokens ? String(aggregateTokens) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase text-muted-foreground">
                    Estimated Cost
                  </dt>
                  <dd className="font-mono text-xs">
                    {hasCost ? formatCost(estimatedCost) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase text-muted-foreground">
                    Started
                  </dt>
                  <dd className="text-sm">
                    {formatDateTime(execution.data.created_at)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Execution Graph
              </h2>
              <TraceExplorer
                trace={trace.data}
                isLoading={trace.isLoading}
                error={trace.error}
              />
            </section>

            <details className="rounded-md border border-border">
              <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground">
                Input / Output
              </summary>
              <div className="space-y-3 border-t border-border p-3">
                <JsonViewer value={execution.data.query} label="Input" />
                <JsonViewer value={execution.data.response} label="Output" />
              </div>
            </details>
          </>
        ) : null}
      </main>
    </>
  );
}
