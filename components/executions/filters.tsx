"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUSES = ["", "completed", "failed", "cancelled"] as const;

export function ExecutionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [draft, setDraft] = useState({
    status: "",
    execution_name: "",
    model: "",
    from_time: "",
    to_time: "",
    limit: "50",
  });

  useEffect(() => {
    setDraft({
      status: searchParams.get("status") ?? "",
      execution_name: searchParams.get("execution_name") ?? "",
      model: searchParams.get("model") ?? "",
      from_time: searchParams.get("from_time") ?? "",
      to_time: searchParams.get("to_time") ?? "",
      limit: searchParams.get("limit") ?? "50",
    });
  }, [searchParams]);

  const apply = useCallback(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(draft)) {
      if (value) params.set(key, value);
    }
    params.set("offset", "0");
    router.push(`/executions?${params.toString()}`);
  }, [draft, router]);

  const reset = useCallback(() => {
    setDraft({
      status: "",
      execution_name: "",
      model: "",
      from_time: "",
      to_time: "",
      limit: "50",
    });
    router.push("/executions");
  }, [router]);

  return (
    <div className="space-y-2 rounded-md border border-border bg-card/40 p-3">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        <label className="space-y-1 text-[11px] text-muted-foreground">
          Status
          <select
            className="flex h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground"
            value={draft.status}
            onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All"}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-[11px] text-muted-foreground">
          Execution name
          <Input
            value={draft.execution_name}
            onChange={(e) =>
              setDraft((d) => ({ ...d, execution_name: e.target.value }))
            }
            placeholder="query"
          />
        </label>
        <label className="space-y-1 text-[11px] text-muted-foreground">
          Model
          <Input
            value={draft.model}
            onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))}
            placeholder="model id"
          />
        </label>
        <label className="space-y-1 text-[11px] text-muted-foreground">
          From
          <Input
            type="datetime-local"
            value={toLocalInput(draft.from_time)}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                from_time: fromLocalInput(e.target.value),
              }))
            }
          />
        </label>
        <label className="space-y-1 text-[11px] text-muted-foreground">
          To
          <Input
            type="datetime-local"
            value={toLocalInput(draft.to_time)}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                to_time: fromLocalInput(e.target.value),
              }))
            }
          />
        </label>
        <label className="space-y-1 text-[11px] text-muted-foreground">
          Limit
          <select
            className="flex h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground"
            value={draft.limit}
            onChange={(e) => setDraft((d) => ({ ...d, limit: e.target.value }))}
          >
            {["25", "50", "100", "200"].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={apply}>
          Apply filters
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={reset}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string): string {
  if (!local) return "";
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}
