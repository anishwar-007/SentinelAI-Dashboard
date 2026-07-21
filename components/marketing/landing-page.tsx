"use client";

import Link from "next/link";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { ExecutionStatusBadge } from "@/components/executions/status-badge";

const DEMO_NODES = [
  { name: "User Query", status: "ok", latency: "—", detail: "refund window?" },
  { name: "Planner", status: "ok", latency: "120 ms", detail: "intent: retrieval" },
  { name: "Retriever", status: "ok", latency: "45 ms", detail: "3 chunks" },
  { name: "LLM", status: "ok", latency: "890 ms", detail: "gpt-oss-20b" },
  { name: "Verifier", status: "ok", latency: "210 ms", detail: "approved" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:pt-24">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          AI Execution Observability
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          {SITE.tagline}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          Trace, understand, and debug every AI execution — from prompts and
          retrieval to tools, models, verification, and failures.
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

      <section id="product" className="border-y border-border bg-card/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Interactive execution visualization
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            SentinelAI captures a hierarchical execution graph — the same shape
            you inspect in the dashboard Trace Graph.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-0">
            {DEMO_NODES.map((node, idx) => (
              <div key={node.name} className="flex flex-1 items-center gap-2 md:flex-col">
                <div className="w-full rounded-md border border-border bg-background p-3 md:min-h-[110px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium">{node.name}</span>
                    <ExecutionStatusBadge status={node.status} />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {node.latency}
                  </p>
                  <p className="mt-1 truncate font-mono text-[11px] text-foreground/80">
                    {node.detail}
                  </p>
                </div>
                {idx < DEMO_NODES.length - 1 ? (
                  <div className="hidden h-px w-4 bg-border md:block" />
                ) : null}
                {idx < DEMO_NODES.length - 1 ? (
                  <div className="h-4 w-px bg-border md:hidden" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Capabilities
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Trace",
              body: "Execution flow across planners, retrieval, model calls, tools, and verifiers — with parent/child span relationships.",
            },
            {
              title: "Debug",
              body: "Inspect inputs, outputs, tokens, latency, and failures at every span. Jump from waterfall timing to span payloads.",
            },
            {
              title: "Understand",
              body: "Surface verification outcomes and analysis when your runtime captures them — without locking SentinelAI to one agent framework.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-md border border-border bg-card/40 p-4"
            >
              <h3 className="font-mono text-sm font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Expose execution flow, prompts, retrieval, model calls, tools,
          verification, latency, and failures — from any customer AI application
          instrumented with the SentinelAI SDK.
        </p>
      </section>

      <section className="border-y border-border bg-card/20 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            SDK integration
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-background p-4 font-mono text-[12px] leading-relaxed text-foreground/90">{`from sentinelai import configure, execution, span

configure(publisher=stream, model_info=model_info)

@execution("query")
async def run(query: str):
    plan = await plan_query(query)
    return await answer(plan, query)

@span("planner")
async def plan_query(query: str):
    ...
`}</pre>
          <p className="mt-3 text-xs text-muted-foreground">
            Annotate business methods. The Platform consumes the Execution Stream —
            your app does not talk to the dashboard directly.
          </p>
        </div>
      </section>

      <section id="architecture" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Architecture
        </h2>
        <div className="mt-6 flex flex-col gap-2 font-mono text-sm">
          {[
            "Customer AI Application",
            "SentinelAI SDK",
            "Execution Stream",
            "SentinelAI Platform",
            "Dashboard",
          ].map((label, idx, arr) => (
            <div key={label} className="flex flex-col items-center">
              <div className="w-full max-w-md rounded-md border border-border bg-card/40 px-4 py-3 text-center">
                {label}
              </div>
              {idx < arr.length - 1 ? (
                <span className="py-1 text-muted-foreground">↓</span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card/30 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Your AI already runs.
            <br />
            Now understand what it&apos;s doing.
          </h2>
          <div className="mt-8 flex justify-center gap-3">
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
