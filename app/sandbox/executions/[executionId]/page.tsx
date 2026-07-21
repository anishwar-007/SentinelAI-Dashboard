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

  return (
    <>
      <MarketingNav />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Public sandbox execution
          </p>
          <h1 className="text-xl font-semibold">Execution inspector</h1>
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
            <section className="rounded-md border border-border p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <ExecutionStatusBadge
                  status={execution.data.execution_status}
                />
                <span className="text-xs text-muted-foreground">
                  {formatLatency(trace.data?.total_latency_ms ?? null)}
                </span>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
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
                    Started
                  </dt>
                  <dd>{formatDateTime(execution.data.created_at)}</dd>
                </div>
              </dl>
            </section>
            <JsonViewer value={execution.data.query} label="Input" />
            <JsonViewer value={execution.data.response} label="Output" />
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Trace
              </h2>
              <TraceExplorer
                trace={trace.data}
                isLoading={trace.isLoading}
                error={trace.error}
              />
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}
