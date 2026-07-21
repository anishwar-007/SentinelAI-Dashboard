"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { ExecutionFilters } from "@/components/executions/filters";
import { ExecutionsTable } from "@/components/executions/table";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExecutions } from "@/hooks/use-executions";

export default function ExecutionsPage() {
  return (
    <>
      <TopBar title="Executions" breadcrumb="SentinelAI / Executions" />
      <main className="space-y-4 p-4 md:p-6">
        <Suspense fallback={<Skeleton className="h-28 w-full" />}>
          <ExecutionFilters />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <ExecutionsExplorerBody />
        </Suspense>
      </main>
    </>
  );
}

function ExecutionsExplorerBody() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const limit = Number(searchParams.get("limit") ?? "50") || 50;
  const offset = Number(searchParams.get("offset") ?? "0") || 0;
  const params = {
    limit,
    offset,
    status: searchParams.get("status") ?? undefined,
    execution_name: searchParams.get("execution_name") ?? undefined,
    model: searchParams.get("model") ?? undefined,
    from_time: searchParams.get("from_time") ?? undefined,
    to_time: searchParams.get("to_time") ?? undefined,
  };

  const { data, isLoading, isError, error } = useExecutions(params);
  const hasFilters = Boolean(
    params.status ||
      params.execution_name ||
      params.model ||
      params.from_time ||
      params.to_time,
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState error={error} title="Failed to load executions" />;
  }

  const total = data?.total ?? data?.items.length ?? 0;
  const pageEnd = offset + (data?.items.length ?? 0);

  const pushOffset = (next: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("offset", String(Math.max(0, next)));
    nextParams.set("limit", String(limit));
    router.push(`/dashboard/executions?${nextParams.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Showing {data?.items.length ? offset + 1 : 0}–{pageEnd}
          {data?.total != null ? ` of ${data.total}` : ""}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={offset <= 0}
            onClick={() => pushOffset(offset - limit)}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!data?.has_more}
            onClick={() => pushOffset(offset + limit)}
          >
            Next
          </Button>
        </div>
      </div>
      <ExecutionsTable
        items={data?.items ?? []}
        emptyTitle={
          hasFilters ? "No executions match filters" : "No executions yet"
        }
        emptyDescription={
          hasFilters
            ? "Try resetting filters or broadening the time range."
            : "When the Platform persists executions, they will appear here."
        }
      />
      <p className="text-[11px] text-muted-foreground">
        Total available: {total}
        {data?.has_more ? " · more pages available" : ""}
      </p>
    </div>
  );
}
