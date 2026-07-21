"use client";

import Link from "next/link";
import { ExecutionStatusBadge } from "@/components/executions/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime, formatLatency, truncateId } from "@/lib/utils";
import type { ExecutionListItem } from "@/types/execution";

export function ExecutionsTable({
  items,
  emptyTitle = "No executions yet",
  emptyDescription = "When the Platform persists executions, they will appear here.",
}: {
  items: ExecutionListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Execution</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Intent</th>
            <th className="px-3 py-2 font-medium">Model</th>
            <th className="px-3 py-2 font-medium">Started</th>
            <th className="px-3 py-2 font-medium">Duration</th>
            <th className="px-3 py-2 font-medium">Trace</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.execution_id}
              className="border-t border-border hover:bg-muted/30"
            >
              <td className="px-3 py-2">
                <Link
                  href={`/executions/${item.execution_id}`}
                  className="block hover:underline"
                >
                  <div className="font-medium text-foreground">
                    {item.execution_name ?? "unnamed"}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {truncateId(item.execution_id)}
                  </div>
                </Link>
              </td>
              <td className="px-3 py-2">
                <ExecutionStatusBadge status={item.status} />
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {item.intent ?? "—"}
              </td>
              <td className="max-w-[180px] truncate px-3 py-2 font-mono text-[11px] text-muted-foreground">
                {item.model}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                {formatDateTime(item.started_at)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                {formatLatency(item.latency_ms)}
              </td>
              <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                {item.trace_id ? truncateId(item.trace_id) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
