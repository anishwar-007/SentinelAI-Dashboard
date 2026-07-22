"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { TraceGraph } from "@/components/traces/trace-graph";
import { SpanInspector } from "@/components/traces/span-inspector";
import { ClientOnly } from "@/components/shared/client-only";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_LANDING_SPANS } from "@/lib/demo-landing-trace";
import type { SpanView } from "@/types/trace";

const CAPABILITIES = [
  {
    title: "Trace",
    body: "Visualize every step.",
  },
  {
    title: "Debug",
    body: "Inspect inputs, outputs, latency and failures.",
  },
  {
    title: "Understand",
    body: "Surface verification and root-cause signals.",
  },
  {
    title: "Improve",
    body: "Compare executions and eventually replay or evaluate changes.",
  },
];

const PRODUCT_STEPS = [
  {
    title: "Instrument",
    detail: "Annotate executions and spans in your app.",
  },
  {
    title: "Observe",
    detail: "Trace · Debug · Evaluate · Replay",
  },
  {
    title: "Improve",
    detail: "Find latency, failures, and root causes.",
  },
];

export function LandingPage() {
  const [selected, setSelected] = useState<SpanView | null>(null);
  const parentName = selected?.parent_span_id
    ? DEMO_LANDING_SPANS.find((s) => s.span_id === selected.parent_span_id)
        ?.name ?? null
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 md:pb-16 md:pt-20">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {SITE.name}
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl md:leading-[1.05]">
          {SITE.tagline}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Trace, debug, and understand AI executions — so engineers can see what
          happened, where it failed, and what took the most time.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/sandbox">Try the Sandbox</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={SITE.githubUrl} target="_blank" rel="noreferrer">
              View on GitHub
            </a>
          </Button>
        </div>
      </section>

      {/* Interactive execution visualization */}
      <section id="product" className="border-y border-border bg-card/40 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Interactive execution visualization
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            A real parent/child execution graph — the same model you inspect in
            the dashboard. Click a node to open the inspector.
          </p>
          <div className="mt-6 overflow-x-auto">
            <ClientOnly fallback={<Skeleton className="h-[420px] w-full" />}>
              <TraceGraph
                spans={DEMO_LANDING_SPANS}
                selectedId={selected?.span_id}
                onSelect={setSelected}
                heightClass="h-[420px] min-w-[640px]"
              />
            </ClientOnly>
          </div>
          <SpanInspector
            span={selected}
            parentName={parentName}
            open={Boolean(selected)}
            onOpenChange={(open) => {
              if (!open) setSelected(null);
            }}
          />
        </div>
      </section>

      {/* Product story */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          How it works
        </h2>
        <div className="mt-8 flex flex-col items-center gap-3">
          <StoryBox title="Your AI Application" subtle />
          <ArrowDown />
          <div className="w-full max-w-md rounded-md border border-border bg-card px-5 py-4 text-center">
            <p className="text-sm font-semibold tracking-tight">{SITE.name}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Trace · Debug · Evaluate · Replay
            </p>
          </div>
          <ArrowDown />
          <StoryBox title="Execution Intelligence" subtle />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {PRODUCT_STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-md border border-border px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {String(i + 1).padStart(2, "0")} · {step.title}
              </p>
              <p className="mt-2 text-sm text-foreground">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-y border-border bg-card/30 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Capabilities
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((item) => (
              <div key={item.title} className="border-l-2 border-accent/40 pl-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDK / Docs anchor */}
      <section id="docs" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          SDK integration
        </h2>
        <p className="mt-2 text-lg font-medium tracking-tight text-foreground">
          Instrument in minutes.
        </p>
        <pre className="mt-5 overflow-x-auto rounded-md border border-border bg-card px-4 py-4 font-mono text-[12px] leading-relaxed text-foreground/90">{`from sentinelai import execution, span

@execution("support-agent")
async def run(query: str):
    plan = await plan(query)
    return await answer(plan, query)

@span("planner")
async def plan(query: str):
    ...
`}</pre>
        <p className="mt-3 text-sm text-muted-foreground">
          Annotate business methods. SentinelAI captures the execution graph
          automatically.
        </p>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border bg-card/40 py-14">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Your AI already runs.
            <br />
            Now understand what it&apos;s doing.
          </h2>
          <div className="mt-7 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/sandbox">Try Sandbox</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={SITE.githubUrl} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StoryBox({ title, subtle }: { title: string; subtle?: boolean }) {
  return (
    <div
      className={
        subtle
          ? "w-full max-w-sm rounded-md border border-dashed border-border px-4 py-3 text-center text-sm text-muted-foreground"
          : "w-full max-w-md rounded-md border border-border bg-card px-4 py-3 text-center text-sm font-medium"
      }
    >
      {title}
    </div>
  );
}

function ArrowDown() {
  return (
    <span className="font-mono text-sm text-muted-foreground" aria-hidden>
      ↓
    </span>
  );
}
