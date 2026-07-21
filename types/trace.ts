/** HTTP contracts for execution trace APIs. */

import type { SpanStatus } from "./api";

export interface SpanView {
  span_id: string;
  parent_span_id: string | null;
  name: string;
  status: SpanStatus;
  started_at: string;
  ended_at: string | null;
  latency_ms: number | null;
  input: unknown;
  output: unknown;
  model: string | null;
  tokens: Record<string, unknown> | null;
  error: string | null;
  attributes: Record<string, unknown>;
}

export interface ExecutionTraceView {
  trace_id: string;
  execution_id: string;
  started_at: string;
  completed_at: string | null;
  total_latency_ms: number | null;
  spans: SpanView[];
  metadata: Record<string, unknown>;
}

export interface SpanTreeNode extends SpanView {
  children: SpanTreeNode[];
  depth: number;
}
