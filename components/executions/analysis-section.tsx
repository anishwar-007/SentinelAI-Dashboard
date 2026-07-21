"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { JsonViewer } from "@/components/shared/json-viewer";
import { Badge } from "@/components/ui/badge";

export function AnalysisSection({
  data,
}: {
  data: Record<string, unknown> | null;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Analysis / Root cause
      </h3>
      {!data ? (
        <EmptyState title="No analysis data" />
      ) : isRecognizableAnalysis(data) ? (
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="flex flex-wrap items-center gap-2">
            {typeof data.primary_component === "string" ? (
              <Badge variant="info">{data.primary_component}</Badge>
            ) : null}
            {typeof data.severity === "string" ? (
              <Badge
                variant={
                  data.severity === "critical" || data.severity === "high"
                    ? "danger"
                    : "warning"
                }
              >
                {data.severity}
              </Badge>
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
          {typeof data.recommendation === "string" ? (
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Recommendation
              </p>
              <p className="text-sm text-foreground">{data.recommendation}</p>
            </div>
          ) : null}
          {Array.isArray(data.evidence) && data.evidence.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {data.evidence.map((item, idx) => (
                <li key={idx}>{String(item)}</li>
              ))}
            </ul>
          ) : null}
          <JsonViewer value={data} label="Raw analysis" defaultCollapsed />
        </div>
      ) : (
        <JsonViewer value={data} label="analysis" />
      )}
    </section>
  );
}

function isRecognizableAnalysis(data: Record<string, unknown>): boolean {
  return (
    "primary_component" in data ||
    "severity" in data ||
    "recommendation" in data ||
    "evidence" in data ||
    "summary" in data
  );
}
