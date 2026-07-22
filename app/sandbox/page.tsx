"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { MarketingNav } from "@/components/marketing/nav";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { JsonViewer } from "@/components/shared/json-viewer";
import { ExecutionStatusBadge } from "@/components/executions/status-badge";
import {
  type DemoMode,
  runDemoQuery,
  type DemoQueryResponse,
} from "@/lib/api/demo";
import { formatLatency, cn } from "@/lib/utils";

const MODES: { id: DemoMode; label: string; samples: string[] }[] = [
  {
    id: "rag",
    label: "RAG Question",
    samples: [
      "What is the refund window?",
      "How do I reset my password?",
      "Summarize the shipping policy.",
    ],
  },
  {
    id: "chat",
    label: "General Chat",
    samples: [
      "Explain SentinelAI in one sentence.",
      "What is an execution span?",
      "Why do AI systems need observability?",
    ],
  },
  {
    id: "invoice",
    label: "Invoice Extraction",
    samples: [
      "Invoice #4421 from Acme Corp, total $1,240.00 due 2026-08-01",
      "Vendor: Northwind, Amount: 89.50 USD, Date: July 1 2026",
    ],
  },
];

export default function SandboxPage() {
  const [mode, setMode] = useState<DemoMode>("rag");
  const [input, setInput] = useState(MODES[0].samples[0]);
  const [result, setResult] = useState<DemoQueryResponse | null>(null);

  const mutation = useMutation({
    mutationFn: () => runDemoQuery({ mode, input: input.slice(0, 500) }),
    onSuccess: setResult,
  });

  const active = MODES.find((m) => m.id === mode)!;

  return (
    <>
      <MarketingNav />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sandbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Run a public demo execution and inspect the resulting graph — no
            sign-in required. Production dashboard data stays private.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium",
                mode === m.id
                  ? "border-accent/40 bg-accent-muted text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
              onClick={() => {
                setMode(m.id);
                setInput(m.samples[0]);
                setResult(null);
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {active.samples.map((sample) => (
              <button
                key={sample}
                type="button"
                className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => setInput(sample)}
              >
                {sample}
              </button>
            ))}
          </div>
          <textarea
            className="min-h-28 w-full rounded-md border border-border bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            maxLength={500}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{input.length}/500</span>
            <Button
              type="button"
              disabled={!input.trim() || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Running…" : "Run Execution"}
            </Button>
          </div>
        </div>

        {mutation.isError ? (
          <ErrorState error={mutation.error} title="Sandbox execution failed" />
        ) : null}

        {result ? (
          <section className="space-y-3 rounded-md border border-border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <ExecutionStatusBadge status={result.status} />
              <span className="text-xs text-muted-foreground">
                {formatLatency(result.latency_ms)}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {result.execution_id}
              </span>
            </div>
            <JsonViewer value={result.answer} label="Answer" />
            <Button asChild>
              <Link href={`/sandbox/executions/${result.execution_id}`}>
                Inspect this execution
              </Link>
            </Button>
          </section>
        ) : null}
      </main>
    </>
  );
}
