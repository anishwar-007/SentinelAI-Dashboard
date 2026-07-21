"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TopBar } from "@/components/layout/top-bar";
import { ExecutionsTable } from "@/components/executions/table";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useExecutions } from "@/hooks/use-executions";
import { formatLatency } from "@/lib/utils";

const WINDOW = 100;

export default function OverviewPage() {
  const { data, isLoading, isError, error } = useExecutions({
    limit: WINDOW,
    offset: 0,
  });

  const items = data?.items ?? [];
  const recent = items.slice(0, 8);
  const completed = items.filter((i) => i.status === "completed").length;
  const failed = items.filter((i) => i.status === "failed").length;
  const latencies = items
    .map((i) => i.latency_ms)
    .filter((v): v is number => typeof v === "number");
  const avgLatency =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : null;

  const chartData = [...items]
    .slice(0, 20)
    .reverse()
    .map((item, idx) => ({
      idx: idx + 1,
      latency: item.latency_ms ?? 0,
      name: item.execution_name ?? item.execution_id.slice(0, 6),
    }));

  return (
    <>
      <TopBar title="Overview" breadcrumb="SentinelAI / Overview" />
      <main className="space-y-6 p-4 md:p-6">
        <p className="text-xs text-muted-foreground">
          Metrics below are derived from the most recent{" "}
          <span className="font-medium text-foreground">{WINDOW}</span>{" "}
          executions returned by the Platform list API — not global analytics.
        </p>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState error={error} title="Unable to load overview data" />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat
                label={`Executions (recent ${items.length})`}
                value={String(items.length)}
              />
              <Stat label="Successful" value={String(completed)} />
              <Stat label="Failed" value={String(failed)} />
              <Stat
                label="Average latency"
                value={formatLatency(avgLatency)}
              />
            </div>

            <section className="rounded-md border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent latencies (same window)
                </h2>
                <Link
                  href="/dashboard/executions"
                  className="text-xs text-sky-400 hover:underline"
                >
                  Open explorer
                </Link>
              </div>
              <div className="h-48">
                {chartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="idx" hide />
                      <YAxis
                        width={40}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          fontSize: 12,
                        }}
                        formatter={(value) => [
                          formatLatency(Number(value)),
                          "latency",
                        ]}
                        labelFormatter={(_, payload) =>
                          String(payload?.[0]?.payload?.name ?? "")
                        }
                      />
                      <Bar dataKey="latency" fill="#38bdf8" radius={2} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recent executions
              </h2>
              <ExecutionsTable
                items={recent}
                emptyTitle="No executions yet"
                emptyDescription="Run a query against the Platform, then refresh."
              />
            </section>
          </>
        )}
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card/40 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
