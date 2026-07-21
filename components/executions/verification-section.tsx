"use client";

import { ExecutionStatusBadge } from "@/components/executions/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonViewer } from "@/components/shared/json-viewer";

export function VerificationSection({
  data,
}: {
  data: Record<string, unknown> | null;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Verification
      </h3>
      {!data ? (
        <EmptyState title="No verification data" />
      ) : isRecognizableVerification(data) ? (
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="flex flex-wrap items-center gap-2">
            {typeof data.verdict === "string" ? (
              <ExecutionStatusBadge status={data.verdict} />
            ) : null}
            {typeof data.confidence === "number" ? (
              <span className="text-xs text-muted-foreground">
                confidence {(data.confidence * 100).toFixed(0)}%
              </span>
            ) : null}
          </div>
          {typeof data.summary === "string" ? (
            <p className="text-sm text-foreground">{data.summary}</p>
          ) : null}
          {Array.isArray(data.scores) ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="py-1 pr-3">Score</th>
                    <th className="py-1 pr-3">Value</th>
                    <th className="py-1 pr-3">Passed</th>
                    <th className="py-1">Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {data.scores.map((raw, idx) => {
                    const score = asRecord(raw);
                    if (!score) return null;
                    return (
                      <tr key={idx} className="border-t border-border">
                        <td className="py-1.5 pr-3">
                          {String(score.name ?? "—")}
                        </td>
                        <td className="py-1.5 pr-3 font-mono text-xs">
                          {typeof score.score === "number"
                            ? score.score.toFixed(2)
                            : "—"}
                        </td>
                        <td className="py-1.5 pr-3">
                          {String(score.passed ?? "—")}
                        </td>
                        <td className="py-1.5 text-muted-foreground">
                          {String(score.explanation ?? "")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
          <JsonViewer value={data} label="Raw verification" defaultCollapsed />
        </div>
      ) : (
        <JsonViewer value={data} label="verification" />
      )}
    </section>
  );
}

function isRecognizableVerification(data: Record<string, unknown>): boolean {
  return (
    "verdict" in data ||
    "scores" in data ||
    "summary" in data ||
    "confidence" in data
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
