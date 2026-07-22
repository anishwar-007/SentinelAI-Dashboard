/** Demo trace used on the marketing landing page — parent/child topology only. */

import type { ExecutionTraceView, SpanView } from "@/types/trace";

const t0 = Date.parse("2026-07-22T10:00:00.000Z");

function span(
  partial: Pick<
    SpanView,
    "span_id" | "parent_span_id" | "name" | "status" | "started_at" | "ended_at" | "latency_ms"
  > &
    Partial<SpanView>,
): SpanView {
  return {
    input: null,
    output: null,
    tokens: null,
    error: null,
    model: null,
    attributes: {},
    ...partial,
  };
}

function at(offsetMs: number): string {
  return new Date(t0 + offsetMs).toISOString();
}

/**
 * Illustrative execution tree for marketing.
 * Topology is derived from parent_span_id — not a hardcoded horizontal pipeline.
 */
export const DEMO_LANDING_SPANS: SpanView[] = [
  span({
    span_id: "demo-query",
    parent_span_id: null,
    name: "User Query",
    status: "ok",
    started_at: at(0),
    ended_at: at(8200),
    latency_ms: 8200,
    input: { query: "Why was my refund denied?" },
    attributes: { kind: "root" },
  }),
  span({
    span_id: "demo-planner",
    parent_span_id: "demo-query",
    name: "Planner",
    status: "ok",
    started_at: at(20),
    ended_at: at(620),
    latency_ms: 600,
    output: { intent: "refund_policy", steps: ["retrieve", "answer", "verify"] },
    attributes: { kind: "planner" },
  }),
  span({
    span_id: "demo-executor",
    parent_span_id: "demo-planner",
    name: "Executor",
    status: "ok",
    started_at: at(640),
    ended_at: at(6400),
    latency_ms: 5760,
    attributes: { kind: "executor" },
  }),
  span({
    span_id: "demo-retriever",
    parent_span_id: "demo-executor",
    name: "Retriever",
    status: "ok",
    started_at: at(660),
    ended_at: at(1100),
    latency_ms: 440,
    output: { chunks: 3 },
    attributes: { kind: "retrieval" },
  }),
  span({
    span_id: "demo-llm",
    parent_span_id: "demo-executor",
    name: "LLM Call",
    status: "ok",
    started_at: at(1120),
    ended_at: at(4200),
    latency_ms: 3080,
    model: "gpt-oss-20b",
    tokens: { prompt: 1240, completion: 318, total: 1558 },
    attributes: { kind: "llm" },
  }),
  span({
    span_id: "demo-tool",
    parent_span_id: "demo-executor",
    name: "Tool Call",
    status: "ok",
    started_at: at(1180),
    ended_at: at(1680),
    latency_ms: 500,
    output: { tool: "policy_lookup", hit: true },
    attributes: { kind: "tool" },
  }),
  span({
    span_id: "demo-verifier",
    parent_span_id: "demo-executor",
    name: "Verifier",
    status: "ok",
    started_at: at(4250),
    ended_at: at(5100),
    latency_ms: 850,
    output: { verdict: "approved", confidence: 0.91 },
    attributes: { kind: "verification" },
  }),
  span({
    span_id: "demo-rca",
    parent_span_id: "demo-verifier",
    name: "Root Cause Analysis",
    status: "ok",
    started_at: at(5120),
    ended_at: at(6100),
    latency_ms: 980,
    output: { signal: "policy_window_mismatch" },
    attributes: { kind: "analysis" },
  }),
];

export const DEMO_LANDING_TRACE: ExecutionTraceView = {
  trace_id: "demo-landing-trace",
  execution_id: "demo-landing-execution",
  started_at: at(0),
  completed_at: at(8200),
  total_latency_ms: 8200,
  spans: DEMO_LANDING_SPANS,
  metadata: { source: "landing-demo" },
};
