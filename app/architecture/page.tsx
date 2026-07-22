import Link from "next/link";
import { MarketingNav } from "@/components/marketing/nav";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

const LAYERS = [
  {
    title: "Customer AI Application",
    body: "Your agents, workflows, tools, and models — instrumented where business logic runs.",
  },
  {
    title: "SentinelAI SDK",
    body: "Lightweight decorators and span helpers that emit structured execution events.",
  },
  {
    title: "Execution Stream",
    body: "Durable event stream carrying spans, payloads, status, and timing metadata.",
  },
  {
    title: "SentinelAI Platform",
    body: "Ingest, normalize, store, and index executions for query and analysis.",
  },
  {
    title: "Dashboard",
    body: "Graph, waterfall, and inspectors so engineers can answer what happened — fast.",
  },
];

export default function ArchitecturePage() {
  return (
    <>
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Architecture
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          How {SITE.name} is built
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          The product story on the landing page stays focused on value. This page
          documents the technical path from instrumentation to the dashboard.
        </p>

        <ol className="mt-10 space-y-0">
          {LAYERS.map((layer, idx) => (
            <li key={layer.title} className="relative pl-8">
              <span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card font-mono text-[10px] text-muted-foreground">
                {idx + 1}
              </span>
              {idx < LAYERS.length - 1 ? (
                <span
                  className="absolute left-[9px] top-7 h-[calc(100%-8px)] w-px bg-border"
                  aria-hidden
                />
              ) : null}
              <div className="pb-8">
                <h2 className="text-sm font-semibold text-foreground">
                  {layer.title}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{layer.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-8">
          <Button asChild>
            <Link href="/sandbox">Try Sandbox</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/#product">Back to product</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
